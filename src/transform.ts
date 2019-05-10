/**
    Message Transforming
    ~~~~~~~~~~~~~~~~~~~~

    Instant Message <-> Secure Message <-> Reliable Message
    +-------------+     +------------+     +--------------+
    |  sender     |     |  sender    |     |  sender      |
    |  receiver   |     |  receiver  |     |  receiver    |
    |  time       |     |  time      |     |  time        |
    |             |     |            |     |              |
    |  content    |     |  data      |     |  data        |
    +-------------+     |  key/keys  |     |  key/keys    |
                        +------------+     |  signature   |
                                           +--------------+
    Algorithm:
        data      = password.encrypt(content)
        key       = receiver.public_key.encrypt(password)
        signature = sender.private_key.sign(data)
 */
import {Message} from './message'
import {Content} from './content'

/**
    Instant Message
    ~~~~~~~~~~~~~~~

    data format: {
        //-- envelope
        sender   : "moki@xxx",
        receiver : "hulk@yyy",
        time     : 123,
        //-- content
        content  : {...}
    }
 */
interface InstantMessage extends Message {
    content: Content
}

/**
    Secure Message
    ~~~~~~~~~~~~~~
    Instant Message encrypted by a symmetric key

    data format: {
        //-- envelope
        sender   : "moki@xxx",
        receiver : "hulk@yyy",
        time     : 123,
        //-- content data & key/keys
        data     : "...",  // base64_encode(symmetric)
        key      : "...",  // base64_encode(asymmetric)
        keys     : {
            "ID1": "key1", // base64_encode(asymmetric)
        }
    }
*/
interface SecureMessage extends Message {
    data: string
    key?: string
    keys?: Keys
    group?: string
}

/**
    This class is used to sign the SecureMessage
    It contains a 'signature' field which signed with sender's private key
 */
interface ReliableMessage extends SecureMessage {
    signature: string
    meta: any
}

interface Keys {
    [key: string]: string;
}

interface Encryptor {
    encryptKey(msg: InstantMessage, key: string, receiver: string): Buffer
    encryptContent(msg: InstantMessage, content: Content, key: string): Buffer
}

interface Decryptor {
    decryptKey(msg: SecureMessage, key: Buffer, sender: string, receiver: string, group: string | undefined): string
    decryptContent(msg: SecureMessage, data: Buffer, key: string): Content
}

interface Signer {
    sign(msg: SecureMessage, data: Buffer, sender: string): Buffer
    verify(msg: ReliableMessage, data: Buffer, signature: Buffer, sender: string): boolean
}

 interface Crypto extends Encryptor, Decryptor, Signer {

}

class Transform {
    public crypto: Crypto

    public constructor(crypto: Crypto) {
        this.crypto = crypto
    }

    /**
        Encrypt message content with password(symmetric key)

        :param password: A symmetric key for encrypting message content
        :param members:  If this is a group message, get all members here
        :return: SecureMessage object
     */
    public encrypt(ins: InstantMessage, password: string, members: Array<string> | undefined = undefined): SecureMessage {
        let data = this.crypto.encryptContent(ins, ins.content, password).toString('base64')
        
        let key = null
        if (!members) {
            key = this.crypto.encryptKey(ins, password, ins.receiver).toString('base64')
            // TODO reused key for contact when key = null?
            return Object.assign({key, data}, ins)
        } else {
            let keys: Keys = {}
            for (const member of members) {
                let key = this.crypto.encryptKey(ins, password, ins.receiver).toString('base64')
                keys[member] = key
            }
            return Object.assign({keys, data}, ins)
        }
    }

    public decrypt(sec: SecureMessage, member: string | undefined = undefined): InstantMessage {
        let group = sec.group
        let key = sec.key
        if (member) {
            if (!group) {
                group = sec.receiver
            }
            if (sec.keys) {
                key = sec.keys[member]
            }
        }
        if (!key) {
            throw new TypeError(`decrypt key not found: ${JSON.stringify(sec)}`)
        }

        let password = this.crypto.decryptKey(sec, Buffer.from(key, 'base64'), sec.sender, sec.receiver, group)
        let content = this.crypto.decryptContent(sec, Buffer.from(sec.data, 'base64'), password)

        return {
            sender: sec.sender,
            receiver: sec.receiver,
            time: sec.time,
            content: content
        }
    }

    public sign(sec: SecureMessage): ReliableMessage {
        let signature = this.crypto.sign(sec, Buffer.from(sec.data, 'base64'), sec.sender).toString('base64')
        let meta = null
        return Object.assign({signature, meta}, sec)
    }

    public split(sec: SecureMessage, members: Array<string>): Array<SecureMessage> {
        let secs: Array<SecureMessage> = []
        let keys = sec.keys || {}
        delete sec.keys
        for (const member of members) {
            let key = keys[member]
            let memberSec = Object.assign({}, sec)
            memberSec.key = key
            secs.push(memberSec)
        }
        return secs
    }

    public trim(sec: SecureMessage, member: string) {
        let key = sec.keys && sec.keys[member] || null
        let keys = null
        return Object.assign({}, sec, {key, keys})
    }
 
    public verify(rel: ReliableMessage): SecureMessage {
        if (!this.crypto.verify(rel, Buffer.from(rel.data, 'base64'), Buffer.from(rel.key as string), rel.sender)) {
            throw new Error(`verify signature failed ${rel}`)
        }
        let sec = Object.assign({}, rel)
        delete sec.signature
        return sec
    }
}

export {InstantMessage, SecureMessage, ReliableMessage, Transform, Crypto}
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
    // TODO dkd depends on mkm.ID
    // TODO InstantMessage no use
    encryptKey(iMsg: InstantMessage, key: string, receiver: string): string
    encryptContent(iMsg: InstantMessage, content: Content, key: string): string
}

interface Decryptor {
    // TODO dkd depends on mkm.Group
    decryptKey(sMsg: SecureMessage, encryptedKey: string, sender: string, receiver: string, group: string | undefined): string
    decryptContent(sMsg: SecureMessage, encryptedContent: string, key: string): Content
}

interface Signer {
    sign(sMsg: SecureMessage, data: string, sender: string): string
    verify(sMsg: ReliableMessage, data: string, signature: string, sender: string): boolean
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
    public encrypt(iMsg: InstantMessage, password: string, members: string[] | undefined = undefined): SecureMessage {
        let data = this.crypto.encryptContent(iMsg, iMsg.content, password)
        
        let key = null
        if (!members) {
            key = this.crypto.encryptKey(iMsg, password, iMsg.receiver)
            // TODO reused key for contact when key = null?
            return Object.assign({key, data}, iMsg)
        } else {
            let keys: Keys = {}
            for (const member of members) {
                let key = this.crypto.encryptKey(iMsg, password, iMsg.receiver)
                keys[member] = key
            }
            return Object.assign({keys, data}, iMsg)
        }
    }

    public decrypt(sMsg: SecureMessage, member: string | undefined = undefined): InstantMessage {
        let group = sMsg.group
        let key = sMsg.key
        if (member) {
            if (!group) {
                group = sMsg.receiver
            }
            if (sMsg.keys) {
                key = sMsg.keys[member]
            }
        }
        if (!key) {
            throw new TypeError(`decrypt key not found: ${JSON.stringify(sMsg)}`)
        }

        let password = this.crypto.decryptKey(sMsg, key, sMsg.sender, sMsg.receiver, group)
        let content = this.crypto.decryptContent(sMsg, sMsg.data, password)

        return {
            sender: sMsg.sender,
            receiver: sMsg.receiver,
            time: sMsg.time,
            content: content
        }
    }

    public sign(sMsg: SecureMessage): ReliableMessage {
        let signature = this.crypto.sign(sMsg, sMsg.data, sMsg.sender)
        let meta = null
        return Object.assign({signature, meta}, sMsg)
    }

    public split<T extends SecureMessage>(sMsg: T, members: string[]): T[] {
        let secs: T[] = []
        let keys = sMsg.keys || {}
        delete sMsg.keys
        for (const member of members) {
            let key = keys[member]
            let memberSec = Object.assign({}, sMsg)
            memberSec.key = key
            secs.push(memberSec)
        }
        return secs
    }

    public trim(sMsg: SecureMessage, member: string) {
        let key = sMsg.keys && sMsg.keys[member] || null
        let keys = null
        return Object.assign({}, sMsg, {key, keys})
    }
 
    public verify(rMsg: ReliableMessage): SecureMessage {
        // TODO check rMsg.key as string
        if (!this.crypto.verify(rMsg, rMsg.data, rMsg.key as string, rMsg.sender)) {
            throw new Error(`verify signature failed ${rMsg}`)
        }
        let sMsg = Object.assign({}, rMsg)
        delete sMsg.signature
        return sMsg
    }
}

export {InstantMessage, SecureMessage, ReliableMessage, Transform, Crypto}
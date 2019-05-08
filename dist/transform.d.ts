/// <reference types="node" />
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
import { Message } from './message';
import { Content } from './content';
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
    content: Content;
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
    data: string;
    key: string | null;
    keys: Keys | null;
    group: string | null;
}
/**
    This class is used to sign the SecureMessage
    It contains a 'signature' field which signed with sender's private key
 */
interface ReliableMessage extends SecureMessage {
    signature: string;
    meta: any;
}
interface Keys {
    [key: string]: string;
}
interface Encryptor {
    encryptKey(msg: InstantMessage, key: string, receiver: string): Buffer;
    encryptContent(msg: InstantMessage, content: Content, key: string): Buffer;
}
interface Decryptor {
    decryptKey(msg: SecureMessage, key: Buffer, sender: string, receiver: string, group: string | null): string;
    decryptContent(msg: SecureMessage, data: Buffer, key: string): Content;
}
interface Signer {
    sign(msg: SecureMessage, data: Buffer, sender: string): Buffer;
    verify(msg: ReliableMessage, data: Buffer, signature: Buffer, sender: string): boolean;
}
interface Crypto extends Encryptor, Decryptor, Signer {
}
declare class Transform {
    crypto: Crypto;
    constructor(crypto: Crypto);
    /**
        Encrypt message content with password(symmetric key)

        :param password: A symmetric key for encrypting message content
        :param members:  If this is a group message, get all members here
        :return: SecureMessage object
     */
    encrypt(ins: InstantMessage, password: string, members?: Array<string> | null): SecureMessage;
    decrypt(sec: SecureMessage, member?: string | null): InstantMessage;
    sign(sec: SecureMessage): ReliableMessage;
    split(sec: SecureMessage, members: Array<string>): Array<SecureMessage>;
    trim(sec: SecureMessage, member: string): SecureMessage & {
        key: string | null;
        keys: null;
    };
    verify(rel: ReliableMessage): SecureMessage;
}
export { InstantMessage, SecureMessage, ReliableMessage, Transform, Crypto };

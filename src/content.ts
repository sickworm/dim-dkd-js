/**
    Message Content
    ~~~~~~~~~~~~~~~

    data format: {
        'type'    : 0x00,            // message type
        'sn'      : 0,               // serial number

        'group'   : 'Group ID',      // for group message

        'text'    : 'text',          // for text message
        'command' : 'Command Name',  // for system command
        ...
    }
 */
enum MessageType {
    Text = 0x01,     // 0000 0001

    File = 0x10,     // 0001 0000
    Image = 0x12,    // 0001 0010
    Audio = 0x14,    // 0001 0100
    Video = 0x16,    // 0001 0110

    Page = 0x20,     // 0010 0000

    Command = 0x88,  // 1000 1000
    History = 0x89,  // 1000 1001 (Entity history command)

    // top-secret message forward by proxy (Service Provider)
    Forward = 0xFF,  // 1111 1111
}

class Content {
    // public type: number
    // public serialNumber: number
    // public group: string
    [key: string]: any

    public constructor(msg: any) {
        if (!msg) {
            throw new TypeError(`invalid argument msg: ${JSON.stringify(msg)}`)
        }
        for (const key in msg) {
            if (key in msg) {
                this[key] = msg[key]
            }
        }
    }

    public static fromType (type: number) {
        
    }
}

export {MessageType, Content}
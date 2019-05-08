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
declare enum MessageType {
    Text = 1,
    File = 16,
    Image = 18,
    Audio = 20,
    Video = 22,
    Page = 32,
    Command = 136,
    History = 137,
    Forward = 255
}
interface Content {
    type: number;
    serialNumber: number;
    group: string;
    [key: string]: any;
}
export { MessageType, Content };

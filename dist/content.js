"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Text"] = 1] = "Text";
    MessageType[MessageType["File"] = 16] = "File";
    MessageType[MessageType["Image"] = 18] = "Image";
    MessageType[MessageType["Audio"] = 20] = "Audio";
    MessageType[MessageType["Video"] = 22] = "Video";
    MessageType[MessageType["Page"] = 32] = "Page";
    MessageType[MessageType["Command"] = 136] = "Command";
    MessageType[MessageType["History"] = 137] = "History";
    // top-secret message forward by proxy (Service Provider)
    MessageType[MessageType["Forward"] = 255] = "Forward";
})(MessageType || (MessageType = {}));
exports.MessageType = MessageType;

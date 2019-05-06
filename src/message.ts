
interface Envelope {
    sender: string
    receiver: string
    time: number
}

interface MessageConstructor extends Envelope {
    [key: string]: any
}

class Message implements MessageConstructor {
    sender: string
    receiver: string
    time: number
    [key: string]: any
    
    public constructor(msg: MessageConstructor) {
        this.sender = msg.sender
        this.receiver = msg.receiver
        this.time = msg.time
        for (const key in msg) {
            if (msg.hasOwnProperty(key)) {
                this[key] = msg[key]
            }
        }
    }
}

export {Envelope, MessageConstructor, Message}
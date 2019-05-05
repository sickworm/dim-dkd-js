
class Envelope {
    public readonly sender: string
    public readonly receiver: string
    public readonly time: number
    
    public constructor(sender: string, receiver: string, time: number) {
        this.sender = sender
        this.receiver = receiver
        this.time = time
    }
}

class Message {
    public readonly envelope: Envelope
    [key: string]: any

    public constructor(msg: any) {
        this.envelope = new Envelope(msg.sender, msg.receiver, msg.time)
        for (const key in msg) {
            if (key in msg) {
                this[key] = msg[key]
            }
        }
    }
}

export {Envelope, Message}
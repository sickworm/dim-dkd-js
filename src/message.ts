
interface Envelope {
    sender: string
    receiver: string
    time: number
}

interface Message extends Envelope {
    [key: string]: any
}

export {Envelope, Message}
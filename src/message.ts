
interface Envelope {
    sender: string
    receiver: string
    time: number
}

interface Message extends Envelope {
    // TODO dkd depends on mkm.Group
    /**
     *  Group ID
     *  ~~~~~~~~
     *  when a group message was split/trimmed to a single message
     *  the 'receiver' will be changed to a member ID, and
     *  the group ID will be saved as 'group'.
     *
     * @return group string
     */
    group?: string
    [key: string]: any
}

export {Envelope, Message}
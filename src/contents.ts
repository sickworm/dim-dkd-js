/**
    Message Contents
    ~~~~~~~~~~~~~~~~

    Extents from Content
 */

import {Content} from './content'

interface TextContent extends Content {
    text: string
}

interface CommandContent extends Content {
    command: string,
    [key: string]: any // extra
}

interface HistoryContent extends CommandContent {
    time: number
}

interface ForwardContent extends Content {
    forward: any
}

export {TextContent, CommandContent, HistoryContent, ForwardContent}
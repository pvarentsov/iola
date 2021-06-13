import { MessageFormat, PackedMessage, PackedMessageInfo, UnpackedMessage } from '@iola/core/common'
import { inspect } from 'util'

export class MessageUtil {
  static packToString<TMessage>(message: TMessage): PackedMessageInfo {
    const data = typeof message === 'string'
      ? message
      : JSON.stringify(message) + ''

    const format = typeof message === 'object' && message !== null
      ? MessageFormat.JSON
      : MessageFormat.String

    return {format, data}
  }

  static packToBuffer(message: string | number[]): PackedMessageInfo {
    const info: PackedMessageInfo = {
      format: MessageFormat.ByteArray,
      data: Buffer.from(message)
    }

    return info
  }

  static unpack(message: PackedMessage): UnpackedMessage {
    const info: UnpackedMessage = {
      format: MessageFormat.String,
      message: ''
    }

    if (typeof message === 'string') {
      if (message.includes('{') || message.includes('[')) {
        try {
          info.message = JSON.parse(message)
          info.format = MessageFormat.JSON
        } catch (error) {}
      }
      else {
        info.message = message
        info.format = MessageFormat.String
      }
    }
    else {
      info.message = Array.from(new Uint8Array(message as Buffer))
      info.format = MessageFormat.ByteArray
    }

    return info
  }

  static humanize(message: UnpackedMessage): string {
    if (typeof message === 'string') {
      return message
    }

    return inspect(message, {
      colors: true,
      compact: true,
      depth: null,
    })
  }
}

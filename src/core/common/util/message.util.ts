import { inspect } from 'util'
import { MessageFormat } from '../enum/message.enum'
import { PackedMessage, PackedMessageInfo, UnpackedMessage } from '../type/message.type'

export class MessageUtil {
  static packToString<TMessage>(message: TMessage): PackedMessageInfo {
    const info: PackedMessageInfo = {
      format: MessageFormat.String,
      data: JSON.stringify(message) + ''
    }

    if (typeof message === 'object' && message !== null) {
      info.format = MessageFormat.JSON
    }

    return info
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

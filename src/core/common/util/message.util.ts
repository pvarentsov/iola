import { inspect } from 'util'
import { MessageFormat } from '../enum/message.enum'
import { PackedMessage, PackedMessageInfo, UnpackedMessage } from '../type/message.type'

export class MessageUtil {
  static pack<TMessage>(message: TMessage, format: MessageFormat): PackedMessageInfo {
    const info: PackedMessageInfo = {
      format: format,
      data: ''
    }

    if (format === MessageFormat.ByteArray) {
      info.data = Buffer.from(message as any)
      return info
    }

    if (typeof message === 'string') {
      info.data = message
    }
    else {
      info.data = JSON.stringify(message) + ''
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

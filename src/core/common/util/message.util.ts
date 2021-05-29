import { ParsedMessage, RawMessage } from '../type/message.type'
import { inspect } from 'util'

export class MessageUtil {
  static parseRawMessage(message: RawMessage): ParsedMessage {
    let stringMessage = ''

    if (message instanceof Buffer) {
      stringMessage = message.toString()
    }
    if (message instanceof ArrayBuffer) {
      stringMessage = Buffer.from(message).toString()
    }
    if (Array.isArray(message)) {
      stringMessage = Buffer.concat(message).toString()
    }
    if (typeof message === 'string') {
      stringMessage = message
    }

    let parsed = stringMessage

    try {
      parsed = JSON.parse(stringMessage)
    } catch (error) {}

    return parsed
  }

  static humanize(message: ParsedMessage): string {
    if (typeof message === 'string') {
      return message
    }
    return inspect(message, {
      colors: true,
      compact: true,
    })
  }
}
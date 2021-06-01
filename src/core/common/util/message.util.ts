import { inspect } from 'util'
import { Optional } from '../type/common.type'
import { RawMessage, UnpackedMessage } from '../type/message.type'

export class MessageUtil {
  static packToStr<TMessage>(message: TMessage): string {
    if (typeof message === 'string') {
      return message
    }

    return JSON.stringify(message) || message + ''
  }

  static packToBuffer(message: string): Buffer {
    return Buffer.from(message)
  }

  static unpack(rawMessage: RawMessage): UnpackedMessage {
    let asString: Optional<string>

    if (typeof rawMessage === 'string') {
      asString = rawMessage
    }
    if (rawMessage instanceof Buffer) {
      asString = rawMessage.toString()
    }
    if (rawMessage instanceof ArrayBuffer) {
      asString = Buffer.from(rawMessage).toString()
    }
    if (Array.isArray(rawMessage)) {
      asString = Buffer.concat(rawMessage).toString()
    }

    let result = typeof asString === 'string'
      ? asString
      : JSON.stringify(rawMessage)

    try {
      result = JSON.parse(result)
    } catch (error) {}

    return result
  }

  static humanize(message: UnpackedMessage): string {
    if (typeof message === 'string') {
      return message
    }
    return inspect(message, {
      colors: true,
      compact: true,
    })
  }
}
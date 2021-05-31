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
    let stringified: Optional<string>

    if (typeof rawMessage === 'string') {
      stringified = rawMessage
    }
    if (rawMessage instanceof Buffer) {
      stringified = rawMessage.toString()
    }
    if (rawMessage instanceof ArrayBuffer) {
      stringified = Buffer.from(rawMessage).toString()
    }
    if (Array.isArray(rawMessage)) {
      stringified = Buffer.concat(rawMessage).toString()
    }

    let unpacked = stringified || JSON.stringify(rawMessage)

    try {
      unpacked = JSON.parse(unpacked)
    } catch (error) {}

    return unpacked
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
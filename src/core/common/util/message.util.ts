import { inspect } from 'util'

import {
  MessageFormat, MessageRequestIdInfo,
  Optional,
  PackedMessage,
  PackedMessageInfo,
  UnpackedMessage,
  UnpackedMessageInfo,
} from '@iola/core/common'

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

  static unpack(message: PackedMessage): UnpackedMessageInfo {
    const info: UnpackedMessageInfo = {
      format: MessageFormat.String,
      data: ''
    }

    if (typeof message === 'string') {
      if (message.includes('{') || message.includes('[')) {
        try {
          info.data = JSON.parse(message)
          info.format = MessageFormat.JSON
        } catch (error) {}
      }
      else {
        info.data = message
        info.format = MessageFormat.String
      }
    }
    else {
      info.data = Array.from(new Uint8Array(message as Buffer))
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
      maxArrayLength: 16,
      maxStringLength: 50,
      depth: 2,
    })
  }

  static findRequestId(message: any): Optional<MessageRequestIdInfo> {
    const requestIdKeys = [
      'requestid',
      'request_id',
      'reqid',
      'req_id',
      'traceid',
      'trace_id',
    ]

    let requestIdKey: Optional<string>

    if (typeof message === 'object' && message !== null && !Array.isArray(message)) {
      Object.keys(message).forEach(key => {
        if (requestIdKeys.includes(key.toLowerCase())) {
          requestIdKey = key
        }
      })
    }

    return requestIdKey
      ? {key: requestIdKey, value: message[requestIdKey]}
      : undefined
  }
}

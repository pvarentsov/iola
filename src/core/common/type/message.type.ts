import { AnyObject, MessageFormat } from '@iola/core/common'

export type PackedMessage = string | Buffer | ArrayBuffer | Buffer[]
export type UnpackedMessage = string | AnyObject | AnyObject[] | Uint8Array

export type UnpackedMessageInfo = {
  format: MessageFormat
  data: UnpackedMessage
}

export type PackedMessageInfo = {
  format: MessageFormat
  data: PackedMessage
}

export type AnyMessageInfo = {
  format: MessageFormat
  data: any
}

export type MessageRequestIdInfo = {
  key: string
  value: any
}

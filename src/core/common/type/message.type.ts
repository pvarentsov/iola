import { MessageFormat } from '../enum/message.enum'
import { AnyObject } from './object.type'

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

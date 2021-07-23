import { AnyObject, BinaryEncoding, SocketIOTransport } from '@iola/core/common'
import { SocketEventType, SocketType } from '@iola/core/socket'

export type SocketOptions = {
  type: SocketType,
  address: string,
  connectionTimeout: number,
  reconnectionInterval: number,
  replyTimeout: number,
  ioAuth?: AnyObject,
  ioTransport?: SocketIOTransport,
  binaryEncoding?: BinaryEncoding,
}

export type SocketInfo = {
  type: SocketType,
  address: string,
  originalAddress: string,
  connected: boolean,
}

export type SocketEvent<TMessage = any> = {
  id?: number
  type: SocketEventType,
  date: Date,
  message: TMessage,
}

export type SocketSendReply<TReply = any> = {
  messageId: number,
  reply?: TReply
}

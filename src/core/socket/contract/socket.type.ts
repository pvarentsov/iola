import { AnyObject, BinaryEncoding, SocketIOTransport } from '@iola/core/common'
import { SocketEventType, SocketType } from '@iola/core/socket'

export type SocketOptions = {
  type: SocketType,
  address: string,
  connectionTimeout: number,
  reconnectionInterval: number,
  replyTimeout: number,
  headers?: AnyObject,
  ioAuth?: AnyObject,
  ioTransport?: SocketIOTransport,
  netSync?: boolean,
  binaryEncoding?: BinaryEncoding,
}

export type SocketInfo = {
  type: SocketType,
  address: string,
  originalAddress: string,
  connected: boolean,
  connecting: boolean,
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

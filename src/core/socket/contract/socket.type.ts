import { SocketEventType, SocketType } from '@iola/core/socket'

export type SocketConnection = {
  type: SocketType,
  address: string,
}

export type SocketInfo = {
  type: SocketType,
  address: string,
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

import { SocketEventType, SocketType } from './socket.enum'

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
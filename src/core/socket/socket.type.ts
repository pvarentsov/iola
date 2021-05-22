import { SocketType } from './socket.enum'

export type SocketConnection = {
  [SocketType.WebSocket]: {
    address: string,
  },
  [SocketType.SocketIO]: {
    address: string,
  },
  [SocketType.Tcp]: {
    address: string,
  },
  [SocketType.Unix]: {
    address: string,
  }
}

export type SocketInfo = {
  type: SocketType,
  connected: boolean,
}
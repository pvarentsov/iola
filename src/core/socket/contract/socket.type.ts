import { SocketType } from './socket.enum'

export type SocketConnection = {
  [SocketType.WebSocket]: {
    type: SocketType.WebSocket,
    address: string,
  },
  [SocketType.SocketIO]: {
    type: SocketType.SocketIO,
    address: string,
  },
  [SocketType.Tcp]: {
    type: SocketType.Tcp,
    address: string,
  },
  [SocketType.Unix]: {
    type: SocketType.Unix,
    address: string,
  }
}

export type SocketInfo = {
  type: SocketType,
  connected: boolean,
}
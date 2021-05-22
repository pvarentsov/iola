import { SocketType } from './socket.enum'

export type SocketConnection = {
  [SocketType.WebSocket]: {
    host: string,
    port?: number,
  },
  [SocketType.SocketIO]: {
    host: string,
    port?: number,
  },
  [SocketType.Tcp]: {
    host: string,
    port?: number,
  },
  [SocketType.Unix]: {
    host: string,
    port?: number,
  }
}

export type SocketInfo = {
  type: SocketType
}
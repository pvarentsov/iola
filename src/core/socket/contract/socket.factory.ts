import { SocketIOClient } from '../client/socketio.client'
import { TcpSocketClient } from '../client/tcp-socket.client'
import { UnixSocketClient } from '../client/unix-socket.client'
import { WebSocketClient } from '../client/websocket.client'
import { SocketStore } from '../store/socket.store'
import { SocketType } from './socket.enum'
import { ISocketClient, ISocketStore } from './socket.interface'
import { SocketConnection } from './socket.type'

export class SocketFactory {
  static createClient(options: SocketConnection): ISocketClient {
    const store: ISocketStore = new SocketStore()

    const factory: Record<SocketType, () => ISocketClient> = {
      [SocketType.SocketIO]: () => new SocketIOClient(),
      [SocketType.WebSocket]: () => new WebSocketClient(options, store),
      [SocketType.Tcp]: () => new TcpSocketClient(),
      [SocketType.Unix]: () => new UnixSocketClient(),
    }

    return factory[options.type]()
  }
}
import { SocketIOClient } from '../client/socketio.client'
import { TcpSocketClient } from '../client/tcp-socket.client'
import { UnixSocketClient } from '../client/unix-socket.client'
import { WebSocketClient } from '../client/websocket.client'
import { SocketType } from './socket.enum'
import { ISocketClient } from './socket.interface'
import { SocketConnection } from './socket.type'

export class SocketFactory {
  static createClient(options: SocketConnection): ISocketClient {
    const factory: Record<SocketType, () => ISocketClient> = {
      [SocketType.SocketIO]: () => new SocketIOClient(),
      [SocketType.WebSocket]: () => new WebSocketClient(options),
      [SocketType.Tcp]: () => new TcpSocketClient(),
      [SocketType.Unix]: () => new UnixSocketClient(),
    }

    return factory[options.type]()
  }
}
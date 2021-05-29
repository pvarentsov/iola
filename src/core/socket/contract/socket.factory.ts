import { SocketIOClient } from '../clients/socketio.client'
import { TcpSocketClient } from '../clients/tcp-socket.client'
import { UnixSocketClient } from '../clients/unix-socket.client'
import { WebSocketClient } from '../clients/websocket.client'
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
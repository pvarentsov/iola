import { SocketIOClient } from './clients/socketio.client'
import { TcpSocketClient } from './clients/tcp-socket.client'
import { UnixSocketClient } from './clients/unix-socket.client'
import { WebSocketClient } from './clients/websocket.client'
import { SocketType } from './socket.enum'
import { ISocketClient } from './socket.interface'

export class SocketFactory {
  static createClient<TType extends SocketType>(type: TType): ISocketClient<TType> {
    const factory: Record<SocketType, () => ISocketClient<SocketType>> = {
      [SocketType.SocketIO]: () => new SocketIOClient(),
      [SocketType.WebSocket]: () => new WebSocketClient(),
      [SocketType.Tcp]: () => new TcpSocketClient(),
      [SocketType.Unix]: () => new UnixSocketClient(),
    }

    return factory[type]()
  }
}
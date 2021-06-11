import { ISocketClient, ISocketEventStore, SocketConnection, SocketType } from '@iola/core/socket'
import { SocketIOClient } from '@iola/core/socket/client/socketio.client'
import { TcpSocketClient } from '@iola/core/socket/client/tcp-socket.client'
import { UnixSocketClient } from '@iola/core/socket/client/unix-socket.client'
import { WebSocketClient } from '@iola/core/socket/client/websocket.client'
import { EventStore } from '@iola/core/socket/store/event.store'

export class SocketFactory {
  static createClient(options: SocketConnection): ISocketClient {
    const store: ISocketEventStore = new EventStore()

    const factory: Record<SocketType, () => ISocketClient> = {
      [SocketType.SocketIO]: () => new SocketIOClient(),
      [SocketType.WebSocket]: () => new WebSocketClient(options, store),
      [SocketType.Tcp]: () => new TcpSocketClient(),
      [SocketType.Unix]: () => new UnixSocketClient(),
    }

    return factory[options.type]()
  }
}

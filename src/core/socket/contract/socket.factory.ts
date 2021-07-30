import { ISocketClient, SocketOptions, SocketType } from '@iola/core/socket'
import { SocketIOClient } from '@iola/core/socket/client/socketio.client'
import { TcpSocketClient } from '@iola/core/socket/client/tcp-socket.client'
import { UnixSocketClient } from '@iola/core/socket/client/unix-socket.client'
import { WebSocketClient } from '@iola/core/socket/client/websocket.client'
import { BinaryMessageStore } from '@iola/core/socket/store/binary-message.store'
import { EventStore } from '@iola/core/socket/store/event.store'

export class SocketFactory {
  static createClient(options: SocketOptions): ISocketClient {
    const factory: Record<SocketType, () => ISocketClient> = {
      [SocketType.SocketIO]: () => new SocketIOClient(options, new EventStore()),
      [SocketType.WebSocket]: () => new WebSocketClient(options, new EventStore()),
      [SocketType.Tcp]: () => new TcpSocketClient(options, new EventStore(), new BinaryMessageStore()),
      [SocketType.Unix]: () => new UnixSocketClient(),
    }

    return factory[options.type]()
  }
}

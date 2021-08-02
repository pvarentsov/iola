import { ISocketClient, SocketOptions, SocketType } from '@iola/core/socket'
import { NetSocketClient } from '@iola/core/socket/client/net-socket.client'
import { SocketIOClient } from '@iola/core/socket/client/socketio.client'
import { WebSocketClient } from '@iola/core/socket/client/websocket.client'
import { BinaryMessageStore } from '@iola/core/socket/store/binary-message.store'
import { EventStore } from '@iola/core/socket/store/event.store'

export class SocketFactory {
  static createClient(options: SocketOptions): ISocketClient {
    const factory: Record<SocketType, () => ISocketClient> = {
      [SocketType.SocketIO]: () => new SocketIOClient(options, new EventStore()),
      [SocketType.WebSocket]: () => new WebSocketClient(options, new EventStore()),
      [SocketType.Tcp]: () => new NetSocketClient(options, new EventStore(), new BinaryMessageStore()),
      [SocketType.Unix]: () => new NetSocketClient(options, new EventStore(), new BinaryMessageStore()),
    }

    return factory[options.type]()
  }
}

import { ISocketClient, SocketOptions, SocketType } from '@iola/core/socket'
import { NetSocketAsyncClient } from '@iola/core/socket/client/net-socket.async.client'
import { SocketIOClient } from '@iola/core/socket/client/socketio.client'
import { WebSocketClient } from '@iola/core/socket/client/websocket.client'
import { BinaryMessageStore } from '@iola/core/socket/store/binary-message.store'
import { EventStore } from '@iola/core/socket/store/event.store'

export class SocketFactory {
  static createClient(options: SocketOptions): ISocketClient {

    const factory: Record<SocketType, () => ISocketClient> = {
      [SocketType.SocketIO]: () => new SocketIOClient(options, new EventStore()),
      [SocketType.WebSocket]: () => new WebSocketClient(options, new EventStore()),
      [SocketType.Tcp]: () => this.createNetSocket(options),
      [SocketType.Unix]: () => this.createNetSocket(options),
    }

    return factory[options.type]()
  }

  private static createNetSocket(options: SocketOptions): ISocketClient {
    if (options.netSync) {
      return new NetSocketAsyncClient(options, new EventStore(), new BinaryMessageStore())
    }

    return new NetSocketAsyncClient(options, new EventStore(), new BinaryMessageStore())
  }
}

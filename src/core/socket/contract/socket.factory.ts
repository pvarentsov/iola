import { resolve } from 'path'

import { ISocketClient, SocketOptions, SocketType } from '@iola/core/socket'
import { NetSocketClient } from '@iola/core/socket/client/net-socket.client'
import { NetSocketSyncClient } from '@iola/core/socket/client/net-socket.sync.client'
import { SocketIOClient } from '@iola/core/socket/client/socketio.client'
import { WebSocketClient } from '@iola/core/socket/client/websocket.client'
import { BinaryStore } from '@iola/core/socket/store/binary.store'
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
    if (options.type === SocketType.Unix) {
      options.address = resolve(process.cwd(), options.address)
    }
    if (options.netSync) {
      return new NetSocketSyncClient(options, new EventStore())
    }

    return new NetSocketClient(options, new EventStore(), new BinaryStore())
  }
}

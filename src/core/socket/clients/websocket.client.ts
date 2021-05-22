import { firstValueFrom, fromEvent, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import * as WebSocket from 'ws'
import { MessageEvent } from 'ws'
import { SocketType } from '../socket.enum'
import { ISocketClient } from '../socket.interface'
import { SocketConnection, SocketInfo } from '../socket.type'

export class WebSocketClient implements ISocketClient<SocketType.WebSocket> {
  private client?: WebSocket
  private messages?: Observable<MessageEvent>
  private readonly info: SocketInfo

  constructor() {
    this.info = {
      type: SocketType.WebSocket,
      connected: false,
    }
  }

  async connect(options: SocketConnection[SocketType.WebSocket]): Promise<void> {
    if (!this.info.connected) {
      const client = new WebSocket(options.address)
      await firstValueFrom(fromEvent(client, 'open'))

      this.messages = fromEvent<MessageEvent>(client, 'message')
      this.info.connected = true
      this.client = client
    }
  }

  read<TMessage>(): Observable<TMessage> {
    return this.messages!.pipe(
      filter(message => message.type === 'message'),
      map(message => message.data as any)
    )
  }

  async send<TMessage>(message: TMessage): Promise<void> {
    if (this.info.connected) {
      this.client?.send(message)
    }
  }

  getInfo(): SocketInfo {
    return this.info
  }
}
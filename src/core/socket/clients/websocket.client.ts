import { firstValueFrom, fromEvent, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import * as WebSocket from 'ws'
import { MessageEvent } from 'ws'
import { MessageUtil } from '../../common'
import { SocketType } from '../contract/socket.enum'
import { ISocketClient } from '../contract/socket.interface'
import { SocketConnection, SocketInfo } from '../contract/socket.type'

export class WebSocketClient implements ISocketClient {
  private client?: WebSocket
  private messages?: Observable<MessageEvent>

  private readonly options: SocketConnection[SocketType.WebSocket]
  private readonly info: SocketInfo

  constructor(options: SocketConnection[SocketType.WebSocket]) {
    this.options = options
    this.info = {
      type: options.type,
      connected: false,
    }
  }

  async connect(): Promise<void> {
    if (!this.info.connected) {
      const client = new WebSocket(this.options.address)
      await firstValueFrom(fromEvent(client, 'open'))

      this.messages = fromEvent<MessageEvent>(client, 'message')
      this.info.connected = true
      this.client = client
    }
  }

  read<TMessage>(): Observable<TMessage> {
    return this.messages!.pipe(
      filter(message => message.type === 'message'),
      map(message => MessageUtil.parseRawMessage(message.data) as any)
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
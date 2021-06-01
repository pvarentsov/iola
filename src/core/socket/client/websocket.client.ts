import { firstValueFrom, fromEvent } from 'rxjs'
import { mapTo, tap, timeout } from 'rxjs/operators'
import * as WebSocket from 'ws'
import { MessageUtil } from '../../common'
import { SocketEventType } from '../contract/socket.enum'
import { ISocketClient, ISocketStore } from '../contract/socket.interface'
import { SocketConnection, SocketInfo } from '../contract/socket.type'

export class WebSocketClient implements ISocketClient {
  private readonly _info: SocketInfo
  private readonly _store: ISocketStore

  private _client?: WebSocket

  constructor(options: SocketConnection, store: ISocketStore) {
    this._info = {
      type: options.type,
      address: options.address,
      connected: false,
    }

    this._store = store
  }

  get info(): SocketInfo {
    return {...this._info}
  }

  get store(): ISocketStore {
    return this._store
  }

  async connect(): Promise<void> {
    if (!this._info.connected) {
      this._client = new WebSocket(this._info.address)

      this._client.on('message', message => this._store.addEvent({
        type: SocketEventType.ReceivedMessage,
        date: new Date(),
        message: MessageUtil.unpack(message),
      }))

      this._client.on('error', err => this._store.addEvent({
        type: SocketEventType.Error,
        date: new Date(),
        message: err.message,
      }))

      this._client.on('close', (code: number, reason: string) => this._store.addEvent({
        type: SocketEventType.Closed,
        date: new Date(),
        message: {code, reason},
      }))

      const openStream = fromEvent(this._client, 'open').pipe(
        timeout(3000),
        tap(() => this._info.connected = true),
        tap(() => this._store.addEvent({
          type: SocketEventType.Connected,
          date: new Date(),
          message: this._info,
        })),
        mapTo(undefined),
      )

      return firstValueFrom<void>(openStream)
    }
  }

  send<TMessage>(message: TMessage): void {
    if (this._client && this._info.connected) {
      this._client.send(MessageUtil.packToStr(message), err => {
        if (!err) {
          this._store.addEvent({
            type: SocketEventType.SentMessage,
            date: new Date(),
            message: message,
          })
        }
      })
    }
  }
}
import { firstValueFrom, fromEvent } from 'rxjs'
import { mapTo, tap, timeout } from 'rxjs/operators'
import * as WebSocket from 'ws'
import { AnyObject, MessageFormat, MessageUtil } from '../../common'
import { SocketEventType } from '../contract/socket.enum'
import { ISocketClient, ISocketEventStore } from '../contract/socket.interface'
import { SocketConnection, SocketInfo } from '../contract/socket.type'

export class WebSocketClient implements ISocketClient {
  private readonly _info: SocketInfo
  private readonly _store: ISocketEventStore

  private _client?: WebSocket

  constructor(options: SocketConnection, store: ISocketEventStore) {
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

  get store(): ISocketEventStore {
    return this._store
  }

  async connect(): Promise<void> {
    if (!this._info.connected) {
      this._client = new WebSocket(this._info.address)

      this._client.on('message', message => this._store.add({
        type: SocketEventType.ReceivedMessage,
        date: new Date(),
        message: MessageUtil.unpack(message),
      }))

      this._client.on('error', err => this._store.add({
        type: SocketEventType.Error,
        date: new Date(),
        message: err.message,
      }))

      this._client.on('close', (code: number, reason: string) => this._store.add({
        type: SocketEventType.Closed,
        date: new Date(),
        message: {code, reason},
      }))

      const openStream = fromEvent(this._client, 'open').pipe(
        timeout(3000),
        tap(() => this._info.connected = true),
        tap(() => this._store.add({
          type: SocketEventType.Connected,
          date: new Date(),
          message: this._info,
        })),
        mapTo(undefined),
      )

      return firstValueFrom<void>(openStream)
    }
  }

  send<TMessage>(message: TMessage, format: MessageFormat): void {
    const packed = MessageUtil.pack(message, format)
    const eventInfo: AnyObject = {...packed}

    if (format === MessageFormat.ByteArray) {
      eventInfo.data = Array.from(packed.data as Buffer)
    }
    if (format === MessageFormat.JSON && typeof message === 'object') {
      eventInfo.data = message
    }

    if (this._client && this._info.connected) {
      this._client.send(packed.data, err => {
        if (!err) {
          this._store.add({
            type: SocketEventType.SentMessage,
            date: new Date(),
            message: eventInfo,
          })
        }
      })
    }
  }
}

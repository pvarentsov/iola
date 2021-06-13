import { firstValueFrom, fromEvent } from 'rxjs'
import { mapTo, tap } from 'rxjs/operators'
import * as WebSocket from 'ws'

import { AnyObject, MessageUtil, RxJSUtil } from '@iola/core/common'
import { ISocketClient, ISocketEventStore, SocketConnection, SocketEventType, SocketInfo } from '@iola/core/socket'

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
      this.close()

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

      this._client.on('close', (code: number, reason: string) => {
        this._store.add({
          type: SocketEventType.Closed,
          date: new Date(),
          message: {code, reason},
        })

        this.close()
      })

      try {
        const openStream = fromEvent(this._client, 'open').pipe(
          RxJSUtil.timeout(3000, `connection to ${this.info.address} is timed out`),
          tap(() => this._info.connected = true),
          tap(() => this._store.add({
            type: SocketEventType.Connected,
            date: new Date(),
            message: this._info,
          })),
          mapTo(undefined),
        )

        await firstValueFrom(openStream)

        this._info.connected = true
      }
      catch (error) {
        this.close()
        throw error
      }
    }
  }

  sendData<TData>(data: TData): void {
    const packed = MessageUtil.packToString(data)
    const eventMessage: AnyObject = {
      format: packed.format,
      data: packed.data
    }

    if (typeof data === 'object' && data !== null) {
      eventMessage.data = data
    }

    this.send(packed.data, eventMessage)
  }

  sendBytes(bytes: number[]): void {
    const packed = MessageUtil.packToBuffer(bytes)
    const eventMessage = {
      format: packed.format,
      data: bytes
    }

    this.send(packed.data, eventMessage)
  }

  private close(): void {
    this._client?.removeAllListeners()

    this._client = undefined
    this._info.connected = false
  }

  private send<TData, TMessage>(data: TData, eventMessage: TMessage): void {
    if (!this._info.connected) {
      throw new Error(`client is not connected to ${this.info.address}`)
    }

    this._client && this._info.connected && this._client.send(data, err => {
      if (!err) {
        const event = {
          type: SocketEventType.SentMessage,
          date: new Date(),
          message: eventMessage,
        }

        this._store.add(event)
      }
    })
  }
}

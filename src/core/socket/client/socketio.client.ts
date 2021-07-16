import { AnyObject, MessageFormat, MessageUtil, RxJSUtil } from '@iola/core/common'
import {
  ISocketClient,
  ISocketEventStore,
  SocketEventType,
  SocketInfo,
  SocketOptions,
  SocketSendReply,
} from '@iola/core/socket'
import { firstValueFrom, fromEvent } from 'rxjs'
import { mapTo, tap } from 'rxjs/operators'
import { io, Socket } from 'socket.io-client'

export class SocketIOClient implements ISocketClient {
  private readonly _info: SocketInfo
  private readonly _store: ISocketEventStore
  private readonly _options: SocketOptions

  private _client?: Socket

  constructor(options: SocketOptions, store: ISocketEventStore) {
    this._info = {
      type: options.type,
      address: options.address,
      connected: false,
    }

    this._options = options
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
      this._client = io(this._options.address)

      this._client.onAny((event, ...args) => {
        const message = args[0] === undefined
          ? null
          : args[0]

        const parsed = MessageUtil.parse(message)
        const encoding = this._options.binaryEncoding

        let eventMessage: AnyObject = {
          format: parsed.format,
          event: event,
          data: parsed.data,
        }

        if (parsed.format === MessageFormat.ByteArray) {
          eventMessage = {
            format: parsed.format,
            size: parsed.data.length,
            event: event,
            data: parsed.data,
          }
          if (encoding) {
            eventMessage[encoding] = (Buffer.from(parsed.data as Uint8Array)).toString(encoding)
          }
        }

        this._store.add({
          type: SocketEventType.ReceivedMessage,
          date: new Date(),
          message: eventMessage,
        })
      })

      this._client.on('connect_error', err => {
        if (this._info.connected) {
          this._store.add({
            type: SocketEventType.Error,
            date: new Date(),
            message: {
              message: err.message
            },
          })
        }
      })

      this._client.on('disconnect', reason => {
        if (this._info.connected) {
          this._store.add({
            type: SocketEventType.Closed,
            date: new Date(),
            message: {reason},
          })

          this.close()
          this.retryConnection()
        }
      })

      try {
        const connect$ = fromEvent(this._client, 'connect').pipe(
          RxJSUtil.timeout(this._options.connectionTimeout, `connection to ${this.info.address} is timed out`),
          tap(() => this._info.connected = true),
          tap(() => this._store.add({
            type: SocketEventType.Connected,
            date: new Date(),
            message: this._info,
          })),
          mapTo(undefined),
        )

        await firstValueFrom(connect$)

        this._info.connected = true
      }
      catch (error) {
        this.close()
        throw error
      }
    }
  }

  async sendData<TData>(data: TData): Promise<SocketSendReply> {
    console.log(data)
    return {messageId: 0}
  }

  async sendBytes(bytes: number[]): Promise<SocketSendReply> {
    console.log(bytes)
    return {messageId: 0}
  }

  private close(): void {
    this._client?.close()

    this._client = undefined
    this._info.connected = false
  }

  private retryConnection(): void {
    const retryInterval = setInterval(async () => {
      try {
        this._store.add({
          type: SocketEventType.Reconnecting,
          date: new Date(),
          message: this._info,
        })

        await this.connect()

        clearInterval(retryInterval)
      }
      catch (err) {}
    }, this._options.reconnectionInterval)
  }
}

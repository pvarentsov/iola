import { firstValueFrom, from, fromEvent } from 'rxjs'
import { map, tap, timeout } from 'rxjs/operators'
import { io, Socket } from 'socket.io-client'
import { format, URL } from 'url'

import { AnyObject, EnumUtil, MessageFormat, MessageUtil, RxJSUtil, SocketIOTransport } from '@iola/core/common'
import {
  ISocketClient,
  ISocketEventStore,
  SocketEventType,
  SocketInfo,
  SocketOptions,
  SocketSendReply,
} from '@iola/core/socket'

export class SocketIOClient implements ISocketClient {
  private readonly _info: SocketInfo
  private readonly _store: ISocketEventStore
  private readonly _options: SocketOptions

  private _client?: Socket

  constructor(options: SocketOptions, store: ISocketEventStore) {
    this._info = {
      type: options.type,
      address: format(new URL(options.address), {search: false}),
      originalAddress: options.address,
      connected: false,
      connecting: false,
    }

    this._options = options
    this._store = store
  }

  get store(): ISocketEventStore {
    return this._store
  }

  async connect(): Promise<void> {
    if (!this._info.connected) {
      this._client = io(this._info.originalAddress, {
        auth: this._options.ioAuth,
        extraHeaders: this._options.headers,
        rejectUnauthorized: false,
        transports: this._options.ioTransport ? [this._options.ioTransport] : EnumUtil.values(SocketIOTransport)
      })

      this._client.onAny((event, ...args) => {
        const message = args[0] === undefined
          ? null
          : args[0]

        this.receiveMessage(event, message)
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

          this.clear()
          this.retryConnection()
        }
      })

      try {
        const connect$ = fromEvent(this._client, 'connect').pipe(
          RxJSUtil.timeout(this._options.connectionTimeout, `connection to ${this._info.address} is timed out`),
          tap(() => this._info.connected = true),
          tap(() => this._store.add({
            type: SocketEventType.Connected,
            date: new Date(),
            message: this._info,
          })),
          map(() => undefined),
        )

        this._info.connecting = true

        await firstValueFrom(connect$)

        this._info.connecting = false
        this._info.connected = true
      }
      catch (error) {
        this.clear()
        throw error
      }
    }
  }

  async sendData<TData>(data: TData, event: string = '*'): Promise<SocketSendReply> {
    const parsed = MessageUtil.parse(data)
    const eventMessage: AnyObject = {
      format: parsed.format,
      event: event,
      data: parsed.data
    }

    return this.emit(data, event, eventMessage)
  }

  async sendBytes(bytes: number[], event: string = '*'): Promise<SocketSendReply> {
    const encoding = this._options.binaryEncoding
    const packed = MessageUtil.packToBuffer(bytes)

    const eventMessage: AnyObject = {
      format: packed.format,
      size: bytes.length,
      event: event,
      data: bytes
    }

    if (encoding) {
      eventMessage[encoding] = packed.data.toString(encoding)
    }

    return this.emit(packed.data, event, eventMessage)
  }

  close(): void {
    this.clear()
  }

  private clear(): void {
    this._client?.removeAllListeners()
    this._client?.close()

    this._client = undefined
    this._info.connected = false
    this._info.connecting = false
  }

  private retryConnection(): void {
    const retryInterval = setInterval(async () => {
      try {
        if (this._info.connected) {
          clearInterval(retryInterval)
        }
        else if (!this._info.connecting) {
          this._store.add({
            type: SocketEventType.Reconnecting,
            date: new Date(),
            message: this._info,
          })

          await this.connect()

          clearInterval(retryInterval)
        }
      }
      catch (err) {}
    }, this._options.reconnectionInterval)
  }

  private async emit<TData, TMessage>(data: TData, event: string, eventMessage: TMessage): Promise<SocketSendReply> {
    const client = this._client
    const connected = this._info.connected

    if (!client || !connected) {
      throw new Error(`error: client is not connected to ${this._info.address}`)
    }

    const message = {
      type: SocketEventType.SentMessage,
      date: new Date(),
      message: eventMessage,
    }

    let reply: SocketSendReply = {
      messageId: this._store.add(message)
    }

    const reply$ = from(new Promise<SocketSendReply>(resolve => {
      const resolveCb = (res: any): void => {
        reply.reply = this.receiveMessage(event, res)
        resolve(reply)
      }

      client.emit(event, data, resolveCb)
    })).pipe(
      timeout(this._options.replyTimeout),
    )

    try {
      reply = await firstValueFrom(reply$)
    } catch (err) {}

    return reply
  }

  private receiveMessage(event: string, message: any): AnyObject {
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

    return eventMessage
  }
}

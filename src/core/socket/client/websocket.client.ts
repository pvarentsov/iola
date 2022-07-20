import { firstValueFrom, fromEvent } from 'rxjs'
import { filter, map, tap, timeout } from 'rxjs/operators'
import * as WebSocket from 'ws'

import { AnyObject, MessageFormat, MessageRequestIdInfo, MessageUtil, Optional, RxJSUtil } from '@iola/core/common'
import {
  ISocketClient,
  ISocketEventStore,
  SocketEvent,
  SocketEventType,
  SocketInfo,
  SocketOptions,
  SocketSendReply,
} from '@iola/core/socket'
import { UrlUtil } from '@iola/core/common/util/url.util'

export class WebSocketClient implements ISocketClient {
  private readonly _info: SocketInfo
  private readonly _store: ISocketEventStore
  private readonly _options: SocketOptions

  private _client?: WebSocket

  constructor(options: SocketOptions, store: ISocketEventStore) {
    this._info = {
      type: options.type,
      address: UrlUtil.removeSearchParams(options.address),
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
      this.clear()

      this._client = new WebSocket(this._info.originalAddress, {
        rejectUnauthorized: false,
        headers: this._options.headers,
      })

      this._client.on('message', (message: WebSocket.Data, isBinary: boolean) => {
        const unpacked = isBinary
          ? MessageUtil.unpack(message)
          : MessageUtil.unpack(message.toString())

        const encoding = this._options.binaryEncoding

        let eventMessage: AnyObject = unpacked

        if (unpacked.format === MessageFormat.ByteArray) {
          eventMessage = {
            format: unpacked.format,
            size: unpacked.data.length,
            data: unpacked.data,
          }
          if (encoding) {
            eventMessage[encoding] = (Buffer.from(unpacked.data as Uint8Array)).toString(encoding)
          }
        }

        this._store.add({
          type: SocketEventType.ReceivedMessage,
          date: new Date(),
          message: eventMessage,
        })
      })

      this._client.on('error', err => this._store.add({
        type: SocketEventType.Error,
        date: new Date(),
        message: {
          message: err.message
        },
      }))

      this._client.on('close', (code: number, reason: Buffer) => {
        if (this._info.connected) {
          this._store.add({
            type: SocketEventType.Closed,
            date: new Date(),
            message: {code, reason: reason.toString()},
          })

          this.clear()
          this.retryConnection()
        }
      })

      try {
        const open$ = fromEvent(this._client, 'open').pipe(
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

        await firstValueFrom(open$)

        this._info.connecting = false
        this._info.connected = true
      }
      catch (error) {
        this.clear()
        throw error
      }
    }
  }

  sendData<TData>(data: TData): Promise<SocketSendReply> {
    const requestIdInfo = MessageUtil.findRequestId(data)

    const packed = MessageUtil.packToString(data)
    const eventMessage: AnyObject = {
      format: packed.format,
      data: packed.data
    }

    if (typeof data === 'object' && data !== null) {
      eventMessage.data = data
    }

    return this.send(packed.data, eventMessage, requestIdInfo)
  }

  sendBytes(bytes: number[]): Promise<SocketSendReply> {
    const encoding = this._options.binaryEncoding
    const packed = MessageUtil.packToBuffer(bytes)

    const eventMessage: AnyObject = {
      format: packed.format,
      size: bytes.length,
      data: bytes
    }

    if (encoding) {
      eventMessage[encoding] = packed.data.toString(encoding)
    }

    return this.send(packed.data, eventMessage)
  }

  close(): void {
    this._client?.terminate()
    this.clear()
  }

  clear(): void {
    this._client?.removeAllListeners()

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

  private send<TData, TMessage>(
    data: TData,
    eventMessage: TMessage,
    requestIdInfo?: MessageRequestIdInfo

  ): Promise<SocketSendReply>
  {
    const client = this._client
    const connected = this._info.connected

    if (!client || !connected) {
      throw new Error(`error: client is not connected to ${this._info.address}`)
    }

    const currentDate = new Date()

    return new Promise<SocketSendReply>(async (resolve, reject) => {
      client.send(data, {binary: Buffer.isBuffer(data)}, async (err) => {
        if (!err) {
          const event = {
            type: SocketEventType.SentMessage,
            date: new Date(),
            message: eventMessage,
          }

          const messageId = this._store.add(event)
          const reply = requestIdInfo
            ? await this.awaitReply(requestIdInfo, currentDate)
            : undefined

          resolve({messageId, reply})
        }

        reject(err)
      })
    })
  }

  private async awaitReply(requestIdInfo: MessageRequestIdInfo, awaitAfterDate: Date): Promise<Optional<AnyObject>> {
    const isRecord = (event: SocketEvent): boolean => {
      return typeof event.message.data === 'object'
        && event.message.data !== null
        && !Array.isArray(event.message.data)
    }

    const isReply = (event: SocketEvent, requestIdInfo: MessageRequestIdInfo): boolean => {
      return event.message.data[requestIdInfo.key] === requestIdInfo.value
    }

    const reply$ = this._store.listen().pipe(
      filter(event => event.type === SocketEventType.ReceivedMessage),
      filter(event => event.date >= awaitAfterDate),
      filter(event => isRecord(event)),
      filter(event => isReply(event, requestIdInfo)),
      map(event => event.message),
      timeout(this._options.replyTimeout),
    )

    let reply: Optional<AnyObject>

    try {
      reply = await firstValueFrom(reply$)
    } catch (err) {}

    return reply
  }
}

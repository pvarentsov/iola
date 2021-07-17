import { firstValueFrom, fromEvent } from 'rxjs'
import { filter, map, mapTo, tap, timeout } from 'rxjs/operators'
import * as WebSocket from 'ws'
import { format, URL } from 'url'

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

export class WebSocketClient implements ISocketClient {
  private readonly _info: SocketInfo
  private readonly _store: ISocketEventStore
  private readonly _options: SocketOptions

  private _client?: WebSocket

  constructor(options: SocketOptions, store: ISocketEventStore) {
    this._info = {
      type: options.type,
      address: format(new URL(options.address), {search: false}),
      originalAddress: options.address,
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
      this.close()

      this._client = new WebSocket(this._info.originalAddress)

      this._client.on('message', message => {
        const unpacked = MessageUtil.unpack(message)
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

      this._client.on('close', (code: number, reason: string) => {
        if (this._info.connected) {
          this._store.add({
            type: SocketEventType.Closed,
            date: new Date(),
            message: {code, reason},
          })

          this.close()
          this.retryConnection()
        }
      })

      try {
        const open$ = fromEvent(this._client, 'open').pipe(
          RxJSUtil.timeout(this._options.connectionTimeout, `connection to ${this.info.address} is timed out`),
          tap(() => this._info.connected = true),
          tap(() => this._store.add({
            type: SocketEventType.Connected,
            date: new Date(),
            message: this._info,
          })),
          mapTo(undefined),
        )

        await firstValueFrom(open$)

        this._info.connected = true
      }
      catch (error) {
        this.close()
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

  private close(): void {
    this._client?.removeAllListeners()

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

  private send<TData, TMessage>(
    data: TData,
    eventMessage: TMessage,
    requestIdInfo?: MessageRequestIdInfo

  ): Promise<SocketSendReply>
  {
    const client = this._client
    const connected = this._info.connected

    if (!client || !connected) {
      throw new Error(`error: client is not connected to ${this.info.address}`)
    }

    const currentDate = new Date()

    return new Promise<SocketSendReply>(async (resolve, reject) => {
      client.send(data, async (err) => {
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
      map(event => event.message.data),
      timeout(this._options.replyTimeout),
    )

    let reply: Optional<AnyObject>

    try {
      reply = await firstValueFrom(reply$)
    } catch (err) {}

    return reply
  }
}

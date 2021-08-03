import { createConnection, NetConnectOpts, Socket } from 'net'
import { firstValueFrom, fromEvent } from 'rxjs'
import { mapTo, tap } from 'rxjs/operators'

import { AnyObject, MessageUtil, RxJSUtil } from '@iola/core/common'
import {
  IBinaryMessageStore,
  ISocketClient,
  ISocketEventStore,
  SocketEventType,
  SocketInfo,
  SocketOptions,
  SocketSendReply,
  SocketType,
} from '@iola/core/socket'

export class NetSocketAsyncClient implements ISocketClient {
  private readonly _info: SocketInfo
  private readonly _eventStore: ISocketEventStore
  private readonly _binaryMessageStore: IBinaryMessageStore
  private readonly _options: SocketOptions

  private _client?: Socket

  constructor(options: SocketOptions, eventStore: ISocketEventStore, binaryMessageStore: IBinaryMessageStore) {
    this._info = {
      type: options.type,
      address: options.address,
      originalAddress: options.address,
      connected: false,
      connecting: false,
    }

    this._options = options

    this._eventStore = eventStore
    this._binaryMessageStore = binaryMessageStore
  }

  get info(): SocketInfo {
    return {...this._info}
  }

  get store(): ISocketEventStore {
    return this._eventStore
  }

  async connect(): Promise<void> {
    if (!this._info.connected) {
      this.close()
      this._client = createConnection(this.netOptions())

      this._client.on('data', data => this._binaryMessageStore.add(data))

      this._binaryMessageStore.group().subscribe(message => {
        const unpacked = MessageUtil.unpack(message)
        const encoding = this._options.binaryEncoding

        const eventMessage: AnyObject = {
          format: unpacked.format,
          size: unpacked.data.length,
          data: unpacked.data,
        }
        if (encoding) {
          eventMessage[encoding] = (Buffer.from(unpacked.data as Uint8Array)).toString(encoding)
        }

        this._eventStore.add({
          type: SocketEventType.ReceivedMessage,
          date: new Date(),
          message: eventMessage,
        })
      })

      this._client.on('error', err => this._eventStore.add({
        type: SocketEventType.Error,
        date: new Date(),
        message: {
          message: err.message
        },
      }))

      this._client.on('close', () => {
        if (this._info.connected) {
          this._eventStore.add({
            type: SocketEventType.Closed,
            date: new Date(),
            message: {code: 1, reason: ''},
          })

          this.close()
          this.retryConnection()
        }
      })

      try {
        const connect$ = fromEvent(this._client, 'connect').pipe(
          RxJSUtil.timeout(this._options.connectionTimeout, `connection to ${this.info.address} is timed out`),
          tap(() => this._info.connected = true),
          tap(() => this._eventStore.add({
            type: SocketEventType.Connected,
            date: new Date(),
            message: this._info,
          })),
          mapTo(undefined),
        )

        this._info.connecting = true

        await firstValueFrom(connect$)

        this._info.connecting = false
        this._info.connected = true
      }
      catch (error) {
        this.close()
        throw error
      }
    }
  }

  async sendData<TData>(data: TData): Promise<SocketSendReply> {
    const encoding = this._options.binaryEncoding
    const packedString = MessageUtil.packToString(data)

    const packed = MessageUtil.packToBuffer(packedString.data as string)

    const eventMessage: AnyObject = {
      format: packed.format,
      size: (packed.data as Buffer).length,
      data: Array.from(packed.data as Buffer),
    }

    if (encoding) {
      eventMessage[encoding] = packed.data.toString(encoding)
    }

    return this.send(Buffer.from(packed.data as Uint8Array) as Buffer, eventMessage)
  }

  async sendBytes(bytes: number[]): Promise<SocketSendReply> {
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

    return this.send(packed.data as Buffer, eventMessage)
  }

  private send<TMessage>(data: Buffer|string, eventMessage: TMessage): Promise<SocketSendReply> {
    const client = this._client
    const connected = this._info.connected

    if (!client || !connected) {
      throw new Error(`error: client is not connected to ${this.info.address}`)
    }

    return new Promise<SocketSendReply>(async (resolve, reject) => {
      client.write(data, err => {
        if (!err) {
          const event = {
            type: SocketEventType.SentMessage,
            date: new Date(),
            message: eventMessage,
          }

          const messageId = this._eventStore.add(event)

          resolve({messageId})
        }

        reject(err)
      })
    })
  }

  private close(): void {
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
          this._eventStore.add({
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

  private netOptions(): NetConnectOpts {
    let netOpts = {} as NetConnectOpts

    if (this._options.type === SocketType.Tcp) {
      const parsedAddress = this._options.address.split(':')

      netOpts = {
        host: parsedAddress[0],
        port: parseInt(parsedAddress[1]),
      }
    }
    if (this._options.type === SocketType.Unix) {
      netOpts = {
        path: this._options.address
      }
    }

    return netOpts
  }
}

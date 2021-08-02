import { AnyObject, MessageUtil, RxJSUtil } from '@iola/core/common'
import {
  ISocketClient,
  ISocketEventStore,
  SocketEventType,
  SocketOptions,
  SocketSendReply,
  SocketType,
} from '@iola/core/socket'
import { createConnection, NetConnectOpts, Socket } from 'net'
import { firstValueFrom, fromEvent } from 'rxjs'
import { mapTo, tap } from 'rxjs/operators'

export class NetSocketSyncClient implements ISocketClient {
  private readonly _eventStore: ISocketEventStore
  private readonly _options: SocketOptions

  constructor(options: SocketOptions, eventStore: ISocketEventStore) {
    this._options = options
    this._eventStore = eventStore
  }

  get store(): ISocketEventStore {
    return this._eventStore
  }

  async connect(): Promise<void> {
    return undefined
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
    // TODO: Create connection
    const client = {} as Socket

    return new Promise<SocketSendReply>(async (resolve, reject) => {
      client.write(data, async (err) => {
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

  private async connectSocket(): Promise<Socket> {
    const socket = createConnection(this.netOptions());

    try {
      const connect$ = fromEvent(socket, 'connect').pipe(
        RxJSUtil.timeout(this._options.connectionTimeout, `connection to ${this._options.address} is timed out`),
        tap(() => this._eventStore.add({
          type: SocketEventType.Connected,
          date: new Date(),
          message: {type: this._options.type, address: this._options.address},
        })),
        mapTo(undefined),
      )
      await firstValueFrom(connect$)

      return socket
    }
    catch (error) {
      this.close(socket)
      throw error
    }
  }

  private close(client: Socket): void {
    client.removeAllListeners()
    client.destroy()

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

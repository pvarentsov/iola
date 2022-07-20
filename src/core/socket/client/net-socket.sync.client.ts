import { createConnection, NetConnectOpts, Socket } from 'net'
import { first, firstValueFrom, from, fromEvent, merge, switchMap, timer } from 'rxjs'
import { map, tap } from 'rxjs/operators'

import { AnyObject, MessageUtil, RxJSUtil } from '@iola/core/common'
import {
  ISocketClient,
  ISocketEventStore,
  SocketEventType,
  SocketOptions,
  SocketSendReply,
  SocketType,
} from '@iola/core/socket'

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

  close(): void {
    return
  }

  private async send<TMessage>(data: Buffer|string, eventMessage: TMessage): Promise<SocketSendReply> {
    const connectInfo = await this.connectSocket()

    const socketSendReplyPromise = new Promise<SocketSendReply>((resolve, reject) => {
      connectInfo.socket.write(data, err => {
        if (!err) {
          resolve({
            messageId: this._eventStore.add({
              type: SocketEventType.SentMessage,
              date: new Date(),
              message: eventMessage,
            })
          })
        }
        reject(err)
      })
    })

    return firstValueFrom(from(socketSendReplyPromise).pipe(
      switchMap(reply => merge(
        timer(this._options.replyTimeout),
        fromEvent(connectInfo.socket, 'close'),
        fromEvent(connectInfo.socket, 'end'),
      ).pipe(
        first(),
        tap(() => connectInfo.socket.destroy()),
        map(() => connectInfo.buffer.length > 0
          ? {messageId: reply.messageId, reply: this.parseBuffer(connectInfo.buffer)}
          : reply
        ),
      )),
    ))
  }

  private async connectSocket(): Promise<{socket: Socket, buffer: Buffer}> {
    const result = {
      socket: createConnection(this.netOptions()),
      buffer: Buffer.alloc(0),
    }

    result.socket.on('error', err => this._eventStore.add({
      type: SocketEventType.Error,
      date: new Date(),
      message: {
        message: err.message
      },
    }))

    result.socket.on('close', () => {
      this._eventStore.add({
        type: SocketEventType.Closed,
        date: new Date(),
        message: {code: 1, reason: ''},
      })
    })

    result.socket.on('data', chunk => {
      result.buffer = Buffer.concat([result.buffer, chunk])
    })

    try {
      const connect$ = fromEvent(result.socket, 'connect').pipe(
        RxJSUtil.timeout(1000, `connection to ${this._options.address} is timed out`),
        tap(() => this._eventStore.add({
          type: SocketEventType.Connected,
          date: new Date(),
          message: {type: this._options.type, address: this._options.address},
        })),
        map(() => undefined),
      )
      await firstValueFrom(connect$)

      return result
    }
    catch (error) {
      result.socket.destroy()
      throw error
    }
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

  private parseBuffer(buffer: Buffer): AnyObject {
    const unpacked = MessageUtil.unpack(buffer)
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

    return eventMessage
  }
}

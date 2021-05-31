import { firstValueFrom, fromEvent, Observable, ReplaySubject, Subject } from 'rxjs'
import { mapTo, tap, timeout } from 'rxjs/operators'
import * as WebSocket from 'ws'
import { MessageUtil } from '../../common'
import { SocketEventType } from '../contract/socket.enum'
import { ISocketClient } from '../contract/socket.interface'
import { SocketConnection, SocketEvent, SocketInfo } from '../contract/socket.type'

export class WebSocketClient implements ISocketClient {
  private client?: WebSocket

  private readonly events: Subject<SocketEvent>
  private readonly info: SocketInfo

  constructor(options: SocketConnection) {
    this.info = {
      type: options.type,
      address: options.address,
      connected: false,
    }
    
    this.events = new ReplaySubject(100)
    this.events.subscribe()
  }

  async connect(): Promise<void> {
    if (!this.info.connected) {
      this.client = new WebSocket(this.info.address)

      this.client.on('message', message => this.events.next({
        type: SocketEventType.ReceivedMessage,
        date: new Date(),
        message: MessageUtil.unpack(message),
      }))

      this.client.on('error', err => this.events.next({
        type: SocketEventType.Error,
        date: new Date(),
        message: err.message,
      }))

      this.client.on('close', (code: number, reason: string) => this.events.next({
        type: SocketEventType.Closed,
        date: new Date(),
        message: {code, reason},
      }))

      const openStream = fromEvent(this.client, 'open').pipe(
        timeout(3000),
        tap(() => this.info.connected = true),
        tap(() => this.events.next({
          type: SocketEventType.Connected,
          date: new Date(),
          message: this.info,
        })),
        mapTo(undefined),
      )

      return firstValueFrom<void>(openStream)
    }
  }

  send<TMessage>(message: TMessage): void {
    if (this.client && this.info.connected) {
      this.client.send(MessageUtil.packToStr(message), err => {
        if (!err) {
          this.events.next({
            type: SocketEventType.SentMessage,
            date: new Date(),
            message: message,
          })
        }
      })
    }
  }

  getEvents(): Observable<SocketEvent> {
    return this.events
  }

  getInfo(): SocketInfo {
    return this.info
  }
}
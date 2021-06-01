import { Observable } from 'rxjs'
import { SocketEventType } from './socket.enum'
import { SocketEvent, SocketInfo } from './socket.type'

export interface ISocketClient {
  readonly info: SocketInfo
  readonly store: ISocketStore

  connect(): Promise<void>
  send<TMessage>(message: TMessage): void
}

export interface ISocketStore {
  events(by?: {type?: SocketEventType}): SocketEvent[]
  events$(): Observable<SocketEvent>
  addEvent(event: SocketEvent): void
}
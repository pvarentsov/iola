import { Observable } from 'rxjs'
import { SocketEventType } from './socket.enum'
import { SocketEvent, SocketInfo } from './socket.type'

export interface ISocketClient {
  readonly info: SocketInfo
  readonly store: ISocketEventStore

  connect(): Promise<void>
  send<TMessage>(message: TMessage): void
}

export interface ISocketEventStore {
  list(by?: {type?: SocketEventType}): Required<SocketEvent>[]
  listen(): Observable<Required<SocketEvent>>
  add(event: SocketEvent): void
}

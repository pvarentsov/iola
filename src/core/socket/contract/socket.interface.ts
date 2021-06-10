import { Observable } from 'rxjs'
import { MessageFormat } from '../../common'
import { SocketEventType } from './socket.enum'
import { SocketEvent, SocketInfo } from './socket.type'

export interface ISocketClient {
  readonly info: SocketInfo
  readonly store: ISocketEventStore

  connect(): Promise<void>
  send<TMessage>(message: TMessage, format: MessageFormat): void
}

export interface ISocketEventStore {
  list(by?: {types?: SocketEventType[]}): Required<SocketEvent>[]
  listen(): Observable<Required<SocketEvent>>
  add(event: SocketEvent): void
}

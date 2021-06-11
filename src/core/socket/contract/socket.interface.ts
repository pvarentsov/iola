import { Observable } from 'rxjs'
import { SocketEvent, SocketEventType, SocketInfo } from '@iola/core/socket'

export interface ISocketClient {
  readonly info: SocketInfo
  readonly store: ISocketEventStore

  connect(): Promise<void>
  sendData<TData>(data: TData, event?: string): void
  sendBytes(bytes: number[], event?: string): void
}

export interface ISocketEventStore {
  list(by?: {types?: SocketEventType[]}): Required<SocketEvent>[]
  listen(): Observable<Required<SocketEvent>>
  add(event: SocketEvent): void
}

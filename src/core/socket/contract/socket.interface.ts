import { Observable } from 'rxjs'
import { SocketEvent, SocketEventType, SocketInfo, SocketSendReply } from '@iola/core/socket'

export interface ISocketClient {
  readonly info: SocketInfo
  readonly store: ISocketEventStore

  connect(): Promise<void>
  sendData<TData>(data: TData, event?: string): Promise<SocketSendReply>
  sendBytes(bytes: number[], event?: string): Promise<SocketSendReply>
}

export interface ISocketEventStore {
  list(by?: {types?: SocketEventType[]}): Required<SocketEvent>[]
  listen(): Observable<Required<SocketEvent>>
  add(event: SocketEvent): number
}

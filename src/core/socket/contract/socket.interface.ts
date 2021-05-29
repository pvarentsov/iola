import { Observable } from 'rxjs'
import { SocketEvent, SocketInfo } from './socket.type'

export interface ISocketClient {
  connect(): Promise<void>
  send<TMessage>(message: TMessage): void
  getEvents(): Observable<SocketEvent>
  getInfo(): SocketInfo
}
import { Observable } from 'rxjs'
import { SocketInfo } from './socket.type'

export interface ISocketClient {
  connect(): Promise<void>
  send<TMessage>(message: TMessage): Promise<void>
  read<TMessage>(): Observable<TMessage>
  getInfo(): SocketInfo
}
import { Observable } from 'rxjs'
import { SocketType } from './socket.enum'
import { SocketConnection } from './socket.type'

export interface ISocketClient<TType extends SocketType> {
  connect(options: SocketConnection[TType]): Promise<void>
  send<TMessage>(message: TMessage): Promise<void>
  read<TMessage>(): Observable<TMessage>
}
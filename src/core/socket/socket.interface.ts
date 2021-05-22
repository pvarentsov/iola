import { Observable } from 'rxjs'
import { SocketType } from './socket.enum'
import { SocketConnection, SocketInfo } from './socket.type'

export interface ISocketClient<TType extends SocketType> {
  connect(options: SocketConnection[TType]): Promise<void>
  send<TMessage>(message: TMessage): Promise<void>
  read<TMessage>(): Observable<TMessage>
  info(): SocketInfo
}

export interface ISocketClientFactory {
  create<TType extends SocketType>(type: TType): Promise<ISocketClient<TType>>
}
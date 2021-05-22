import { Observable, of } from 'rxjs'
import { SocketType } from '../socket.enum'
import { ISocketClient } from '../socket.interface'
import { SocketConnection, SocketInfo } from '../socket.type'

export class TcpSocketClient implements ISocketClient<SocketType.Tcp> {
  async connect(options: SocketConnection[SocketType.Tcp]): Promise<void> {
    console.log(options)
    return undefined
  }

  read<TMessage>(): Observable<TMessage> {
    return of({} as TMessage)
  }

  async send<TMessage>(message: TMessage): Promise<void> {
    console.log(message)
    return undefined
  }

  getInfo(): SocketInfo {
    return {
      type: SocketType.SocketIO,
      connected: false,
    }
  }
}
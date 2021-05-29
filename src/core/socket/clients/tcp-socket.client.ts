import { Observable, of } from 'rxjs'
import { SocketType } from '../contract/socket.enum'
import { ISocketClient } from '../contract/socket.interface'
import { SocketInfo } from '../contract/socket.type'

export class TcpSocketClient implements ISocketClient {
  async connect(): Promise<void> {
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
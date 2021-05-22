import { Observable, of } from 'rxjs'
import { SocketType } from '../socket.enum'
import { ISocketClient } from '../socket.interface'
import { SocketConnection, SocketInfo } from '../socket.type'

export class WebSocketClient implements ISocketClient<SocketType.WebSocket> {
  async connect(options: SocketConnection[SocketType.WebSocket]): Promise<void> {
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

  info(): SocketInfo {
    return {
      type: SocketType.WebSocket
    }
  }
}
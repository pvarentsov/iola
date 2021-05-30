import { Observable, of } from 'rxjs'
import { SocketType } from '../contract/socket.enum'
import { ISocketClient } from '../contract/socket.interface'
import { SocketEvent, SocketInfo } from '../contract/socket.type'

export class SocketIOClient implements ISocketClient {
  async connect(): Promise<void> {
    return undefined
  }

  send<TMessage>(message: TMessage): void {
    console.log(message)
    return undefined
  }

  getEvents(): Observable<SocketEvent> {
    return of({} as SocketEvent)
  }

  getInfo(): SocketInfo {
    return {
      type: SocketType.SocketIO,
      address: '',
      connected: false,
    }
  }
}
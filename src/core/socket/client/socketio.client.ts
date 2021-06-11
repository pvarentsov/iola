import { ISocketClient, ISocketEventStore } from '../contract/socket.interface'
import { SocketInfo } from '../contract/socket.type'

export class SocketIOClient implements ISocketClient {
  get info(): SocketInfo {
    return {} as SocketInfo
  }

  get store(): ISocketEventStore {
    return {} as ISocketEventStore
  }

  async connect(): Promise<void> {
    return undefined
  }

  sendData<TData>(data: TData): void {
    console.log(data)
    return undefined
  }

  sendBytes(bytes: number[]): void {
    console.log(bytes)
    return undefined
  }
}

import { ISocketClient, ISocketEventStore, SocketInfo, SocketSendReply } from '@iola/core/socket'

export class TcpSocketClient implements ISocketClient {
  get info(): SocketInfo {
    return {} as SocketInfo
  }

  get store(): ISocketEventStore {
    return {} as ISocketEventStore
  }

  async connect(): Promise<void> {
    return undefined
  }

  async sendData<TData>(data: TData): Promise<SocketSendReply> {
    console.log(data)
    return {messageId: 0}
  }

  async sendBytes(bytes: number[]): Promise<SocketSendReply> {
    console.log(bytes)
    return {messageId: 0}
  }
}

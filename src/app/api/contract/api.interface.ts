import { ISocketClient } from '../../../core/socket'

export interface IApiServer {
  listen(port: number): Promise<void>
}

export interface IApiRouter {
  init(): Promise<void>
}

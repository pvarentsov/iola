import { CliConfig } from '@iola/api/cli'
import { IHttpServer } from '@iola/api/http'
import { ISocketClient } from '@iola/core/socket'

export interface ICliInteractive {
  listenServer(server: IHttpServer): Promise<void>
  listenClient(client: ISocketClient): Promise<void>
}

export interface ICliParser {
  parse(): CliConfig
}

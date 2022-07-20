import { CliConfig } from '@iola/api/cli'
import { IHttpServer } from '@iola/api/http'
import { ISocketClient } from '@iola/core/socket'

export interface ICliInteractive {
  listen(server: IHttpServer, client: ISocketClient): Promise<void>
}

export interface ICliParser {
  parse(args?: string[]): CliConfig
}

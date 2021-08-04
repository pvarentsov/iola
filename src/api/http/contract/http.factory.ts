import { IHttpServer } from '@iola/api/http'
import { HttpServer } from '@iola/api/http/nest/http.server'
import { ISocketClient } from '@iola/core/socket'

export class HttpFactory {
  static createServer(client: ISocketClient, version: string): IHttpServer {
    return new HttpServer(client, version)
  }
}

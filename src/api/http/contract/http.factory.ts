import { IHttpServer } from '@iola/api/http'
import { HttpServer } from '@iola/api/http/nest/http.server'
import { ISocketClient } from '@iola/core/socket'

export class HttpFactory {
  static createServer(client: ISocketClient): IHttpServer {
    return new HttpServer(client)
  }
}

import { IHttpServer } from '@iola/api/http'
import { HttpRouter } from '@iola/api/http/fastify/http.router'
import { HttpServer } from '@iola/api/http/fastify/http.server'
import { ISocketClient } from '@iola/core/socket'
import Fastify from 'fastify'

export class HttpFactory {
  static createServer(client: ISocketClient): IHttpServer {
    const adapter = Fastify({})

    const router = new HttpRouter(adapter, client)
    const server = new HttpServer(adapter, router, client)

    return server
  }
}

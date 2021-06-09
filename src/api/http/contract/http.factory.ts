import Fastify from 'fastify'
import { ISocketClient } from '../../../core/socket'
import { HttpRouter } from '../fastify/http.router'
import { HttpServer } from '../fastify/http.server'
import { IApiServer } from './http.interface'

export class HttpFactory {
  static createServer(client: ISocketClient): IApiServer {
    const adapter = Fastify({})

    const router = new HttpRouter(adapter, client)
    const server = new HttpServer(adapter, router, client)

    return server
  }
}

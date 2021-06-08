import Fastify from 'fastify'
import { ISocketClient } from '../../../core/socket'
import { ApiRouter } from '../fastify/api.router'
import { ApiServer } from '../fastify/api.server'
import { IApiServer } from './api.interface'

export class ApiFactory {
  static createServer(client: ISocketClient): IApiServer {
    const adapter = Fastify({})

    const router = new ApiRouter(adapter, client)
    const server = new ApiServer(adapter, router, client)

    return server
  }
}

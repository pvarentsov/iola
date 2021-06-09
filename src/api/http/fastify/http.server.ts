import { FastifyInstance } from 'fastify'
import { ISocketClient } from '../../../core/socket'
import { IHttpRouter, IHttpServer } from '../contract/http.interface'

export class HttpServer implements IHttpServer {
  private readonly adapter: FastifyInstance
  private readonly router: IHttpRouter
  private readonly client: ISocketClient

  constructor(adapter: FastifyInstance, router: IHttpRouter, client: ISocketClient) {
    this.adapter = adapter
    this.router = router
    this.client = client
  }

  async listen(port: number): Promise<void> {
    await this.router.init()
    await this.adapter.listen({port})
  }
}

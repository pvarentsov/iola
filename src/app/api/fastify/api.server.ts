import { FastifyInstance } from 'fastify'
import { ISocketClient } from '../../../core/socket'
import { IApiRouter, IApiServer } from '../contract/api.interface'

export class ApiServer implements IApiServer {
  private readonly adapter: FastifyInstance
  private readonly router: IApiRouter
  private readonly client: ISocketClient

  constructor(adapter: FastifyInstance, router: IApiRouter, client: ISocketClient) {
    this.adapter = adapter
    this.router = router
    this.client = client
  }

  async listen(port: number): Promise<void> {
    await this.router.init()
    await this.adapter.listen({port})
  }
}

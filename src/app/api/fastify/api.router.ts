import { FastifyInstance } from 'fastify'
import { ISocketClient, SocketEventType } from '../../../core/socket'
import { IApiRouter } from '../contract/api.interface'

export class ApiRouter implements IApiRouter {
  private readonly adapter: FastifyInstance
  private readonly client: ISocketClient

  constructor(adapter: FastifyInstance, client: ISocketClient) {
    this.adapter = adapter
    this.client = client
  }

  async init(): Promise<void> {
    this.getMessages()
  }

  private getMessages(): void {
    this.adapter.get('/messages', (request, reply) => {
      const query = request.query as {type?: SocketEventType}

      const types = query.type
        ? [query.type]
        : [SocketEventType.ReceivedMessage, SocketEventType.SentMessage]

      const messages = this.client
        .store
        .list({types})

      reply.send(messages)
    })
  }
}

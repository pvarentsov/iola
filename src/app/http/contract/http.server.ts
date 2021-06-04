import Fastify, { FastifyInstance } from 'fastify'
import { ISocketClient, SocketEventType } from '../../../core/socket'

export class HttpServer {
  private readonly server: FastifyInstance
  private readonly client: ISocketClient

  constructor(socketClient: ISocketClient) {
    this.server = Fastify({})
    this.client = socketClient
  }

  async listen(port: number): Promise<void> {
    this.server.get('/messages', (request, reply) => {
      const messages = this.client.store.list({
        types: [
          SocketEventType.SentMessage,
          SocketEventType.ReceivedMessage,
        ]
      })

      reply.send(messages)
    })

    await this.server.listen({port})
  }
}

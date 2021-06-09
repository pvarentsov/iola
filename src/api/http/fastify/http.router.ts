import Ajv from 'ajv'
import { FastifyInstance } from 'fastify'
import { FastifyValidationResult } from 'fastify/types/schema'
import { ISocketClient, SocketEventType } from '../../../core/socket'
import { IHttpRouter } from '../contract/http.interface'
import { GetMessageListRequest, GetMessageListRouteOptions } from './http.schema'

export class HttpRouter implements IHttpRouter {
  private readonly adapter: FastifyInstance
  private readonly client: ISocketClient
  private readonly validator: Ajv

  constructor(adapter: FastifyInstance, client: ISocketClient) {
    this.adapter = adapter
    this.client = client

    this.validator = new Ajv({
      strict: true,
      allErrors: true,
    })
  }

  async init(): Promise<void> {
    this.getMessages()

    this.adapter.setValidatorCompiler(data => this
      .validator
      .compile(data.schema) as FastifyValidationResult
    )
  }

  private getMessages(): void {
    this.adapter.get<GetMessageListRequest>('/messages', GetMessageListRouteOptions, (request, reply) => {
      const query = request.query

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

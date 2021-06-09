import Ajv from 'ajv'
import { FastifyInstance } from 'fastify'
import { RouteShorthandOptions } from 'fastify/types/route'
import { FastifyValidationResult } from 'fastify/types/schema'
import { ISocketClient, SocketEventType } from '../../../core/socket'
import { IApiRouter } from '../contract/http.interface'
import { GetMessageListQuery, GetMessageListRequest, MessageList } from './http.schema'

export class HttpRouter implements IApiRouter {
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

    this
      .adapter
      .setValidatorCompiler(data => this.validator.compile(data.schema) as FastifyValidationResult)
  }

  private getMessages(): void {
    const options: RouteShorthandOptions = {
      schema: {
        querystring: GetMessageListQuery,
        response: {200: MessageList},
      }
    }

    this.adapter.get<GetMessageListRequest>('/messages', options, (request, reply) => {
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

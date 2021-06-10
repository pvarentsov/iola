import Ajv from 'ajv'
import { FastifyInstance } from 'fastify'
import { FastifyValidationResult } from 'fastify/types/schema'
import { MessageFormat } from '../../../core/common'
import { ISocketClient, SocketEventType } from '../../../core/socket'
import { IHttpRouter } from '../contract/http.interface'
import {
  GetMessageListRequest,
  GetMessageListRouteOptions,
  GetMessageRequest,
  GetMessageRouteOptions,
  SendMessageRequest,
  SendMessageRouteOptions,
} from './http.schema'

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
    this.getMessage()
    this.getMessages()
    this.sendMessages()

    this.adapter.setValidatorCompiler(data => this
      .validator
      .compile(data.schema) as FastifyValidationResult
    )
  }

  private getMessage(): void {
    this.adapter.get<GetMessageRequest>('/messages/:id', GetMessageRouteOptions, (request, reply) => {
      const parsedId = request.params.id.replace(new RegExp('#', 'g'), '')
      const id = Number(parsedId)

      const message = this.client
        .store
        .list()
        .find(m => m.id === id)

      if (message) {
        reply.send(message)
        return
      }

      reply.status(404).send({})
    })
  }

  private getMessages(): void {
    this.adapter.get<GetMessageListRequest>('/messages', GetMessageListRouteOptions, (request, reply) => {
      const types: SocketEventType[] = []

      if (typeof request.query.type === 'string') {
        types.push(request.query.type)
      }
      if (Array.isArray(request.query.type)) {
        types.push(...request.query.type)
      }

      const messages = this.client
        .store
        .list({types})

      reply.send(messages)
    })
  }

  private sendMessages(): void {
    this.adapter.post<SendMessageRequest>('/messages', SendMessageRouteOptions, (request, reply) => {
      const {data, format, event} = request.body

      if (format === MessageFormat.ByteArray) {
        const isByteArray = Array.isArray(data) && data.every(v => typeof v === 'number')

        if (!isByteArray) {
          reply.status(400).send({
            statusCode: 400,
            message: 'Bad Request',
            error: 'data must be an integer array'
          })

          return
        }
      }

      this.client.send(
        data,
        format,
        event,
      )

      reply.send({})
    })
  }
}

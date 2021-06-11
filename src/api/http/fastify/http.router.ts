import Ajv from 'ajv'
import { FastifyInstance } from 'fastify'
import { FastifyValidationResult } from 'fastify/types/schema'
import { ISocketClient, SocketEventType } from '../../../core/socket'
import { IHttpRouter } from '../contract/http.interface'
import {
  GetMessageListRequest,
  GetMessageListRouteOptions,
  GetMessageRequest,
  GetMessageRouteOptions,
  SendMessageBodyWithBytes,
  SendMessageBodyWithData,
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
      const body = request.body

      const data = (body as SendMessageBodyWithData).data
      const bytes = (body as SendMessageBodyWithBytes).bytes

      if (data !== undefined) {
        this.client.sendData(data)
      }
      if (bytes !== undefined) {
        this.client.sendBytes(bytes)
      }

      reply.send({})
    })
  }
}

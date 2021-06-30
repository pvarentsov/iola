// import { AnyObject } from '@iola/core/common'
// import Ajv from 'ajv'
// import { FastifyInstance } from 'fastify'
// import swagger from 'fastify-swagger'
// import { FastifyValidationResult } from 'fastify/types/schema'
//
// import { IHttpRouter } from '@iola/api/http'
// import {
//   GetMessageListRequest,
//   GetMessageListRouteOptions,
//   GetMessageRequest,
//   GetMessageRouteOptions,
//   SendMessageBodyWithBytes,
//   SendMessageBodyWithData,
//   SendMessageRequest,
//   SendMessageRouteOptions,
// } from '@iola/api/http/fastify/http.schema'
// import { ISocketClient, SocketEventType } from '@iola/core/socket'
//
// export class HttpRouter implements IHttpRouter {
//   private readonly adapter: FastifyInstance
//   private readonly client: ISocketClient
//   private readonly validator: Ajv
//
//   constructor(adapter: FastifyInstance, client: ISocketClient) {
//     this.adapter = adapter
//     this.client = client
//
//     this.validator = new Ajv({
//       strict: true,
//       allErrors: true,
//       coerceTypes: 'array',
//     })
//   }
//
//   async init(): Promise<void> {
//     this.adapter.register(swagger, {
//       exposeRoute: true,
//       routePrefix: '/docs',
//       openapi: {
//         info: {
//           title: 'iola',
//           description: 'Rest API for iola socket client',
//           version: '1.0.0'
//         }
//       }
//     })
//
//     this.adapter.setValidatorCompiler(data => this
//       .validator
//       .compile(data.schema) as FastifyValidationResult
//     )
//
//     this.getMessage()
//     this.getMessages()
//     this.sendMessage()
//
//     this.adapter.ready(err => {
//       if (err) {
//         throw err
//       }
//
//       this.adapter.swagger()
//     })
//   }
//
//   private getMessage(): void {
//     this.adapter.get<GetMessageRequest>('/messages/:id', GetMessageRouteOptions, (request, reply) => {
//       const id = Number(request.params.id)
//
//       const message = this.client
//         .store
//         .list()
//         .find(m => m.id === id)
//
//       if (message) {
//         reply.send(message)
//         return
//       }
//
//       reply.status(404).send({
//         statusCode: 404,
//         error: 'Not Found',
//         message: `message with id ${id} not found`
//       })
//     })
//   }
//
//   private getMessages(): void {
//     this.adapter.get<GetMessageListRequest>('/messages', GetMessageListRouteOptions, (request, reply) => {
//       const types: SocketEventType[] = []
//
//       if (typeof request.query.type === 'string') {
//         types.push(request.query.type)
//       }
//       if (Array.isArray(request.query.type)) {
//         types.push(...request.query.type)
//       }
//
//       const messages = this.client
//         .store
//         .list({types})
//
//       reply.send(messages)
//     })
//   }
//
//   private sendMessage(): void {
//     this.adapter.post<SendMessageRequest>('/messages', SendMessageRouteOptions, async (request, reply) => {
//       const body = request.body
//
//       const data = (body as SendMessageBodyWithData).data
//       const bytes = (body as SendMessageBodyWithBytes).bytes
//
//       if (data !== undefined && bytes !== undefined) {
//         reply.status(400).send({
//           statusCode: 400,
//           error: 'Bad Request',
//           message: 'body must match exactly one schema in oneOf'
//         })
//
//         return
//       }
//
//       let response: AnyObject = {}
//
//       if (data !== undefined) {
//         response = await this.client.sendData(data)
//       }
//       if (bytes !== undefined) {
//         response = await this.client.sendBytes(bytes)
//       }
//
//       reply.send(response)
//     })
//   }
// }

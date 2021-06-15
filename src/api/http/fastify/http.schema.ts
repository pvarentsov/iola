import { RequestGenericInterface } from 'fastify'
import { RouteShorthandOptions } from 'fastify/types/route'
import S from 'fluent-json-schema'

import { EnumUtil } from '@iola/core/common'
import { SocketEventType } from '@iola/core/socket'

// Schemas

const Error = S
  .object()
  .prop('statusCode', S.number())
  .prop('error', S.string())
  .prop('message', S.string())

export const Message = S
  .object()
  .prop('id', S.number())
  .prop('type', S.string().enum([SocketEventType.ReceivedMessage, SocketEventType.SentMessage]))
  .prop('date', S.string())
  .prop('message', S.anyOf([
    S.string(),
    S.number(),
    S.boolean(),
    S.array().items(S.raw({})).additionalItems(true),
    S.object().additionalProperties(true),
  ]).raw({
    nullable: true
  }))

export const MessageList = S
  .array()
  .items(Message)

export const GetMessage = S
  .object()
  .prop('id', S.string())

export const GetMessageList = S
  .object()
  .prop('type', S.array().items(S.string().enum(EnumUtil.values(SocketEventType))))

export const SendMessage = S.oneOf([
  S.object()
    .prop('event', S.string().description('Used only for SocketIO client. Ignored for other client types'))
    .prop('data', S.anyOf([
      S.string(),
      S.number(),
      S.boolean(),
      S.array().items(S.raw({})),
      S.object(),
    ]).required()),

  S.object()
    .prop('event', S.string().description('Used only for SocketIO client. Ignored for other client types'))
    .prop('bytes', S.array().items(S.number().minimum(0).maximum(255)).required())
])

// Route options

export const GetMessageRouteOptions: RouteShorthandOptions = {
  schema: {
    description: 'Get message by id',
    tags: ['Message'],
    params: GetMessage,
    response: {
      200: Message,
      400: Error,
      404: Error,
      500: Error,
    },
  }
}

export const GetMessageListRouteOptions: RouteShorthandOptions = {
  schema: {
    description: 'Get message list',
    tags: ['Message'],
    querystring: GetMessageList,
    response: {
      200: MessageList,
      400: Error,
      500: Error,
    },
  }
}

export const SendMessageRouteOptions: RouteShorthandOptions = {
  schema: {
    description: 'Send message',
    tags: ['Message'],
    body: SendMessage,
    response: {
      200: S.object().prop('messageId', S.number()),
      400: Error,
      500: Error,
    },
  }
}

// Interfaces

export interface GetMessageRequest extends RequestGenericInterface {
  Params: {
    id: string
  }
}

export interface GetMessageListRequest extends RequestGenericInterface {
  Querystring: {
    type: SocketEventType|SocketEventType[]
  }
}

export interface SendMessageRequest extends RequestGenericInterface {
  Body: SendMessageBodyWithData | SendMessageBodyWithBytes
}

export interface SendMessageBodyWithData {
  data: any,
  event?: string,
}

export interface SendMessageBodyWithBytes {
  bytes: number[],
  event?: string,
}

import { RequestGenericInterface } from 'fastify'
import { RouteShorthandOptions } from 'fastify/types/route'
import S from 'fluent-json-schema'
import { MessageFormat } from '../../../core/common'
import { SocketEventType } from '../../../core/socket'

// Schemas

export const Message = S
  .object()
  .title('Message')
  .prop('id', S.number())
  .prop('type', S.enum([SocketEventType.ReceivedMessage, SocketEventType.SentMessage]))
  .prop('date', S.string())
  .prop('message', S.object()
    .prop('format', S.enum([MessageFormat.String, MessageFormat.JSON, MessageFormat.ByteArray]))
    .prop('message', S.oneOf([
      S.string(),
      S.number(),
      S.boolean(),
      S.array().additionalItems(true),
      S.object().additionalProperties(true)
    ]))
  )

export const MessageList = S
  .array()
  .items(Message)

export const GetMessageListQuery = S
  .object()
  .prop('type', S.enum([SocketEventType.ReceivedMessage, SocketEventType.SentMessage]))

// Route options

export const GetMessageListRouteOptions: RouteShorthandOptions = {
  schema: {
    querystring: GetMessageListQuery,
    response: {200: MessageList},
  }
}

// Interfaces

export interface GetMessageListRequest extends RequestGenericInterface {
  Querystring: {
    type: SocketEventType.ReceivedMessage | SocketEventType.SentMessage
  }
}

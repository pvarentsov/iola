import { RequestGenericInterface } from 'fastify'
import { RouteShorthandOptions } from 'fastify/types/route'
import S from 'fluent-json-schema'
import { SocketEventType } from '../../../core/socket'

// Schemas

export const Message = S
  .object()
  .title('Message')
  .prop('id', S.number())
  .prop('type', S.enum([SocketEventType.ReceivedMessage, SocketEventType.SentMessage]))
  .prop('date', S.string())
  .prop('message', S.oneOf([S.string(), S.object().additionalProperties(true)]))

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

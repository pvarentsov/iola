import { RequestGenericInterface } from 'fastify'
import S from 'fluent-json-schema'
import { SocketEventType } from '../../../core/socket'

// Schemas

export const Message = S
  .object()
  .title('Message')
  .prop('id', S.number())
  .prop('type', S.enum([SocketEventType.ReceivedMessage, SocketEventType.SentMessage]))
  .prop('date', S.string().format('date'))
  .prop('message', S.anyOf([S.string(), S.object()]))

export const MessageList = S
  .array()
  .items(Message)

export const GetMessageListQuery = S
  .object()
  .prop('type', S.enum([SocketEventType.ReceivedMessage, SocketEventType.SentMessage]))

// Interfaces

export interface GetMessageListRequest extends RequestGenericInterface {
  Querystring: {
    type: SocketEventType.ReceivedMessage | SocketEventType.SentMessage
  }
}

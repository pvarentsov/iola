import { AnyObject } from '../../../core/common'
import { SocketEventType } from '../../../core/socket'

export class ApiSchema {
  static readonly Message: AnyObject = {
    $id: 'Message',
    oneOf: [
      {
        type: 'object',
        properties: {
          event: {type: 'string'},
          message: {
            oneOf: [
              {type: 'string'},
              {type: 'object'},
              {type: 'binary'}
            ]
          }
        }
      },
      {type: 'any'}
    ]
  }

  static readonly MessageList: AnyObject = {
    $id: 'MessageList',
    type: 'array',
    items: {$ref: ApiSchema.Message.$id}
  }

  static readonly GetMessageListQuery: AnyObject = {
    $id: 'GetMessageListQuery',
    type: {
      type: 'string',
      enum: [SocketEventType.SentMessage, SocketEventType.ReceivedMessage]
    }
  }
}

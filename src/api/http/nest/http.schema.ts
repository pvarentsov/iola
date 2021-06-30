import { SocketEventType } from '@iola/core/socket'
import { ApiProperty } from '@nestjs/swagger'

export class Message {
  @ApiProperty({type: 'number'})
  id: number

  @ApiProperty({enum: SocketEventType})
  type: SocketEventType

  @ApiProperty({type: 'string', format: 'date'})
  date: Date

  @ApiProperty({type: 'object'})
  message: any
}

export class GetMessageList {
  @ApiProperty({enum: SocketEventType, isArray: true, required: false})
  type?: SocketEventType
}

export class SendDataMessage {
  @ApiProperty({type: 'string', required: false})
  event?: number

  @ApiProperty({type: 'object'})
  data: any
}

export class SendBytesMessage {
  @ApiProperty({type: 'string', required: false})
  event?: number

  @ApiProperty({type: 'number', isArray: true})
  bytes: number[]
}

export class SendMessageResponse {
  @ApiProperty({type: 'number'})
  messageId: number

  @ApiProperty({type: 'object', required: false})
  reply?: any
}

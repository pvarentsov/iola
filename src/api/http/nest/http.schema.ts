import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsIn, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator'

import { toArray } from '@iola/api/http/nest/http.transformer'
import { EnumUtil, MessageFormat } from '@iola/core/common'
import { SocketEventType } from '@iola/core/socket'

export class MessageModel {
  @ApiProperty({type: 'number'})
  id: number

  @ApiProperty({enum: SocketEventType})
  type: SocketEventType

  @ApiProperty({type: 'string', example: new Date()})
  date: Date

  @ApiProperty({type: 'object'})
  message: any
}

export class ErrorModel {
  @ApiProperty({type: 'number'})
  statusCode: number

  @ApiProperty({type: 'object'})
  message: any

  @ApiProperty({type: 'string'})
  error: string
}

export class GetMessageListQuery {
  @IsOptional()
  @IsIn(EnumUtil.values(SocketEventType), {each: true})
  @Transform(toArray)
  type: SocketEventType[]
}

export class SendDataBody {
  @ApiProperty({type: 'object', description: 'Any data'})
  @ValidateIf(object => object.bytes === undefined)
  data: any

  @ApiProperty({type: 'number', isArray: true, description: 'UInt8 Array'})
  @ValidateIf(object => object.data === undefined)
  @IsArray()
  @Min(0, {each: true})
  @Max(255, {each: true})
  bytes: number[]

  @ApiProperty({type: 'string', required: false, description: 'Only for SocketIO', default: '*'})
  @IsOptional()
  @IsString()
  event?: string
}

export class SendDataMessageBody {
  @ApiProperty({type: 'object', description: 'Any data'})
  data: any

  @ApiProperty({type: 'string', required: false, description: 'Only for SocketIO', default: '*'})
  event?: string
}

export class SendBytesMessageBody {
  @ApiProperty({type: 'number', isArray: true, description: 'UInt8 Array'})
  bytes: number[]

  @ApiProperty({type: 'string', required: false, description: 'Only for SocketIO', default: '*'})
  event?: string
}

export class SendMessageReply {
  @ApiProperty({enum: MessageFormat})
  format: MessageFormat

  @ApiProperty({type: 'object', description: 'Any data'})
  data: any

  @ApiProperty({type: 'number', required: false, description: 'Only for binary messages'})
  size?: number

  @ApiProperty({type: 'string', required: false, description: 'Only for SocketIO'})
  event?: string
}

export class SendMessageResponse {
  @ApiProperty({type: 'number'})
  messageId: number

  @ApiProperty({type: SendMessageReply, required: false})
  reply?: SendMessageReply
}

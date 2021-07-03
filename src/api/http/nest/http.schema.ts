import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsDefined, IsIn, IsOptional, Max, Min, ValidateIf } from 'class-validator'

import { EnumUtil } from '@iola/core/common'
import { SocketEventType } from '@iola/core/socket'

export class Message {
  @ApiProperty({type: 'number'})
  id: number

  @ApiProperty({enum: SocketEventType})
  type: SocketEventType

  @ApiProperty({type: 'string', example: new Date()})
  date: Date

  @ApiProperty({type: 'object'})
  message: any
}

export class GetMessageList {
  @ApiProperty({enum: SocketEventType, isArray: true, required: false})
  @IsOptional()
  @IsIn(EnumUtil.values(SocketEventType), {each: true})
  @Transform(p => Array.isArray(p.value) ? p.value : [p.value])
  type?: SocketEventType
}

export class SendData {
  @ApiProperty({type: 'object', description: 'Any data'})
  @ValidateIf(object => object.bytes === undefined)
  @IsDefined()
  data: any

  @ApiProperty({type: 'number', isArray: true, description: 'UInt8 Array'})
  @ValidateIf(object => object.data === undefined)
  @IsArray()
  @Min(0, {each: true})
  @Max(255, {each: true})
  bytes: number[]
}

export class SendDataMessage {
  @ApiProperty({type: 'object', description: 'Any data'})
  data: any
}

export class SendBytesMessage {
  @ApiProperty({type: 'number', isArray: true, description: 'UInt8 Array'})
  bytes: number[]
}

export class SendMessageResponse {
  @ApiProperty({type: 'number'})
  messageId: number

  @ApiProperty({type: 'object', required: false})
  reply?: any
}

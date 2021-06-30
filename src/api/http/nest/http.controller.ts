import {
  GetMessageList,
  Message,
  SendBytesMessage,
  SendDataMessage,
  SendMessageResponse,
} from '@iola/api/http/nest/http.schema'

import { AnyObject } from '@iola/core/common'
import { ISocketClient, SocketEventType } from '@iola/core/socket'
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBody, ApiExtraModels, ApiQuery, ApiResponse, ApiTags, refs } from '@nestjs/swagger'

@Controller()
export class HttpController {
  constructor(
    @Inject('SOCKET_CLIENT')
    private readonly client: ISocketClient
  ) {}

  @Get('/messages/:id')
  @ApiTags('Messages')
  @ApiResponse({status: 200, type: Message})
  getMessage(@Param('id') id: number): any {
    const message = this.client
      .store
      .list()
      .find(m => m.id === id)

    if (!message) {
      throw new NotFoundException(undefined, `message with id ${id} not found`)
    }

    return message
  }

  @Get('/messages')
  @ApiTags('Messages')
  @ApiQuery({type: GetMessageList})
  @ApiResponse({status: 200, type: Message, isArray: true})
  getMessageList(@Query() query: AnyObject): any {
    const types: SocketEventType[] = []

    if (typeof query.type === 'string') {
      types.push(query.type as SocketEventType)
    }
    if (Array.isArray(query.type)) {
      types.push(...query.type)
    }

    return this.client
      .store
      .list({types})
  }

  @Post('/messages')
  @ApiTags('Messages')
  @ApiExtraModels(SendDataMessage, SendBytesMessage)
  @ApiBody({schema: {oneOf: refs(SendDataMessage, SendBytesMessage)}})
  @ApiResponse({status: 200, type: SendMessageResponse})
  sendMessage(@Body() body: AnyObject): any {
    const data = body.data
    const bytes = body.bytes

    if (data !== undefined && bytes !== undefined) {
      throw new BadRequestException(undefined, 'body must match exactly one schema in oneOf')
    }

    if (data !== undefined) {
      return this.client.sendData(data)
    }
    if (bytes !== undefined) {
      return this.client.sendBytes(bytes)
    }
  }
}

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

import { AnyObject } from '@iola/core/common'
import { ISocketClient, SocketEventType } from '@iola/core/socket'

@Controller()
export class HttpController {
  constructor(
    @Inject('SOCKET_CLIENT')
    private readonly client: ISocketClient
  ) {}

  @Get('/messages/:id')
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

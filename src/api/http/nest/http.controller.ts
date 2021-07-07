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
import { ApiBody, ApiExtraModels, ApiOperation, ApiQuery, ApiResponse, ApiTags, refs } from '@nestjs/swagger'

import {
  GetMessageList,
  Message,
  SendBytesMessage,
  SendData,
  SendDataMessage,
  SendMessageResponse,
} from '@iola/api/http/nest/http.schema'
import { ISocketClient, SocketEvent, SocketSendReply } from '@iola/core/socket'

@Controller()
export class HttpController {
  constructor(
    @Inject('SOCKET_CLIENT')
    private readonly client: ISocketClient
  ) {}

  @Get('/messages/:id')
  @ApiTags('Messages')
  @ApiOperation({description: 'Get message by id', summary: 'Get message by id'})
  @ApiResponse({status: 200, type: Message})
  getMessage(@Param('id') id: string): SocketEvent {
    const message = this.client
      .store
      .list()
      .find(m => m.id === Number(id))

    if (!message) {
      throw new NotFoundException(undefined, `message with id ${id} not found`)
    }

    return message
  }

  @Get('/messages')
  @ApiTags('Messages')
  @ApiOperation({description: 'Get message list', summary: 'Get message list'})
  @ApiQuery({type: GetMessageList})
  @ApiResponse({status: 200, type: Message, isArray: true})
  getMessageList(@Query() query: GetMessageList): SocketEvent[] {
    return this.client
      .store
      .list({types: query.type})
  }

  @Post('/messages')
  @ApiTags('Messages')
  @ApiOperation({description: 'Send message', summary: 'Send message'})
  @ApiExtraModels(SendDataMessage, SendBytesMessage)
  @ApiBody({schema: {oneOf: refs(SendDataMessage, SendBytesMessage)}})
  @ApiResponse({status: 201, type: SendMessageResponse})
  sendMessage(@Body() body: SendData): Promise<SocketSendReply> {
    const data = body.data
    const bytes = body.bytes

    if (data !== undefined && bytes !== undefined) {
      throw new BadRequestException(undefined, 'body must match exactly one schema in oneOf')
    }

    if (data !== undefined) {
      return this.client.sendData(data)
    }

    return this.client.sendBytes(bytes)
  }
}

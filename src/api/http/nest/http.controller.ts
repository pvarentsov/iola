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
import {
  ApiBadRequestResponse,
  ApiBody, ApiCreatedResponse,
  ApiExtraModels, ApiInternalServerErrorResponse, ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  refs,
} from '@nestjs/swagger'

import {
  ErrorModel,
  GetMessageListQuery,
  MessageModel,
  SendBytesMessageBody,
  SendDataBody,
  SendDataMessageBody,
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
  @ApiOkResponse({type: MessageModel})
  @ApiBadRequestResponse({type: ErrorModel})
  @ApiNotFoundResponse({type: ErrorModel})
  @ApiInternalServerErrorResponse({type: ErrorModel})
  getMessage(@Param('id') id: string): SocketEvent {
    const message = this.client
      .store
      .list()
      .find(m => m.id === Number(id))

    if (!message) {
      throw new NotFoundException(`message with id ${id} not found`, 'Not Found')
    }

    return message
  }

  @Get('/messages')
  @ApiTags('Messages')
  @ApiOperation({description: 'Get message list', summary: 'Get message list'})
  @ApiQuery({type: GetMessageListQuery})
  @ApiOkResponse({type: MessageModel, isArray: true})
  @ApiBadRequestResponse({type: ErrorModel})
  @ApiNotFoundResponse({type: ErrorModel})
  @ApiInternalServerErrorResponse({type: ErrorModel})
  getMessageList(@Query() query: GetMessageListQuery): SocketEvent[] {
    return this.client
      .store
      .list({types: query.type})
  }

  @Post('/messages')
  @ApiTags('Messages')
  @ApiOperation({description: 'Send message', summary: 'Send message'})
  @ApiExtraModels(SendDataMessageBody, SendBytesMessageBody)
  @ApiBody({schema: {oneOf: refs(SendDataMessageBody, SendBytesMessageBody)}})
  @ApiCreatedResponse({type: SendMessageResponse})
  @ApiBadRequestResponse({type: ErrorModel})
  @ApiNotFoundResponse({type: ErrorModel})
  @ApiInternalServerErrorResponse({type: ErrorModel})
  sendMessage(@Body() body: SendDataBody): Promise<SocketSendReply> {
    const data = body.data
    const bytes = body.bytes
    const event = body.event

    if (data !== undefined && bytes !== undefined) {
      throw new BadRequestException('body must match exactly one schema in oneOf', 'Bad Request')
    }

    if (data !== undefined) {
      return this.client.sendData(data, event)
    }

    return this.client.sendBytes(bytes, event)
  }
}

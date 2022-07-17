import { WsServer } from './server/ws.server'
import { HttpFactory } from '@iola/api/http'
import { ISocketClient, SocketFactory, SocketType } from '@iola/core/socket'
import { BinaryEncoding } from '@iola/core/common'
import * as supertest from 'supertest'
import { INestApplication } from '@nestjs/common'
import { AddressInfo, createServer } from 'net'

describe('WebSocket', () => {
  const states = new Array<State>()

  afterEach(async () => {
    for (const state of states) {
      await state.wss.close()
      await state.client.close()
      await state.nestApp.close()
    }
  })

  it('Send string message',  async () => {
    const state = await createState()
    states.push(state)

    const sendMsgRes = await supertest(state.nestApp.getHttpServer())
      .post('/messages')
      .send({data: 'string msg'})
      .expect(201)

    const getMsgRes = await supertest(state.nestApp.getHttpServer())
      .get('/messages/' + sendMsgRes.body.messageId)
      .send()
      .expect(200)

    expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
    expect(getMsgRes.body.type).toEqual('SentMessage')
    expect(getMsgRes.body.message).toEqual({format: 'string', data: 'string msg'})

    const getReplyMsgRes = await supertest(state.nestApp.getHttpServer())
      .get('/messages/' + (sendMsgRes.body.messageId + 1))
      .send()
      .expect(200)

    expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
    expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
    expect(getReplyMsgRes.body.message).toEqual({format: 'string', data: 'string reply'})
  })

  it('Send binary message',  async () => {
    const state = await createState()
    states.push(state)

    const bytes = Array.from(Buffer.from('binary msg'))
    const replyBytes = Array.from(Buffer.from('binary reply'))

    const sendMsgRes = await supertest(state.nestApp.getHttpServer())
      .post('/messages')
      .send({bytes})
      .expect(201)

    const getMsgRes = await supertest(state.nestApp.getHttpServer())
      .get('/messages/' + sendMsgRes.body.messageId)
      .send()
      .expect(200)

    expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
    expect(getMsgRes.body.type).toEqual('SentMessage')
    expect(getMsgRes.body.message).toEqual({
      format: 'byte-array',
      size: bytes.length,
      data: bytes,
      utf8: 'binary msg'
    })

    const getReplyMsgRes = await supertest(state.nestApp.getHttpServer())
      .get('/messages/' + (sendMsgRes.body.messageId + 1))
      .send()
      .expect(200)

    expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
    expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
    expect(getReplyMsgRes.body.message).toEqual({
      format: 'byte-array',
      size: replyBytes.length,
      data: replyBytes,
      utf8: 'binary reply'
    })
  })

  it('Send json message',  async () => {
    const state = await createState()
    states.push(state)

    const sendMsgRes = await supertest(state.nestApp.getHttpServer())
      .post('/messages')
      .send({data: {message: 'json msg'}})
      .expect(201)

    const getMsgRes = await supertest(state.nestApp.getHttpServer())
      .get('/messages/' + sendMsgRes.body.messageId)
      .send()
      .expect(200)

    expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
    expect(getMsgRes.body.type).toEqual('SentMessage')
    expect(getMsgRes.body.message).toEqual({format: 'json', data: {message: 'json msg'}})

    const getReplyMsgRes = await supertest(state.nestApp.getHttpServer())
      .get('/messages/' + (sendMsgRes.body.messageId + 1))
      .send()
      .expect(200)

    expect(getReplyMsgRes.status).toEqual(200)
    expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
    expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
    expect(getReplyMsgRes.body.message).toEqual({format: 'json', data: {message: 'json reply'}})
  })

  it('Send json message with request id',  async () => {
    const state = await createState()
    states.push(state)

    const sendMsgRes = await supertest(state.nestApp.getHttpServer())
      .post('/messages')
      .send({data: {requestId: 1, message: 'json msg'}})
      .expect(201)

    expect(sendMsgRes.body.reply).toEqual({
      format: 'json',
      data: {
        requestId: 1,
        message: 'json reply'
      }
    })

    const getMsgRes = await supertest(state.nestApp.getHttpServer())
      .get('/messages/' + sendMsgRes.body.messageId)
      .send()
      .expect(200)

    expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
    expect(getMsgRes.body.type).toEqual('SentMessage')
    expect(getMsgRes.body.message).toEqual({
      format: 'json',
      data: {
        requestId: 1,
        message: 'json msg'
      }
    })

    const getReplyMsgRes = await supertest(state.nestApp.getHttpServer())
      .get('/messages/' + (sendMsgRes.body.messageId + 1))
      .send()
      .expect(200)

    expect(getReplyMsgRes.status).toEqual(200)
    expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
    expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
    expect(getReplyMsgRes.body.message).toEqual({
      format: 'json',
      data: {
        requestId: 1,
        message: 'json reply'
      }
    })
  })
})

async function createState(): Promise<State> {
  const wssPort = await getFreePort()
  const wss = new WsServer()
  await wss.start(wssPort)

  const client = newClient(wssPort)
  await client.connect()

  const httpServerPort = await getFreePort()
  const httpServer = await HttpFactory.createServer(client, '')
  await httpServer.listen('0.0.0.0', httpServerPort)

  const nestApp = httpServer.engine<INestApplication>()

  return {wss, client, nestApp}
}


function newClient(port: number): ISocketClient {
  const client = SocketFactory.createClient({
    type: SocketType.WebSocket,
    address: 'ws://127.0.0.1:' + port,
    binaryEncoding: BinaryEncoding.Utf8,
    connectionTimeout: 1000,
    reconnectionInterval: 1000,
    replyTimeout: 1000,
    headers: {},
  })

  return client
}

type State = {
  wss: WsServer
  client: ISocketClient
  nestApp: INestApplication
}

async function getFreePort(): Promise<number> {
  return new Promise( resolve => {
    const server = createServer()

    server.listen(0, () => {
      const addr = server.address()
      server.close(() => resolve((addr as AddressInfo).port))
    })
  })
}
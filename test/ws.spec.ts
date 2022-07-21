import { SocketType } from '@iola/core/socket'
import { BinaryEncoding } from '@iola/core/common'
import * as supertest from 'supertest'
import { WSTestStand, TestUtil } from './util/test.util'

describe('WebSocket', () => {
  const opts = {
    type: SocketType.WebSocket,
    address: '',
    binaryEncoding: BinaryEncoding.Utf8,
    connectionTimeout: 1000,
    reconnectionInterval: 1,
    replyTimeout: 1000,
    headers: {
      user: 'user',
      pass: 'pass',
    },
  }

  const stands = new Array<WSTestStand>()

  afterEach(async () => TestUtil.closeWSStands(stands))

  it('Send string message',  async () => {
    const stand = await TestUtil.prepareWSStand(opts)
    stands.push(stand)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({data: 'string msg'})
      .expect(201)

    const getMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages/' + sendMsgRes.body.messageId)
      .send()
      .expect(200)

    expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
    expect(getMsgRes.body.type).toEqual('SentMessage')
    expect(getMsgRes.body.message).toEqual({format: 'string', data: 'string msg'})

    const getReplyMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages/' + (sendMsgRes.body.messageId + 1))
      .send()
      .expect(200)

    expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
    expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
    expect(getReplyMsgRes.body.message).toEqual({format: 'string', data: 'string reply'})
  })

  it('Send binary message',  async () => {
    const stand = await TestUtil.prepareWSStand(opts)
    stands.push(stand)

    const bytes = Array.from(Buffer.from('binary msg'))
    const replyBytes = Array.from(Buffer.from('binary reply'))

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({bytes})
      .expect(201)

    const getMsgRes = await supertest(stand.nestApp.getHttpServer())
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

    const getReplyMsgRes = await supertest(stand.nestApp.getHttpServer())
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
    const stand = await TestUtil.prepareWSStand(opts)
    stands.push(stand)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({data: {message: 'json msg'}})
      .expect(201)

    const getMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages/' + sendMsgRes.body.messageId)
      .send()
      .expect(200)

    expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
    expect(getMsgRes.body.type).toEqual('SentMessage')
    expect(getMsgRes.body.message).toEqual({format: 'json', data: {message: 'json msg'}})

    const getReplyMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages/' + (sendMsgRes.body.messageId + 1))
      .send()
      .expect(200)

    expect(getReplyMsgRes.status).toEqual(200)
    expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
    expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
    expect(getReplyMsgRes.body.message).toEqual({format: 'json', data: {message: 'json reply'}})
  })

  it('Send json message with request id',  async () => {
    const stand = await TestUtil.prepareWSStand(opts)
    stands.push(stand)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
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

    const getMsgRes = await supertest(stand.nestApp.getHttpServer())
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

    const getReplyMsgRes = await supertest(stand.nestApp.getHttpServer())
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

  it('Send json message with request id and do not await timed out reply',  async () => {
    const stand = await TestUtil.prepareWSStand({...opts, replyTimeout: 5})
    stands.push(stand)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({data: {requestId: 'timeout', message: 'json msg'}})
      .expect(201)

    expect(sendMsgRes.body.reply).toBeUndefined()

    await TestUtil.delay(50)

    const getMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages/' + sendMsgRes.body.messageId)
      .send()
      .expect(200)

    expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
    expect(getMsgRes.body.type).toEqual('SentMessage')
    expect(getMsgRes.body.message).toEqual({
      format: 'json',
      data: {
        requestId: 'timeout',
        message: 'json msg'
      }
    })

    const getReplyMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages/' + (sendMsgRes.body.messageId + 1))
      .send()
      .expect(200)

    expect(getReplyMsgRes.status).toEqual(200)
    expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
    expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
    expect(getReplyMsgRes.body.message).toEqual({
      format: 'json',
      data: {
        requestId: 'timeout',
        message: 'json reply'
      }
    })
  })

  it('List messages',  async () => {
    const stand = await TestUtil.prepareWSStand(opts)
    stands.push(stand)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({data: 'string msg'})
      .expect(201)

    const listMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages?type=Connected&type=SentMessage&type=ReceivedMessage')
      .send()
      .expect(200)

    expect(listMsgRes.body.length).toEqual(3)

    expect(listMsgRes.body[0].id).toEqual(1)
    expect(listMsgRes.body[0].type).toEqual('Connected')
    expect(listMsgRes.body[0].message.type).toEqual('websocket')

    expect(listMsgRes.body[1].id).toEqual(sendMsgRes.body.messageId)
    expect(listMsgRes.body[1].type).toEqual('SentMessage')
    expect(listMsgRes.body[1].message).toEqual({format: 'string', data: 'string msg'})

    expect(listMsgRes.body[2].id).toEqual(sendMsgRes.body.messageId + 1)
    expect(listMsgRes.body[2].type).toEqual('ReceivedMessage')
    expect(listMsgRes.body[2].message).toEqual({format: 'string', data: 'string reply'})
  })

  it('Pass query string and headers',  async () => {
    const stand = await TestUtil.prepareWSStand(opts)
    stands.push(stand)

    expect(stand.wss.headers()).toMatchObject({user: 'user', pass: 'pass'})
    expect(stand.wss.query()).toMatchObject({isTestStand: 'true'})
  })

  it('Reconnect client if active connection is lost',  async () => {
    const stand = await TestUtil.prepareWSStand(opts)
    stands.push(stand)

    stand.wss.disconnectClients()
    await TestUtil.delay(50)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({data: 'string msg'})
      .expect(201)

    const listMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages')
      .send()
      .expect(200)

    expect(listMsgRes.body[0].id).toEqual(1)
    expect(listMsgRes.body[0].type).toEqual('Connected')
    expect(listMsgRes.body[0].message.type).toEqual('websocket')

    expect(listMsgRes.body[1].id).toEqual(2)
    expect(listMsgRes.body[1].type).toEqual('Closed')

    expect(listMsgRes.body[2].id).toEqual(3)
    expect(listMsgRes.body[2].type).toEqual('Reconnecting')

    expect(listMsgRes.body[3].id).toEqual(4)
    expect(listMsgRes.body[3].type).toEqual('Connected')
    expect(listMsgRes.body[3].message.type).toEqual('websocket')

    expect(listMsgRes.body[4].id).toEqual(sendMsgRes.body.messageId)
    expect(listMsgRes.body[4].type).toEqual('SentMessage')
    expect(listMsgRes.body[4].message).toEqual({format: 'string', data: 'string msg'})

    expect(listMsgRes.body[5].id).toEqual(sendMsgRes.body.messageId + 1)
    expect(listMsgRes.body[5].type).toEqual('ReceivedMessage')
    expect(listMsgRes.body[5].message).toEqual({format: 'string', data: 'string reply'})
  })

  it('Route not found',  async () => {
    const stand = await TestUtil.prepareWSStand(opts)
    stands.push(stand)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/message')
      .send({data: 'string msg'})
      .expect(404)

    expect(sendMsgRes.body).toEqual({
      statusCode: 404,
      message: 'Cannot POST /message',
      error: 'Not Found'
    })
  })
})
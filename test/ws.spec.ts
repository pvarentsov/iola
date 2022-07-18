import { SocketType } from '@iola/core/socket'
import { BinaryEncoding } from '@iola/core/common'
import * as supertest from 'supertest'
import { TestStand, TestUtil } from './util/test.util'

describe('WebSocket', () => {
  const opts = {
    type: SocketType.WebSocket,
    address: '',
    binaryEncoding: BinaryEncoding.Utf8,
    connectionTimeout: 1000,
    reconnectionInterval: 1000,
    replyTimeout: 1000,
    headers: {},
  }

  const stands = new Array<TestStand>()

  afterEach(async () => TestUtil.closeStands(stands))

  it('Send string message',  async () => {
    const stand = await TestUtil.prepareStand(opts)
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
    const stand = await TestUtil.prepareStand(opts)
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
    const stand = await TestUtil.prepareStand(opts)
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
    const stand = await TestUtil.prepareStand(opts)
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

  it('List messages',  async () => {
    const stand = await TestUtil.prepareStand(opts)
    stands.push(stand)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({data: 'string msg'})
      .expect(201)

    const listMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages')
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
})
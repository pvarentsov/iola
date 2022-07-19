import { SocketType } from '@iola/core/socket'
import { BinaryEncoding } from '@iola/core/common'
import * as supertest from 'supertest'
import { IOTestStand, TestUtil } from './util/test.util'

describe('SocketIO', () => {
  const opts = {
    type: SocketType.SocketIO,
    address: '',
    binaryEncoding: BinaryEncoding.Utf8,
    connectionTimeout: 1000,
    reconnectionInterval: 1,
    replyTimeout: 1000,
    headers: {
      user: 'user',
      pass: 'pass',
    },
    ioAuth: {
      user: 'user',
      pass: 'pass',
    }
  }

  const stands = new Array<IOTestStand>()

  afterEach(async () => TestUtil.closeIOStands(stands))

  it('Send message with any data',  async () => {
    const stand = await TestUtil.prepareIOStand(opts)
    stands.push(stand)

    const sendMessages: Array<{format: string, value: any}> = [
      {format: 'null', value: null},
      {format: 'number', value: 0},
      {format: 'number', value: 42},
      {format: 'boolean', value: false},
      {format: 'boolean', value: true},
      {format: 'string', value: ''},
      {format: 'string', value: 'hello'},
      {format: 'json', value: {message: 'hello!'}},
      {format: 'json', value: [{message: 'hello!'}, 42]},
    ]

    for (const sendMsg of sendMessages) {
      const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
        .post('/messages')
        .send({event: 'type:any', data: sendMsg.value})
        .expect(201)

      expect(sendMsgRes.body.reply).toEqual({format: sendMsg.format, event: 'type:any', data: sendMsg.value})

      const getMsgRes = await supertest(stand.nestApp.getHttpServer())
        .get('/messages/' + sendMsgRes.body.messageId)
        .send()
        .expect(200)

      expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
      expect(getMsgRes.body.type).toEqual('SentMessage')
      expect(getMsgRes.body.message).toEqual({format: sendMsg.format, event: 'type:any', data: sendMsg.value})

      const getReplyMsgRes = await supertest(stand.nestApp.getHttpServer())
        .get('/messages/' + (sendMsgRes.body.messageId + 1))
        .send()
        .expect(200)

      expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
      expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
      expect(getReplyMsgRes.body.message).toEqual({format: sendMsg.format, event: 'type:any', data: sendMsg.value})
    }
  })

  it('Send binary message',  async () => {
    const stand = await TestUtil.prepareIOStand(opts)
    stands.push(stand)

    const bytes = Array.from(Buffer.from('binary msg'))
    const replyBytes = Array.from(Buffer.from('binary reply'))

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({event: 'type:binary', bytes: bytes})
      .expect(201)

    expect(sendMsgRes.body.reply).toEqual({
      format: 'byte-array',
      event: 'type:binary',
      size: replyBytes.length,
      data: replyBytes,
      utf8: 'binary reply'
    })

    const getMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages/' + sendMsgRes.body.messageId)
      .send()
      .expect(200)

    expect(getMsgRes.body.id).toEqual(sendMsgRes.body.messageId)
    expect(getMsgRes.body.type).toEqual('SentMessage')
    expect(getMsgRes.body.message).toEqual({
      format: 'byte-array',
      event: 'type:binary',
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
      event: 'type:binary',
      size: replyBytes.length,
      data: replyBytes,
      utf8: 'binary reply'
    })
  })

  it('List messages',  async () => {
    const stand = await TestUtil.prepareIOStand(opts)
    stands.push(stand)

    const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
      .post('/messages')
      .send({event: 'type:any', data: 'string msg'})
      .expect(201)

    const listMsgRes = await supertest(stand.nestApp.getHttpServer())
      .get('/messages')
      .send()
      .expect(200)

    expect(listMsgRes.body.length).toEqual(3)

    expect(listMsgRes.body[0].id).toEqual(1)
    expect(listMsgRes.body[0].type).toEqual('Connected')
    expect(listMsgRes.body[0].message.type).toEqual('socket.io')

    expect(listMsgRes.body[1].id).toEqual(sendMsgRes.body.messageId)
    expect(listMsgRes.body[1].type).toEqual('SentMessage')
    expect(listMsgRes.body[1].message).toEqual({format: 'string', event: 'type:any', data: 'string msg'})

    expect(listMsgRes.body[2].id).toEqual(sendMsgRes.body.messageId + 1)
    expect(listMsgRes.body[2].type).toEqual('ReceivedMessage')
    expect(listMsgRes.body[2].message).toEqual({format: 'string', event: 'type:any', data: 'string msg'})
  })

  it('Pass query string, headers and auth credentials',  async () => {
    const stand = await TestUtil.prepareIOStand(opts)
    stands.push(stand)

    expect(stand.ios.headers()).toMatchObject({user: 'user', pass: 'pass'})
    expect(stand.ios.auth()).toMatchObject({user: 'user', pass: 'pass'})
    expect(stand.ios.query()).toMatchObject({isTestStand: 'true'})
  })
})
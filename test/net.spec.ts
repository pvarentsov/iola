import { SocketType } from '@iola/core/socket'
import { BinaryEncoding } from '@iola/core/common'
import * as supertest from 'supertest'
import { NetTestStand, TestUtil } from './util/test.util'

describe('NET', () => {
  const opts = {
    type: SocketType.Tcp,
    address: '',
    binaryEncoding: BinaryEncoding.Utf8,
    connectionTimeout: 1000,
    reconnectionInterval: 1,
    replyTimeout: 50,
  }

  const stands = new Array<NetTestStand>()

  afterEach(async () => TestUtil.closeNetStands(stands))

  it('Async: Reconnect client if active connection is lost',  async () => {
    const types = [SocketType.Tcp, SocketType.Unix]

    for (const type of types) {
      const stand = await TestUtil.prepareNetStand({...opts, type})
      stands.push(stand)

      stand.nets.disconnectClients()
      await TestUtil.delay(50)

      const bytes = Array.from(Buffer.from('string msg'))

      const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
        .post('/messages')
        .send({data: 'string msg'})
        .expect(201)

      await TestUtil.delay(1000)

      const listMsgRes = await supertest(stand.nestApp.getHttpServer())
        .get('/messages')
        .send()
        .expect(200)

      expect(listMsgRes.body.length).toEqual(6)

      expect(listMsgRes.body[0].id).toEqual(1)
      expect(listMsgRes.body[0].type).toEqual('Connected')
      expect(listMsgRes.body[0].message.type).toEqual(type)

      expect(listMsgRes.body[1].id).toEqual(2)
      expect(listMsgRes.body[1].type).toEqual('Closed')

      expect(listMsgRes.body[2].id).toEqual(3)
      expect(listMsgRes.body[2].type).toEqual('Reconnecting')

      expect(listMsgRes.body[3].id).toEqual(4)
      expect(listMsgRes.body[3].type).toEqual('Connected')
      expect(listMsgRes.body[3].message.type).toEqual(type)

      expect(listMsgRes.body[4].id).toEqual(sendMsgRes.body.messageId)
      expect(listMsgRes.body[4].type).toEqual('SentMessage')
      expect(listMsgRes.body[4].message).toEqual({
        format: 'byte-array',
        size: bytes.length,
        data: bytes,
        utf8: 'string msg'
      })

      expect(listMsgRes.body[5].id).toEqual(sendMsgRes.body.messageId + 1)
      expect(listMsgRes.body[5].type).toEqual('ReceivedMessage')
      expect(listMsgRes.body[5].message).toEqual({
        format: 'byte-array',
        size: bytes.length,
        data: bytes,
        utf8: 'string msg'
      })
    }
  })

  it('Async: Send string message',  async () => {
    const types = [SocketType.Tcp, SocketType.Unix]

    for (const type of types) {
      const stand = await TestUtil.prepareNetStand({...opts, type})
      stands.push(stand)

      const firstMessageParts = ['h', 'e', 'l', 'l', 'o']
      const secondMessageParts = ['w', 'o', 'r', 'l', 'd']
      const allMessageParts = [...firstMessageParts, ...secondMessageParts]

      for (const part of firstMessageParts) {
        await supertest(stand.nestApp.getHttpServer())
          .post('/messages')
          .send({data: part})
          .expect(201)

        await TestUtil.delay(50)
      }

      await TestUtil.delay(100)

      for (const part of secondMessageParts) {
        await supertest(stand.nestApp.getHttpServer())
          .post('/messages')
          .send({data: part})
          .expect(201)

        await TestUtil.delay(50)
      }

      await TestUtil.delay(1200)

      const sentListRes = await supertest(stand.nestApp.getHttpServer())
        .get('/messages?type=SentMessage')
        .send()
        .expect(200)

      const receivedListRes = await supertest(stand.nestApp.getHttpServer())
        .get('/messages?type=ReceivedMessage')
        .send()
        .expect(200)

      allMessageParts.forEach((ch, i) => {
        expect(sentListRes.body[i].type).toEqual('SentMessage')
        expect(sentListRes.body[i].message).toEqual({
          format: 'byte-array',
          size: 1,
          data: Array.from(Buffer.from(ch)),
          utf8: ch
        })
      })

      expect(receivedListRes.body[0].type).toEqual('ReceivedMessage')
      expect(receivedListRes.body[0].message).toEqual({
        format: 'byte-array',
        size: 5,
        data: Array.from(Buffer.from('hello')),
        utf8: 'hello'
      })

      expect(receivedListRes.body[1].type).toEqual('ReceivedMessage')
      expect(receivedListRes.body[1].message).toEqual({
        format: 'byte-array',
        size: 5,
        data: Array.from(Buffer.from('world')),
        utf8: 'world'
      })
    }
  })

  it('Async: Send binary message',  async () => {
    const types = [SocketType.Tcp, SocketType.Unix]

    for (const type of types) {
      const stand = await TestUtil.prepareNetStand({...opts, type})
      stands.push(stand)

      const bytes = Array.from(Buffer.from('binary msg'))

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

      await TestUtil.delay(1000)

      const getReplyMsgRes = await supertest(stand.nestApp.getHttpServer())
        .get('/messages/' + (sendMsgRes.body.messageId + 1))
        .send()
        .expect(200)

      expect(getReplyMsgRes.body.id).toEqual(sendMsgRes.body.messageId + 1)
      expect(getReplyMsgRes.body.type).toEqual('ReceivedMessage')
      expect(getReplyMsgRes.body.message).toEqual({
        format: 'byte-array',
        size: bytes.length,
        data: bytes,
        utf8: 'binary msg'
      })
    }
  })

  it('Sync: Send binary message',  async () => {
    const types = [SocketType.Tcp, SocketType.Unix]

    for (const type of types) {
      const stand = await TestUtil.prepareNetStand({...opts, type: type, netSync: true})
      stands.push(stand)

      const bytes = Array.from(Buffer.from('binary msg'))

      const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
        .post('/messages')
        .send({bytes})
        .expect(201)

      expect(sendMsgRes.body.reply).toEqual({
        format: 'byte-array',
        size: bytes.length,
        data: bytes,
        utf8: 'binary msg'
      })

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
        size: bytes.length,
        data: bytes,
        utf8: 'binary msg'
      })
    }
  })

  it('Sync: Send string message and do not await timed out reply',  async () => {
    const types = [SocketType.Tcp, SocketType.Unix]

    for (const type of types) {
      const stand = await TestUtil.prepareNetStand({...opts, type: type, netSync: true})
      stands.push(stand)

      const bytes = Array.from(Buffer.from('timeout'))

      const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
        .post('/messages')
        .send({data: 'timeout'})
        .expect(201)

      expect(sendMsgRes.body.reply).toBeUndefined()

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
        utf8: 'timeout'
      })
    }
  })

  it('Sync: Receive request error if server closed connection',  async () => {
    const types = [SocketType.Tcp, SocketType.Unix]

    for (const type of types) {
      const stand = await TestUtil.prepareNetStand({...opts, type: type, netSync: true})

      stands.push(stand)
      stand.nets.close()

      const sendMsgRes = await supertest(stand.nestApp.getHttpServer())
        .post('/messages')
        .send({data: 'request with error'})
        .expect(500)

      expect(sendMsgRes.body.statusCode).toEqual(500)
      expect(sendMsgRes.body.message).toContain('connection to')
      expect(sendMsgRes.body.message).toContain('is timed out')
    }
  })
})
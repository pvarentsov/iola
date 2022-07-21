import { CliFactory, ICliLogger } from '@iola/api/cli'
import { IHttpServer } from '@iola/api/http'
import { EventStore } from '@iola/core/socket/store/event.store'
import { CliLogger } from '@iola/api/cli/cli/cli.logger'
import {
  ISocketClient,
  ISocketEventStore,
  SocketEvent,
  SocketEventType,
  SocketSendReply,
  SocketType
} from '@iola/core/socket'
import { TestUtil } from '@iola/test/util/test.util'

describe('CLI', () => {
  describe('Parser', () => {
    it('WebSocket: Parse default config',  async () => {
      const args = [
        'ws',
        'ws://127.0.0.1:8080'
      ]

      const parser = CliFactory.createParser('test')
      const config = parser.parse(args)

      expect(config).toEqual({
        socketType: SocketType.WebSocket,
        socketAddress: 'ws://127.0.0.1:8080',
        apiPort: 3000,
        apiHost: '127.0.0.1',
        headers: undefined,
        binaryEncoding: undefined,
        emoji: true,
        replyTimeout: 1000,
        connectionTimeout: 5000,
        reconnectionInterval: 10000,
      })
    })

    it('WebSocket: Parse custom config',  async () => {
      const args = [
        'ws',
        'ws://127.0.0.1:8080',
        '--api-host', '0.0.0.0',
        '--api-port', '9000',
        '--binary-encoding', 'utf8',
        '--header', 'user:user', 'pass:pass',
        '--header', 'token:token',
        '--reply-timeout', '2000',
        '--no-emoji'
      ]

      const parser = CliFactory.createParser('test')
      const config = parser.parse(args)

      expect(config).toEqual({
        socketType: SocketType.WebSocket,
        socketAddress: 'ws://127.0.0.1:8080',
        apiPort: 9000,
        apiHost: '0.0.0.0',
        headers: {
          user: 'user',
          pass: 'pass',
          token: 'token'
        },
        binaryEncoding: 'utf8',
        emoji: false,
        replyTimeout: 2000,
        connectionTimeout: 5000,
        reconnectionInterval: 10000,
      })
    })

    it('WebSocket: Validate args',  async () => {
      const args = [
        'ws',
        'ws://127.0.0.1:8080',
        '--api-host', '0.0.0.0',
        '--api-port', '-1',
        '--binary-encoding', 'utf8',
        '--header', 'user:user', 'pass:pass',
        '--header', 'token:token',
        '--reply-timeout', 'reply-timeout',
        '--no-emoji'
      ]

      let caughtExitCode = 0
      let caughtError = ''

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jest.spyOn(global.process, 'exit').mockImplementation(code => caughtExitCode = code || 0)
      jest.spyOn(global.console, 'error').mockImplementation(message => caughtError = message)

      const parser = CliFactory.createParser('test')
      parser.parse(args)

      const expError =
        'errors:\n' +
        '  api-port must be >= 0 and < 65536\n' +
        '  reply-timeout must be a positive number'

      expect(caughtExitCode).toEqual(1)
      expect(caughtError).toEqual(expError)
    })

    it('SocketIO: Parse default config',  async () => {
      const args = [
        'io',
        'http://127.0.0.1:8080'
      ]

      const parser = CliFactory.createParser('test')
      const config = parser.parse(args)

      expect(config).toEqual({
        socketType: SocketType.SocketIO,
        socketAddress: 'http://127.0.0.1:8080',
        apiPort: 3000,
        apiHost: '127.0.0.1',
        headers: undefined,
        binaryEncoding: undefined,
        emoji: true,
        replyTimeout: 1000,
        connectionTimeout: 5000,
        reconnectionInterval: 10000,
        ioAuth: undefined,
        ioTransport: undefined,
      })
    })

    it('SocketIO: Parse custom config',  async () => {
      const args = [
        'io',
        'http://127.0.0.1:8080',
        '--api-host', '0.0.0.0',
        '--api-port', '9000',
        '--binary-encoding', 'utf8',
        '--header', 'user:user', 'pass:pass',
        '--header', 'token:token',
        '--auth', 'user:user', 'pass:pass',
        '--auth', 'token:token',
        '--transport', 'websocket',
        '--reply-timeout', '2000',
        '--no-emoji'
      ]

      const parser = CliFactory.createParser('test')
      const config = parser.parse(args)

      expect(config).toEqual({
        socketType: SocketType.SocketIO,
        socketAddress: 'http://127.0.0.1:8080',
        apiPort: 9000,
        apiHost: '0.0.0.0',
        headers: {
          user: 'user',
          pass: 'pass',
          token: 'token'
        },
        ioAuth: {
          user: 'user',
          pass: 'pass',
          token: 'token'
        },
        binaryEncoding: 'utf8',
        emoji: false,
        replyTimeout: 2000,
        connectionTimeout: 5000,
        reconnectionInterval: 10000,
        ioTransport: 'websocket',
      })
    })

    it('SocketIO: Validate args',  async () => {
      const args = [
        'io',
        'http://127.0.0.1:8080',
        '--api-host', '0.0.0.0',
        '--api-port', '-1',
        '--binary-encoding', 'utf8',
        '--header', 'user:user', 'pass:pass',
        '--header', 'token:token',
        '--auth', 'user:user', 'pass:pass',
        '--auth', 'token:token',
        '--transport', 'websocket',
        '--reply-timeout', '2000',
        '--no-emoji'
      ]

      let caughtExitCode = 0
      let caughtError = ''
      let exitCall = 0
      let errorCall = 0

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      jest.spyOn(global.process, 'exit').mockImplementation(code => {
        exitCall += 1
        if (exitCall === 1) {
          caughtExitCode = code || 0
        }
      })
      jest.spyOn(global.console, 'error').mockImplementation(message => {
        errorCall += 1
        if (errorCall === 1) {
          caughtError = message
        }
      })

      const parser = CliFactory.createParser('test')
      parser.parse(args)

      expect(caughtExitCode).toEqual(1)
      expect(caughtError).toEqual('error: api-port must be >= 0 and < 65536')
    })

    it('TCP: Parse default config',  async () => {
      const args = [
        'tcp',
        '127.0.0.1:8080'
      ]

      const parser = CliFactory.createParser('test')
      const config = parser.parse(args)

      expect(config).toEqual({
        socketType: SocketType.Tcp,
        socketAddress: '127.0.0.1:8080',
        apiPort: 3000,
        apiHost: '127.0.0.1',
        binaryEncoding: undefined,
        netSync: undefined,
        emoji: true,
        replyTimeout: 1000,
        connectionTimeout: 5000,
        reconnectionInterval: 10000,
      })
    })

    it('TCP: Parse custom config',  async () => {
      const args = [
        'tcp',
        '127.0.0.1:8080',
        '--api-host', '0.0.0.0',
        '--api-port', '9000',
        '--binary-encoding', 'utf8',
        '--reply-timeout', '2000',
        '--no-emoji',
        '--sync'
      ]

      const parser = CliFactory.createParser('test')
      const config = parser.parse(args)

      expect(config).toEqual({
        socketType: SocketType.Tcp,
        socketAddress: '127.0.0.1:8080',
        apiPort: 9000,
        apiHost: '0.0.0.0',
        binaryEncoding: 'utf8',
        netSync: true,
        emoji: false,
        replyTimeout: 2000,
        connectionTimeout: 5000,
        reconnectionInterval: 10000,
      })
    })

    it('Unix: Parse default config',  async () => {
      const args = [
        'unix',
        'unix.sock'
      ]

      const parser = CliFactory.createParser('test')
      const config = parser.parse(args)

      expect(config).toEqual({
        socketType: SocketType.Unix,
        socketAddress: 'unix.sock',
        apiPort: 3000,
        apiHost: '127.0.0.1',
        binaryEncoding: undefined,
        netSync: undefined,
        emoji: true,
        replyTimeout: 1000,
        connectionTimeout: 5000,
        reconnectionInterval: 10000,
      })
    })

    it('Unix: Parse custom config',  async () => {
      const args = [
        'unix',
        'unix.sock',
        '--api-host', '0.0.0.0',
        '--api-port', '9000',
        '--binary-encoding', 'utf8',
        '--reply-timeout', '2000',
        '--no-emoji',
        '--sync'
      ]

      const parser = CliFactory.createParser('test')
      const config = parser.parse(args)

      expect(config).toEqual({
        socketType: SocketType.Unix,
        socketAddress: 'unix.sock',
        apiPort: 9000,
        apiHost: '0.0.0.0',
        binaryEncoding: 'utf8',
        netSync: true,
        emoji: false,
        replyTimeout: 2000,
        connectionTimeout: 5000,
        reconnectionInterval: 10000,
      })
    })
  })

  describe('Interactive', () => {
    class MockServer implements IHttpServer {
      async listen(host: string, port: number): Promise<string> {
        return `http:${host}:${port}`
      }
      engine<T = any>(): T {
        return undefined as any
      }
    }

    class MockLogger implements ICliLogger {
      messages: string[] = []

      log(message?: any): void {
        if (message) {
          message = message.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '')
          message = message.replace(/(\r\n|\n|\r)/gm, '')

          this.messages.push(message)
        }
      }
    }

    class MockClient implements ISocketClient {
      constructor(readonly store: ISocketEventStore) {}

      async connect(): Promise<void> {
        return undefined
      }
      async sendData(): Promise<SocketSendReply> {
        return undefined as any
      }
      async sendBytes(): Promise<SocketSendReply> {
        return undefined as any
      }
      close(): void {
        return undefined
      }
    }

    const date = new Date('1970-01-01T00:00:00')
    const events: Array<SocketEvent> = [
      {
        type: SocketEventType.Connected,
        date: date,
        message: {
          type: SocketType.WebSocket,
          address: 'ws://127.0.0.1:8080',
        }
      },
      {
        type: SocketEventType.SentMessage,
        date: date,
        message: {
          format: 'string',
          data: 'HI, Server!',
        }
      },
      {
        type: SocketEventType.ReceivedMessage,
        date: date,
        message: {
          format: 'string',
          data: 'HI, Iola!',
        }
      },
      {
        type: SocketEventType.Closed,
        date: date,
        message: {
          code: '1',
          reason: ':(',
        }
      },
      {
        type: SocketEventType.Error,
        date: date,
        message: {
          message: ':(',
        }
      },
      {
        type: SocketEventType.Reconnecting,
        date: date,
        message: {
          type: SocketType.WebSocket,
          address: 'ws://127.0.0.1:8080',
        }
      }
    ]

    it('Print events with emoji', async () => {
      const store = new EventStore()
      const server = new MockServer()
      const client = new MockClient(store)
      const logger = new MockLogger()

      const interactive = CliFactory.createInteractive({
        apiPort: 3000,
        apiHost: '127.0.0.1',
        emoji: true,
      } as any, logger)

      for (const event of events) {
        store.add(event)
      }

      await interactive.listen(server, client)
      await TestUtil.delay(1500)

      expect(logger.messages).toEqual([
        'API server: http:127.0.0.1:3000',
        'Swagger UI: http:127.0.0.1:3000/swagger',
        // eslint-disable-next-line max-len
        '00001 [1970-01-1 00:00:00] 🔄 Connection established:  { type: \'websocket\', address: \'ws://127.0.0.1:8080\' }',
        '00002 [1970-01-1 00:00:00] 📤 Message sent:  { format: \'string\', data: \'HI, Server!\' }',
        '00003 [1970-01-1 00:00:00] 📥 Message received:  { format: \'string\', data: \'HI, Iola!\' }',
        '00004 [1970-01-1 00:00:00] 🚫️ Connection closed:  { code: \'1\', reason: \':(\' }',
        '00005 [1970-01-1 00:00:00] ❗️ Error:  { message: \':(\' }',
        '00006 [1970-01-1 00:00:00] 🔁 Retry connection:  { type: \'websocket\', address: \'ws://127.0.0.1:8080\' }'])
    })

    it('Print events without emoji', async () => {
      const store = new EventStore()
      const server = new MockServer()
      const client = new MockClient(store)
      const logger = new MockLogger()

      const interactive = CliFactory.createInteractive({
        apiPort: 3000,
        apiHost: '127.0.0.1',
        emoji: false,
      } as any, logger)

      for (const event of events) {
        store.add(event)
      }

      await interactive.listen(server, client)
      await TestUtil.delay(1500)

      expect(logger.messages).toEqual([
        'API server: http:127.0.0.1:3000',
        'Swagger UI: http:127.0.0.1:3000/swagger',
        // eslint-disable-next-line max-len
        '00001 [1970-01-1 00:00:00] Connection established:  { type: \'websocket\', address: \'ws://127.0.0.1:8080\' }',
        '00002 [1970-01-1 00:00:00] Message sent:  { format: \'string\', data: \'HI, Server!\' }',
        '00003 [1970-01-1 00:00:00] Message received:  { format: \'string\', data: \'HI, Iola!\' }',
        '00004 [1970-01-1 00:00:00] Connection closed:  { code: \'1\', reason: \':(\' }',
        '00005 [1970-01-1 00:00:00] Error:  { message: \':(\' }',
        '00006 [1970-01-1 00:00:00] Retry connection:  { type: \'websocket\', address: \'ws://127.0.0.1:8080\' }'])
    })
  })

  describe('Logger', () => {
    it('Call console.log', async () => {
      const message = 'Hi!'
      const logger = new CliLogger()

      let caughtMessage = ''

      jest.spyOn(global.console, 'log').mockImplementation(message => caughtMessage = message)

      logger.log('Hi!')

      expect(caughtMessage).toEqual(message)
    })
  })
})


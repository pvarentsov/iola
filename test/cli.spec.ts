import { CliFactory } from '@iola/api/cli'
import { SocketType } from '@iola/core/socket'

describe('CLI', () => {
  it('WS: Parse default config',  async () => {
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

  it('WS: Parse custom config',  async () => {
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
})
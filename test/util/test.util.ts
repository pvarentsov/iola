import { AddressInfo, createServer } from 'net'
import { ISocketClient, SocketFactory, SocketOptions, SocketType } from '@iola/core/socket'
import { WsServer } from '../server/ws.server'
import { INestApplication } from '@nestjs/common'
import { HttpFactory } from '@iola/api/http'

export type WSTestStand = {
  wss: WsServer
  client: ISocketClient
  nestApp: INestApplication
}

export class TestUtil {
  static async prepareWSStand(opts: SocketOptions): Promise<WSTestStand> {
    const wssPort = await this.findFreePort()
    const wss = new WsServer()
    await wss.start(wssPort)

    const client = SocketFactory.createClient({...opts, address: this.prepareClientAddress(opts.type, wssPort)})
    await client.connect()

    const httpServerPort = await this.findFreePort()
    const httpServer = await HttpFactory.createServer(client, '')
    await httpServer.listen('127.0.0.1', httpServerPort)

    const nestApp = httpServer.engine<INestApplication>()

    return {wss, client, nestApp}
  }

  static async closeWSStands(stands: Array<WSTestStand>): Promise<void> {
    for (const stand of stands) {
      await stand.wss.close()
      await stand.client.close()
      await stand.nestApp.close()
    }
  }

  static async findFreePort(): Promise<number> {
    return new Promise( resolve => {
      const server = createServer()

      server.listen(0, () => {
        const addr = server.address()
        server.close(() => resolve((addr as AddressInfo).port))
      })
    })
  }

  static async delay(ms: number): Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms))
  }

  private static prepareClientAddress(type: SocketType, port: number): string {
    if (type === SocketType.WebSocket) {
      return 'ws://127.0.0.1:' + port + '?isTestStand=true'
    }
    if (type === SocketType.SocketIO) {
      return 'http://127.0.0.1:' + port + '?isTestStand=true'
    }
    if (type === SocketType.Tcp) {
      return '127.0.0.1:' + port
    }
    return 'unix.sock'
  }
}
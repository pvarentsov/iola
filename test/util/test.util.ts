import { AddressInfo, createServer } from 'net'
import { ISocketClient, SocketFactory, SocketOptions, SocketType } from '@iola/core/socket'
import { WsServer } from '../server/ws.server'
import { INestApplication } from '@nestjs/common'
import { HttpFactory } from '@iola/api/http'
import { IOServer } from '../server/io.server'

export type WSTestStand = {
  wss: WsServer
  client: ISocketClient
  nestApp: INestApplication
}

export type IOTestStand = {
  ios: IOServer
  client: ISocketClient
  nestApp: INestApplication
}

export class TestUtil {
  static async prepareWSStand(opts: SocketOptions): Promise<WSTestStand> {
    const closeStand: Partial<WSTestStand> = {}

    try {
      const wssPort = await this.findFreePort()
      const wss = new WsServer()
      await wss.start(wssPort)
      closeStand.wss = wss

      const client = SocketFactory.createClient({...opts, address: this.prepareClientAddress(opts.type, wssPort)})
      await client.connect()
      closeStand.client = client

      const httpServerPort = await this.findFreePort()
      const httpServer = await HttpFactory.createServer(client, '')
      await httpServer.listen('127.0.0.1', httpServerPort)

      const nestApp = httpServer.engine<INestApplication>()
      closeStand.nestApp = nestApp

      return {wss, client, nestApp}

    } catch (e) {
      await closeStand.wss?.close()
      await closeStand.client?.close()
      await closeStand.nestApp?.close()

      throw e
    }
  }

  static async prepareIOStand(opts: SocketOptions): Promise<IOTestStand> {
    const closeStand: Partial<IOTestStand> = {}

    try {
      const iosPort = await this.findFreePort()
      const ios = new IOServer()
      await ios.start(iosPort)
      closeStand.ios = ios

      const client = SocketFactory.createClient({...opts, address: this.prepareClientAddress(opts.type, iosPort)})
      await client.connect()
      closeStand.client = client

      const httpServerPort = await this.findFreePort()
      const httpServer = await HttpFactory.createServer(client, '')
      await httpServer.listen('127.0.0.1', httpServerPort)

      const nestApp = httpServer.engine<INestApplication>()
      closeStand.nestApp = nestApp

      return {ios, client, nestApp}

    } catch (e) {
      await closeStand.ios?.close()
      await closeStand.client?.close()
      await closeStand.nestApp?.close()

      throw e
    }
  }

  static async closeWSStands(stands: Array<WSTestStand>): Promise<void> {
    for (const stand of stands) {
      await stand.wss.close()
      await stand.client.close()
      await stand.nestApp.close()
    }
  }

  static async closeIOStands(stands: Array<IOTestStand>): Promise<void> {
    for (const stand of stands) {
      await stand.ios.close()
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
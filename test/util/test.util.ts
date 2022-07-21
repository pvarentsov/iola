import { AddressInfo, createServer } from 'net'
import { readdirSync, unlinkSync } from 'fs'
import { randomUUID } from 'crypto'
import { INestApplication } from '@nestjs/common'
import { join } from 'path'

import { HttpFactory } from '@iola/api/http'
import { ISocketClient, SocketFactory, SocketOptions, SocketType } from '@iola/core/socket'
import { IOServer } from '@iola/test/server/io.server'
import { NetServer } from '@iola/test/server/net.server'
import { WsServer } from '@iola/test/server/ws.server'

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

export type NetTestStand = {
  nets: NetServer
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
      await this.closeWSStands([closeStand])
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
      await this.closeIOStands([closeStand])
      throw e
    }
  }

  static async prepareNetStand(opts: SocketOptions): Promise<NetTestStand> {
    const closeStand: Partial<NetTestStand> = {}

    try {
      const netsPortOrAddr = opts.type === SocketType.Tcp
        ? await this.findFreePort()
        : this.createUnixSock()

      const nets = new NetServer()
      await nets.start(netsPortOrAddr)
      closeStand.nets = nets

      const client = SocketFactory.createClient({
        ...opts, address: this.prepareClientAddress(opts.type, netsPortOrAddr)
      })
      await client.connect()
      closeStand.client = client

      const httpServerPort = await this.findFreePort()
      const httpServer = await HttpFactory.createServer(client, '')
      await httpServer.listen('127.0.0.1', httpServerPort)

      const nestApp = httpServer.engine<INestApplication>()
      closeStand.nestApp = nestApp

      return {nets: nets, client, nestApp}

    } catch (e) {
      await this.closeNetStands([closeStand])
      throw e
    }
  }

  static async closeWSStands(stands: Array<Partial<WSTestStand>>): Promise<void> {
    for (const stand of stands) {
      await stand.wss?.close()
      await stand.client?.close()
      await stand.nestApp?.close()
    }
  }

  static async closeIOStands(stands: Array<Partial<IOTestStand>>): Promise<void> {
    for (const stand of stands) {
      await stand.ios?.close()
      await stand.client?.close()
      await stand.nestApp?.close()
    }
  }

  static async closeNetStands(stands: Array<Partial<NetTestStand>>): Promise<void> {
    for (const stand of stands) {
      await stand.nets?.close()
      await stand.client?.close()
      await stand.nestApp?.close()
    }

    readdirSync(join(__dirname, '../server/unix'))
      .filter(filename => filename !== '.gitkeep')
      .map(filename => unlinkSync(join(__dirname, '../server/unix', filename)))
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

  static createUnixSock(): string {
    return join(__dirname, '../server/unix', randomUUID() + '.sock')
  }

  static async delay(ms: number): Promise<void> {
    return new Promise( resolve => setTimeout(resolve, ms))
  }

  private static prepareClientAddress(type: SocketType, portOrAddr: number|string): string {
    if (type === SocketType.WebSocket) {
      return 'ws://127.0.0.1:' + portOrAddr + '?isTestStand=true'
    }
    if (type === SocketType.SocketIO) {
      return 'http://127.0.0.1:' + portOrAddr + '?isTestStand=true'
    }
    if (type === SocketType.Tcp) {
      return '127.0.0.1:' + portOrAddr
    }
    return portOrAddr + ''
  }
}
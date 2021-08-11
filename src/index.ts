#!/usr/bin/env node

import { CliFactory } from '@iola/api/cli'
import { HttpFactory } from '@iola/api/http'
import { SocketEventType, SocketFactory } from '@iola/core/socket'

(async (): Promise<void> => {
  try {
    const version = '0.3.1'

    const config = CliFactory
      .createParser(version)
      .parse()

    const client = SocketFactory.createClient({
      type: config.socketType,
      address: config.socketAddress,
      binaryEncoding: config.binaryEncoding,
      connectionTimeout: config.connectionTimeout,
      reconnectionInterval: config.reconnectionInterval,
      ioAuth: config.ioAuth,
      ioTransport: config.ioTransport,
      netSync: config.netSync,
      replyTimeout: config.replyTimeout,
    })

    process.on('uncaughtException',  error => client.store.add({
      type: SocketEventType.Error,
      date: new Date(),
      message: {
        uncaughtException: error.message
      },
    }))

    process.on('unhandledRejection',  error => client.store.add({
      type: SocketEventType.Error,
      date: new Date(),
      message: {
        uncaughtException: error
      },
    }))

    const server = HttpFactory
      .createServer(client, version)

    await CliFactory
      .createInteractive(config)
      .listen(server, client)
  }
  catch (error) {
    console.error(error.message)
    process.exit(1)
  }
})()

#!/usr/bin/env node

import { CliFactory } from '@iola/api/cli'
import { HttpFactory } from '@iola/api/http'
import { SocketFactory } from '@iola/core/socket'

(async (): Promise<void> => {
  try {
    process.on('uncaughtException',  error => {
      console.error(error.message)
      process.exit(1)
    })

    process.on('unhandledRejection',  error => {
      console.error(error)
      process.exit(1)
    })

    const config = CliFactory
      .createParser()
      .parse()

    const client = SocketFactory.createClient({
      type: config.socketType,
      address: config.socketAddress,
      binaryEncoding: config.binaryEncoding,
      connectionTimeout: config.connectionTimeout,
      reconnectionInterval: config.reconnectionInterval,
      replyTimeout: config.replyTimeout,
    })

    const server = HttpFactory
      .createServer(client)

    await CliFactory
      .createInteractive(config)
      .listen(server, client)
  }
  catch (error) {
    console.error(error.message)
    process.exit(1)
  }
})()

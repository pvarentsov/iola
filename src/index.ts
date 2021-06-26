#!/usr/bin/env node

import { CliFactory } from '@iola/api/cli'
import { HttpFactory } from '@iola/api/http'
import { SocketFactory } from '@iola/core/socket'

(async (): Promise<void> => {
  try {
    const config = CliFactory
      .createParser()
      .parse()

    const client = SocketFactory.createClient({
      type: config.socketType,
      address: config.socketAddress,
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

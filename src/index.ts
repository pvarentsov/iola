#!/usr/bin/env node

import * as path from 'path'

import { CliFactory } from '@iola/api/cli'
import { HttpFactory } from '@iola/api/http'
import { SocketEventType, SocketFactory } from '@iola/core/socket'

(async (): Promise<void> => {
  try {
    const version = '0.5.4'

    const config = CliFactory
      .createParser(version)
      .parse()

    detectSwaggerUIAssets()

    const client = SocketFactory.createClient({
      type: config.socketType,
      address: config.socketAddress,
      binaryEncoding: config.binaryEncoding,
      connectionTimeout: config.connectionTimeout,
      reconnectionInterval: config.reconnectionInterval,
      headers: config.headers,
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
    const message = error instanceof Error
      ? error.message
      : JSON.stringify(error)

    console.error(message)
    process.exit(1)
  }
})()

/**
 * @description Need to detect assets in source code
 * @link https://github.com/vercel/pkg#detecting-assets-in-source-code
 **/
function detectSwaggerUIAssets(): void {
  path.join(__dirname, '../node_modules/swagger-ui-dist/swagger-ui.css')
  path.join(__dirname, '../node_modules/swagger-ui-dist/favicon-16x16.png')
  path.join(__dirname, '../node_modules/swagger-ui-dist/favicon-32x32.png')
}

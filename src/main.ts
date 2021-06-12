import 'module-alias/register'

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
    })

    const cliInteractive = CliFactory.createInteractive(config)
    const server = HttpFactory.createServer(client)

    await cliInteractive.listenServer(server)
    await cliInteractive.listenClient(client)
  }
  catch (error) {
    console.error(error.message)
    process.exit(1)
  }
})()

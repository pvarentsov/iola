import 'module-alias/register'

import { Cli } from '@iola/api/cli'
import { HttpFactory } from '@iola/api/http'
import { SocketFactory, SocketType } from '@iola/core/socket'

(async (): Promise<void> => {
  Cli.printEmptyLine()

  const socketType = SocketType.WebSocket // await Cli.getSocketType()
  const address = 'ws://localhost:8080' // await Cli.getAddress()

  const client = SocketFactory.createClient({
    type: socketType,
    address: address,
  })

  const server = HttpFactory.createServer(client)

  await client.connect()
  await server.listen(3000)

  Cli.printSocketEvents(client)
})()

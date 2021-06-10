import { Cli } from './api/cli'
import { HttpFactory } from './api/http'
import { SocketFactory, SocketType } from './core/socket'

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

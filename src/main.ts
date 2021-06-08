import { ApiFactory } from './app/api'
import { Cli } from './app/cli/contract/cli'
import { SocketFactory } from './core/socket'

(async (): Promise<void> => {
  const socketType = await Cli.getSocketType()
  const address = await Cli.getAddress()

  const client = SocketFactory.createClient({
    type: socketType,
    address: address,
  })

  const server = ApiFactory.createServer(client)

  await client.connect()
  await server.listen(3000)

  Cli.printSocketEvents(client)
})()

import prompts = require('prompts')
import { EnumUtil, MessageUtil, ParsedMessage } from './core/common'
import { SocketFactory, SocketType } from './core/socket'

(async (): Promise<void> => {
  const socketTypes = EnumUtil.values(SocketType)

  const response = await prompts({
    name: 'type',
    type: 'select',
    message: 'Select socket type',
    choices: socketTypes.map(type => ({
      title: type,
      value: type,
    })),
    validate: value => socketTypes.includes(value)
      ? true
      : `Available types: ${socketTypes}`
  })

  const client = SocketFactory.createClient({
    type: response.type,
    address: 'ws://localhost:8080',
  })

  await client.connect()
  await client.send(JSON.stringify({event: 'greeting', data: 'Hello!'}))

  console.log(`\n${MessageUtil.humanize(client.getInfo())}`)

  client
    .read<ParsedMessage>()
    .subscribe(message => console.log(`\n${MessageUtil.humanize(message)}`))
})()


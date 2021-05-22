import prompts = require('prompts')
import { EnumUtil } from './core/common'
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

  const client = SocketFactory.createClient(response.type)

  await client.connect({address: ''})
  await client.send(JSON.stringify({event: 'event'}))

  console.log(client.getInfo())

  client
    .read()
    .subscribe(message => console.log(message))
})()
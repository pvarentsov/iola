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

  console.log(client.info())
})()
import prompts = require('prompts')
import { Choice } from 'prompts'
import { EnumUtil } from './core/common'
import { SocketFactory, SocketType } from './core/socket'

(async (): Promise<void> => {
  const socketTypes = EnumUtil.values(SocketType)

  const choices: Choice[] = socketTypes.map(type => ({
    title: type,
    value: type,
  }))

  const response = await prompts({
    type: 'select',
    choices: choices,
    name: 'type',
    message: 'Select socket type',
    validate: value => socketTypes.includes(value) ? true : `Available types: ${socketTypes}`
  })

  const client = SocketFactory.createClient(response.type)

  console.log(client.info())
})()
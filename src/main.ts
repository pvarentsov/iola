import prompts = require('prompts')
import { Choice } from 'prompts'
import { EnumUtil } from './core/common/util/enum.util'
import { SocketType } from './core/socket/contract/socket.enum'

(async (): Promise<void> => {
  const socketTypes = EnumUtil.values(SocketType)

  const choices: Choice[] = socketTypes.map(type => ({
    title: type,
    value: type,
  }))

  const socketTypeResponse = await prompts({
    type: 'select',
    choices: choices,
    name: 'socketType',
    message: 'Select socket type',
    validate: value => socketTypes.includes(value) ? true : `Available types: ${socketTypes}`
  })

  console.log(socketTypeResponse)
})()
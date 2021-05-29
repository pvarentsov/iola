import prompts = require('prompts')
import * as moment from 'moment'
import { EnumUtil, MessageUtil } from './core/common'
import { SocketEvent, SocketEventType, SocketFactory, SocketType } from './core/socket'

(async (): Promise<void> => {
  const socketTypes = EnumUtil.values(SocketType)

  console.log('')

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

  client.send(JSON.stringify({
    event: 'greeting',
    data: 'Hello!'
  }))

  setTimeout(() => {
    client
      .getEvents()
      .subscribe(event => console.log(`\n${parseEvent(event)}`))
  }, 1000)

})()


function parseEvent(event: SocketEvent): string {
  const eventName: Record<SocketEventType, string> = {
    [SocketEventType.ReceivedMessage]: '📥 Received message',
    [SocketEventType.SentMessage]: '📤 Sent message',
    [SocketEventType.Connected]: '🔌 Client connected',
    [SocketEventType.Error]: 'Error',
    [SocketEventType.Closed]: 'Client closed the connection',
  }

  const time = moment(event.date).format('YYYY-MM-D HH:mm:ss')
  const title = `[${time}] ${eventName[event.type]}`

  const body = '  ' + MessageUtil
    .humanize(event.message)
    .replace(new RegExp('\n', 'g'), '\n  ')

  return `${title}:\n${body}`
}


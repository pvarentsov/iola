import prompts = require('prompts')
import * as moment from 'moment'
import { EnumUtil, MessageUtil } from './core/common'
import { SocketEvent, SocketEventType, SocketFactory, SocketType } from './core/socket'

export class Demo {
  static async start(): Promise<void> {
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

    client.send({
      event: 'handshake',
      data: 'Hi, Server!',
    })

    setTimeout(() => {
      client.store
        .events$()
        .subscribe(event => console.log(`\n${this.parseEvent(event)}`))
    }, 1000)
  }

  private static parseEvent(event: SocketEvent): string {
    const eventName: Record<SocketEventType, string> = {
      [SocketEventType.ReceivedMessage]: '📥 Message received',
      [SocketEventType.SentMessage]: '📤 Message sent',
      [SocketEventType.Connected]: '🔄 Connection established',
      [SocketEventType.Error]: '✖️ Error',
      [SocketEventType.Closed]: '🚫️ Connection closed',
    }

    const time = moment(event.date).format('YYYY-MM-D HH:mm:ss')
    const title = `[${time}] ${eventName[event.type]}`

    const message = event.type === SocketEventType.Connected
      ? {type: event.message.type, address: event.message.address}
      : event.message

    let body = '  ' + MessageUtil
      .humanize(message)
      .replace(new RegExp('\n', 'g'), '\n  ')

    if (event.type === SocketEventType.Closed) {
      body += '\n'
    }

    return `${title}:\n${body}`
  }
}


import prompts = require('prompts')
import * as chalk from 'chalk'
import * as moment from 'moment'
import { EnumUtil, MessageUtil } from '../../../core/common'
import { ISocketClient, SocketEvent, SocketEventType, SocketType } from '../../../core/socket'

export class Cli {
  static async getSocketType(): Promise<SocketType> {
    const socketTypes = EnumUtil.values(SocketType)

    const input = await prompts({
      name: 'type',
      type: 'select',
      message: 'Select socket type',
      choices: socketTypes.map(type => ({
        title: type,
        value: type,
      })),
    })

    return input.type
  }

  static async getAddress(): Promise<string> {
    const input = await prompts({
      name: 'address',
      type: 'text',
      message: 'Enter socket address',
    })

    return input.address
  }

  static printEmptyLine(): void {
    console.log()
  }

  static printSocketEvents(client: ISocketClient): void {
    setTimeout(() => {
      client.store
        .listen()
        .subscribe(event => console.log(`\n${this.parseEvent(event)}`))
    }, 1000)
  }

  private static parseEvent(event: Required<SocketEvent>): string {
    const eventName: Record<SocketEventType, string> = {
      [SocketEventType.ReceivedMessage]: '📥 Message received',
      [SocketEventType.SentMessage]: '📤 Message sent',
      [SocketEventType.Connected]: '🔄 Connection established',
      [SocketEventType.Error]: '✖️ Error',
      [SocketEventType.Closed]: '🚫️ Connection closed',
    }

    const id = chalk.bold(event.id.toString().padStart(5, '0'))
    const date = moment(event.date).format('YYYY-MM-D HH:mm:ss')
    const title = `${id} [${date}] ${eventName[event.type]}`

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

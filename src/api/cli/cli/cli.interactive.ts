import * as chalk from 'chalk'
import * as moment from 'moment'
import * as ora from 'ora'
import { EOL } from 'os'

import { CliConfig, ICliInteractive } from '@iola/api/cli'
import { IHttpServer } from '@iola/api/http'
import { MessageUtil, Optional } from '@iola/core/common'
import { ISocketClient, SocketEvent, SocketEventType } from '@iola/core/socket'

export class CliInteractive implements ICliInteractive {
  constructor(
    private readonly config: CliConfig
  ) {}

  async listen(server: IHttpServer, client: ISocketClient): Promise<void> {
    const spinner = ora('Connecting').start()

    const stopSpinner = (delay: number): Promise<ora.Ora> => new Promise(
      resolve => setTimeout(() => resolve(spinner.stop()), delay)
    )

    try {
      await client.connect()
      await stopSpinner(1000)
    }
    catch (err) {
      spinner.color = 'red'
      await stopSpinner(1000)

      throw err
    }

    const address = await server
      .listen(this.config.apiHost, this.config.apiPort)

    console.log()
    console.log(`${chalk.bold('API server:')} ${address}`)
    console.log(`${chalk.bold('Swagger UI:')} ${address}/swagger`)
    console.log()

    setTimeout(() => {
      client.store
        .listen()
        .subscribe(event => console.log(this.parseEvent(event)))
    }, 1000)
  }

  private parseEvent(event: Required<SocketEvent>): string {
    const eventName: Record<SocketEventType, string> = {
      [SocketEventType.ReceivedMessage]: this.config.emoji ? '📥 Message received' : 'Message received',
      [SocketEventType.SentMessage]: this.config.emoji ? '📤 Message sent' : 'Message sent',
      [SocketEventType.Reconnecting]: this.config.emoji ? '🔁 Retry connection' : 'Retry connection',
      [SocketEventType.Connected]: this.config.emoji ? '🔄 Connection established' : 'Connection established',
      [SocketEventType.Error]: this.config.emoji ? '❗️ Error' : 'Error',
      [SocketEventType.Closed]: this.config.emoji ? '🚫️ Connection closed' : 'Connection closed',
    }

    const id = chalk.bold(event.id.toString().padStart(5, '0'))
    const date = moment(event.date).format('YYYY-MM-D HH:mm:ss')
    const title = `${id} [${date}] ${eventName[event.type]}`

    const isConnectionEvent = event.type === SocketEventType.Connected || event.type === SocketEventType.Reconnecting

    const message = isConnectionEvent
      ? {type: event.message.type, address: event.message.address}
      : event.message

    const options: Optional<{maxStringLength?: number, maxArrayLength?: number}> = isConnectionEvent
      ? {maxStringLength: 200}
      : undefined

    const humanizedMessage = MessageUtil
      .humanize(message, options)
      .replace(new RegExp(EOL, 'g'), `${EOL}  `)

    const body = '  ' + humanizedMessage + EOL

    return `${title}:${EOL}${body}`
  }
}

import { program } from 'commander'

import { CliConfig, ICliParser } from '@iola/api/cli'
import { SocketType } from '@iola/core/socket'

export class CliParser implements ICliParser {
  private readonly supportedSocketTypes: SocketType[] = [
    SocketType.WebSocket
  ]

  parse(): CliConfig {
    const socketTypeChoicesOption = this
      .choices(this.supportedSocketTypes, 'types')

    program.option('-st, --socket-type <type>', `* set socket type (${socketTypeChoicesOption})`)
    program.option('-sa, --socket-address <address>', '* set socket address')
    program.option('-ap, --api-port <port>', '  set api port', '3000')
    program.option('-ah, --api-host <host>', '  set api host', 'localhost')
    program.option('-ne, --no-emoji', '  disable emoji')
    program.version('0.0.1', '-v, --version', '  show version')
    program.helpOption('-h, --help', '  show help')

    program.parse()

    return this.validateArgs(program.opts() as Args)
  }

  private validateArgs(args: Args): CliConfig {
    let exit = false

    const apiPort = Number(args.apiPort)

    if (args.socketType === undefined) {
      exit = true
      console.error('error: required option \'-st, --socket-type <type>\' not specified')
    }
    if (args.socketAddress === undefined) {
      exit = true
      console.error('error: required option \'-sa, --socket-address <address>\' not specified')
    }
    if (args.socketType !== undefined && !this.supportedSocketTypes.includes(args.socketType)) {
      exit = true
      const values = this.join(this.supportedSocketTypes)
      console.error(`error: option '-st, --socket-type <type>' must be one of the following values: ${values}`)
    }
    if (isNaN(apiPort)) {
      exit = true
      console.error('error: option \'-ap, --api-port <port>\' must be a number')
    }

    if (exit) {
      process.exit()
    }

    return {...args, apiPort}
  }

  private choices(choices: Array<number | string>, title: string = 'choices'): string {
    return `${title}: ${this.join(choices)}`
  }

  private join(values: Array<number | string>): string {
    return values
      .map(value => typeof value === 'string' ? `"${value}"` : value)
      .join(', ')
  }
}

type Args = {
  socketType: SocketType;
  socketAddress: string;
  apiPort: string;
  apiHost: string;
  emoji: boolean;
}
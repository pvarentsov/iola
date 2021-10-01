import { CliConfig, ICliParser } from '@iola/api/cli'
import { AnyObject, BinaryEncoding, EnumUtil, Optional, SocketIOTransport } from '@iola/core/common'
import { SocketType } from '@iola/core/socket'
import * as chalk from 'chalk'
import { OptionValues, program } from 'commander'
import { EOL } from 'os'
import { platform } from 'process'

export class CliParser implements ICliParser {
  constructor(
    private readonly version: string,
  ) {}

  parse(): CliConfig {
    let config: Optional<CliConfig>

    const connectionTimeout = 5_000
    const reconnectionInterval = 10_000

    const description =
      `${chalk.bold('iola')} - a socket client with REST API`

    const binaryEncodingChoices = this.choices(EnumUtil.values(BinaryEncoding))
    const ioTransportChoices = this.choices(EnumUtil.values(SocketIOTransport))

    const api = `API:${EOL}` +
      `  GET  /messages                    Get message list${EOL}` +
      `  GET  /messages/{id}               Get message by id${EOL}` +
      `  POST /messages                    Send message ${EOL}` +
      '  GET  /swagger                     Get swagger'

    const websocketExamples = `Examples: ${EOL}` +
      `  ${chalk.bold('$')} iola websocket ws://127.0.0.1:8080 ${EOL}` +
      `  ${chalk.bold('$')} iola ws ws://127.0.0.1:8080/?token=secret ${EOL}` +
      `  ${chalk.bold('$')} iola ws ws://127.0.0.1:8080 --header authorization:"Bearer token"${EOL}` +
      `  ${chalk.bold('$')} iola websocket ws://127.0.0.1:8080 --binary-encoding utf8 ${EOL}` +
      `  ${chalk.bold('$')} iola websocket ws://127.0.0.1:8080 --reply-timeout 3000 --no-emoji`

    const socketIOExamples = `Examples: ${EOL}` +
      `  ${chalk.bold('$')} iola socketio http://127.0.0.1:8080 ${EOL}` +
      `  ${chalk.bold('$')} iola io http://127.0.0.1:8080/?token=secret --transport websocket${EOL}` +
      `  ${chalk.bold('$')} iola io http://127.0.0.1:8080 --header authorization:"Bearer token"${EOL}` +
      `  ${chalk.bold('$')} iola io http://127.0.0.1:8080 --auth user:iola --auth pass:qwerty1${EOL}` +
      `  ${chalk.bold('$')} iola socketio http://127.0.0.1:8080 --binary-encoding utf8 ${EOL}` +
      `  ${chalk.bold('$')} iola socketio http://127.0.0.1:8080 --reply-timeout 3000 --no-emoji`

    const tcpExamples = `Examples: ${EOL}` +
      `  ${chalk.bold('$')} iola tcp 127.0.0.1:8080 ${EOL}` +
      `  ${chalk.bold('$')} iola tcp 127.0.0.1:8080 --sync ${EOL}` +
      `  ${chalk.bold('$')} iola tcp 127.0.0.1:8080 --binary-encoding utf8 ${EOL}` +
      `  ${chalk.bold('$')} iola tcp 127.0.0.1:8080 --no-emoji`

    const unixExamples = `Examples: ${EOL}` +
      `  ${chalk.bold('$')} iola unix ./unix.sock ${EOL}` +
      `  ${chalk.bold('$')} iola unix ./unix.sock --sync ${EOL}` +
      `  ${chalk.bold('$')} iola unix ./unix.sock --binary-encoding utf8 ${EOL}` +
      `  ${chalk.bold('$')} iola unix ./unix.sock --no-emoji`

    program
      .name('iola')
      .version(this.version, '--version', 'Display version')
      .helpOption('--help', 'Display help')
      .addHelpText('before', EOL + description + EOL)
      .addHelpText('after', EOL + api + EOL)
      .addHelpCommand('help [command]', 'Display help for command')

    program
      .command('websocket <address>')
      .description('Run websocket client')
      .enablePositionalOptions(false)
      .option('-ap, --api-port <port>', 'Set api port', '3000')
      .option('-ah, --api-host <host>', 'Set api host', '127.0.0.1')
      .option('-h, --header <key:value...>', 'Set http headers')
      .option('-rt, --reply-timeout <timeout>', 'Set reply timeout in ms', '1000')
      .option('-be, --binary-encoding <encoding>', `Set binary encoding ${binaryEncodingChoices}`)
      .option('-ne, --no-emoji', 'Disable emoji')
      .helpOption('--help', 'Display help')
      .addHelpText('before', ' ')
      .addHelpText('after', EOL + websocketExamples + EOL)
      .action((address: string, options: OptionValues) => {
        config = {
          socketType: SocketType.WebSocket,
          socketAddress: address,
          apiPort: Number(options.apiPort),
          apiHost: options.apiHost,
          headers: this.parseKeyValueOption('-h, --header <key:value...>', options.header),
          binaryEncoding: options.binaryEncoding,
          emoji: options.emoji,
          replyTimeout: Number(options.replyTimeout),
          connectionTimeout: connectionTimeout,
          reconnectionInterval: reconnectionInterval,
        }
      }).alias('ws')

    program
      .command('socketio <address>')
      .description('Run socket.io client')
      .enablePositionalOptions(false)
      .option('-ap, --api-port <port>', 'Set api port', '3000')
      .option('-ah, --api-host <host>', 'Set api host', '127.0.0.1')
      .option('-h, --header <key:value...>', 'Set http headers')
      .option('-a, --auth <key:value...>', 'Set authentication payload')
      .option('-t, --transport <transport>', `Set transport ${ioTransportChoices}`)
      .option('-rt, --reply-timeout <timeout>', 'Set reply timeout in ms', '1000')
      .option('-be, --binary-encoding <encoding>', `Set binary encoding ${binaryEncodingChoices}`)
      .option('-ne, --no-emoji', 'Disable emoji')
      .helpOption('--help', 'Display help')
      .addHelpText('before', ' ')
      .addHelpText('after', EOL + socketIOExamples + EOL)
      .action((address: string, options: OptionValues) => {
        config = {
          socketType: SocketType.SocketIO,
          socketAddress: address,
          apiPort: Number(options.apiPort),
          apiHost: options.apiHost,
          headers: this.parseKeyValueOption('-h, --header <key:value...>', options.header),
          binaryEncoding: options.binaryEncoding,
          emoji: options.emoji,
          replyTimeout: Number(options.replyTimeout),
          ioAuth: this.parseKeyValueOption('-a, --auth <key:value...>', options.auth),
          ioTransport: options.transport,
          connectionTimeout: connectionTimeout,
          reconnectionInterval: reconnectionInterval,
        }
      }).alias('io')

    program
      .command('tcp <address>')
      .description('Run tcp client')
      .enablePositionalOptions(false)
      .option('-ap, --api-port <port>', 'Set api port', '3000')
      .option('-ah, --api-host <host>', 'Set api host', '127.0.0.1')
      .option('-s, --sync', 'Enable sync mode')
      .option('-rt, --reply-timeout <timeout>', 'Set reply timeout in ms (sync mode only)', '1000')
      .option('-be, --binary-encoding <encoding>', `Set binary encoding ${binaryEncodingChoices}`)
      .option('-ne, --no-emoji', 'Disable emoji')
      .helpOption('--help', 'Display help')
      .addHelpText('before', ' ')
      .addHelpText('after', EOL + tcpExamples + EOL)
      .action((address: string, options: OptionValues) => {
        config = {
          socketType: SocketType.Tcp,
          socketAddress: address,
          apiPort: Number(options.apiPort),
          apiHost: options.apiHost,
          binaryEncoding: options.binaryEncoding,
          emoji: options.emoji,
          replyTimeout: Number(options.replyTimeout),
          netSync: options.sync,
          connectionTimeout: connectionTimeout,
          reconnectionInterval: reconnectionInterval,
        }
      })

    program
      .command('unix <address>')
      .description('Run unix client')
      .enablePositionalOptions(false)
      .option('-ap, --api-port <port>', 'Set api port', '3000')
      .option('-ah, --api-host <host>', 'Set api host', '127.0.0.1')
      .option('-s, --sync', 'Enable sync mode')
      .option('-rt, --reply-timeout <timeout>', 'Set reply timeout in ms (sync mode only)', '1000')
      .option('-be, --binary-encoding <encoding>', `Set binary encoding ${binaryEncodingChoices}`)
      .option('-ne, --no-emoji', 'Disable emoji')
      .helpOption('--help', 'Display help')
      .addHelpText('before', ' ')
      .addHelpText('after', EOL + unixExamples + EOL)
      .action((address: string, options: OptionValues) => {
        config = {
          socketType: SocketType.Unix,
          socketAddress: address,
          apiPort: Number(options.apiPort),
          apiHost: options.apiHost,
          binaryEncoding: options.binaryEncoding,
          emoji: options.emoji,
          replyTimeout: Number(options.replyTimeout),
          netSync: options.sync,
          connectionTimeout: connectionTimeout,
          reconnectionInterval: reconnectionInterval,
        }
      })

    program.parse()

    if (!config) {
      console.error('error: unknown command')
      process.exit(1)
    }

    return this.validateConfig(config)
  }

  private validateConfig(config: CliConfig): CliConfig {
    const errors: string[] = []

    if (platform === 'win32' && config.socketType === SocketType.Unix) {
      errors.push('unix-socket client does not work in windows')
    }
    if (isNaN(config.apiPort) || config.apiPort >= 65536 || config.apiPort < 0) {
      errors.push('api-port must be >= 0 and < 65536')
    }
    if (isNaN(config.replyTimeout) || config.replyTimeout < 1) {
      errors.push('reply-timeout must be a positive number')
    }

    if (errors.length > 0) {
      if (errors.length === 1) {
        console.error(`error: ${errors[0]}`)
        process.exit(1)
      }

      console.error(`errors:${EOL}` + errors.map(e => `  ${e}`).join(EOL))
      process.exit(1)
    }

    return config
  }

  private choices(choices: string[]): string {
    const joined = choices
      .map(choice => `"${choice}"`)
      .join(',')

    return `(choices: ${joined})`
  }

  private parseKeyValueOption(optionName: string, optionValue?: string[]): Optional<AnyObject> {
    if (optionValue) {
      const args = optionValue.map(item => item.split(':'))
      const isFormatValid = args.every(item => item.length > 1)

      if (!isFormatValid) {
        console.error(`error: option ${optionName} incorrect argument`)
        process.exit(1)
      }

      const parsed: AnyObject = {}

      args.forEach(arg => {
        const key = arg[0]
        const rawValue = arg.slice(1).join(':')
        const numericValue = Number(rawValue)

        let parsedValue: any = rawValue

        if (!isNaN(numericValue) && rawValue !== '') {
          parsedValue = numericValue
        }
        if (['true', 'false'].includes(rawValue)) {
          parsedValue = Boolean(rawValue)
        }
        if (rawValue === 'null') {
          parsedValue = null
        }

        parsed[key] = parsedValue
      })

      return parsed
    }

    return undefined
  }
}

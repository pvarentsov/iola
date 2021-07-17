import * as chalk from 'chalk'
import { OptionValues, program } from 'commander'
import { EOL } from 'os'

import { CliConfig, ICliParser } from '@iola/api/cli'
import { BinaryEncoding, EnumUtil, Optional, SocketIOTransport } from '@iola/core/common'
import { SocketType } from '@iola/core/socket'

export class CliParser implements ICliParser {
  parse(): CliConfig {
    let config: Optional<CliConfig>

    const description =
      `${chalk.bold('iola')} - a socket client with rest api`

    const binaryEncodingChoices = this.choices(EnumUtil.values(BinaryEncoding))
    const ioTransportChoices = this.choices(EnumUtil.values(SocketIOTransport))

    const api = `API:${EOL}` +
      `  GET  /messages                    Get message list${EOL}` +
      `  GET  /messages/{id}               Get message by id${EOL}` +
      `  POST /messages                    Send message ${EOL}` +
      '  GET  /docs                        Get api documentation'

    const websocketExamples = `Examples: ${EOL}` +
      `  iola websocket ws://127.0.0.1:8080 ${EOL}` +
      `  iola ws ws://127.0.0.1:8080/?token=secret ${EOL}` +
      `  iola websocket ws://127.0.0.1:8080 --binary-encoding utf8 ${EOL}` +
      '  iola websocket ws://127.0.0.1:8080 --reply-timeout 3000 --no-emoji'

    const socketIOExamples = `Examples: ${EOL}` +
      `  iola socketio http://127.0.0.1:8080 ${EOL}` +
      `  iola io http://127.0.0.1:8080/?token=secret --transport websocket${EOL}` +
      `  iola socketio http://127.0.0.1:8080 --binary-encoding utf8 ${EOL}` +
      '  iola socketio http://127.0.0.1:8080 --reply-timeout 3000 --no-emoji'


    program
      .version('0.1.1', '-v, --version', 'Display version')
      .helpOption('-h, --help', 'Display help')
      .addHelpText('before', EOL + description + EOL)
      .addHelpText('after', EOL + api + EOL)
      .addHelpCommand('help [command]', 'Display help for command')

    program
      .command('websocket <address>')
      .description('Run websocket client')
      .enablePositionalOptions(false)
      .option('-ap, --api-port <port>', 'Set api port', '3000')
      .option('-ah, --api-host <host>', 'Set api host', '127.0.0.1')
      .option('-rt, --reply-timeout <timeout>', 'Set reply timeout in ms', '2000')
      .option('-be, --binary-encoding <encoding>', `Set binary encoding ${binaryEncodingChoices}`)
      .option('-ne, --no-emoji', 'Disable emoji')
      .helpOption('-h, --help', 'Display help')
      .addHelpText('before', ' ')
      .addHelpText('after', EOL + websocketExamples + EOL)
      .action((address: string, options: OptionValues) => {
        config = {
          socketType: SocketType.WebSocket,
          socketAddress: address,
          apiPort: Number(options.apiPort),
          apiHost: options.apiHost,
          binaryEncoding: options.binaryEncoding,
          emoji: options.emoji,
          replyTimeout: Number(options.replyTimeout),
          connectionTimeout: 3000,
          reconnectionInterval: 5000,
        }
      }).alias('ws')

    program
      .command('socketio <address>')
      .description('Run socket.io client')
      .enablePositionalOptions(false)
      .option('-ap, --api-port <port>', 'Set api port', '3000')
      .option('-ah, --api-host <host>', 'Set api host', '127.0.0.1')
      .option('-t, --transport <transport>', `Set transport ${ioTransportChoices}`)
      .option('-rt, --reply-timeout <timeout>', 'Set reply timeout in ms', '2000')
      .option('-be, --binary-encoding <encoding>', `Set binary encoding ${binaryEncodingChoices}`)
      .option('-ne, --no-emoji', 'Disable emoji')
      .helpOption('-h, --help', 'Display help')
      .addHelpText('before', ' ')
      .addHelpText('after', EOL + socketIOExamples + EOL)
      .action((address: string, options: OptionValues) => {
        config = {
          socketType: SocketType.SocketIO,
          socketAddress: address,
          apiPort: Number(options.apiPort),
          apiHost: options.apiHost,
          binaryEncoding: options.binaryEncoding,
          emoji: options.emoji,
          replyTimeout: Number(options.replyTimeout),
          ioTransport: options.transport,
          connectionTimeout: 3000,
          reconnectionInterval: 5000,
        }
      }).alias('io')

    program.parse()

    if (!config) {
      console.error('error: unknown command')
      process.exit(1)
    }

    return this.validateConfig(config)
  }

  private validateConfig(config: CliConfig): CliConfig {
    const errors: string[] = []

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
}

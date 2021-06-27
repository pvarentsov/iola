import { CliConfig, ICliParser } from '@iola/api/cli'
import { Optional } from '@iola/core/common'
import { SocketType } from '@iola/core/socket'
import * as chalk from 'chalk'
import { OptionValues, program } from 'commander'
import { EOL } from 'os'

export class CliParser implements ICliParser {
  parse(): CliConfig {
    let config: Optional<CliConfig>

    const description =
      `${chalk.bold('iola')} - a socket client with rest api`

    const api = `API:${EOL}` +
      `  GET  /messages                 Get message list${EOL}` +
      `  GET  /messages/{id}            Get message by id${EOL}` +
      `  POST /messages                 Send message ${EOL}` +
      '  GET  /docs                     Get api documentation'

    const websocketExamples = `Examples: ${EOL}` +
      `  iola websocket ws://127.0.0.1:8080 ${EOL}` +
      '  iola websocket ws://127.0.0.1:8080 --reply-timeout 3000 --no-emoji'


    program
      .version('0.0.6', '-v, --version', 'Display version')
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
          emoji: options.emoji,
          replyTimeout: Number(options.replyTimeout),
          connectionTimeout: 3000,
          reconnectionInterval: 5000,
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
}

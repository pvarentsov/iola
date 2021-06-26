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
      .version('0.0.4', '-v, --version', 'Display version')
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
      console.log('error: unknown command')
      process.exit(1)
    }

    return config
  }
}

import { CliConfig, ICliParser } from '@iola/api/cli'
import { SocketType } from '@iola/core/socket'
import * as chalk from 'chalk'
import { OptionValues, program } from 'commander'
import { EOL } from 'os'

export class CliParser implements ICliParser {
  parse(): CliConfig {
    const config: CliConfig = {
      apiPort: 0,
      apiHost: '',
      socketType: SocketType.WebSocket,
      socketAddress: '',
      emoji: false,
    }

    const description =
      `${chalk.bold('iola')} - a socket client with rest api`

    const api = `API:${EOL}` +
      `  GET  /messages                 Get message list${EOL}` +
      `  GET  /messages/{id}            Get message by id${EOL}` +
      `  POST /messages                 Send message ${EOL}` +
      '  GET  /docs                     Get api documentation'

    program
      .version('0.0.3', '--version', 'Display version')
      .helpOption('--help', 'Display help')
      .addHelpText('before', description + EOL)
      .addHelpText('after', EOL + api)
      .addHelpCommand('help [command]', 'Display help for command')

    program
      .command('websocket <address>')
      .description('Run websocket client')
      .enablePositionalOptions(false)
      .option('--port <port>', 'Set api port', '3000')
      .option('--host <host>', 'Set api host', 'localhost')
      .option('--no-emoji', 'Disable emoji')
      .helpOption('--help', 'Display help')
      .action((address: string, options: OptionValues) => {
        config.socketType = SocketType.WebSocket
        config.socketAddress = address
        config.apiPort = Number(options.port)
        config.apiHost = options.host
        config.emoji = options.emoji
      })

    program.parse()

    return config
  }
}

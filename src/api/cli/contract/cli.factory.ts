import { CliConfig, ICliInteractive, ICliLogger, ICliParser } from '@iola/api/cli'
import { CliInteractive } from '@iola/api/cli/cli/cli.interactive'
import { CliParser } from '@iola/api/cli/cli/cli.parser'
import { CliLogger } from '@iola/api/cli/cli/cli.logger'

export class CliFactory {
  static createParser(version: string): ICliParser {
    return new CliParser(version)
  }

  static createInteractive(config: CliConfig, logger?: ICliLogger): ICliInteractive {
    return new CliInteractive(config, logger || new CliLogger())
  }
}

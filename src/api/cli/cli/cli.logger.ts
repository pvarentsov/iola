import { ICliLogger } from '@iola/api/cli'

export class CliLogger implements ICliLogger {
  log(message?: any): void {
    console.log(message)
  }
}

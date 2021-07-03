import { LoggerService } from '@nestjs/common'

export class HttpLogger implements LoggerService {
  error(message: string): void {
    console.error(message)
  }

  log(): void {
    return undefined
  }

  warn(): void {
    return undefined
  }
}

import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { Response } from 'express'
import { Observable, of } from 'rxjs'
import { mapTo } from 'rxjs/operators'

@Catch()
export class HttpFilter implements ExceptionFilter {
  catch(error: Error & { response?: any }, host: ArgumentsHost): Observable<void> {
    const response = host
      .switchToHttp()
      .getResponse<Response>()

    return of(response.json(this.parseError(error))).pipe(
      mapTo(undefined)
    )
  }

  private parseError(error: Error & { response?: any }): { statusCode: number, message: unknown, error: string } {
    let statusCode = 500
    let message = error.message
    let errorType = 'Internal Error'

    if (error.response) {
      statusCode = error.response.statusCode || statusCode
      message = error.response.message || message
      errorType = error.response.error
    }

    return {statusCode, message, error: errorType}
  }
}

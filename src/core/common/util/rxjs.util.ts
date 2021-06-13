import { Observable, of } from 'rxjs'
import { catchError, map, timeout } from 'rxjs/operators'

export class RxJSUtil {
  static timeout<T>(each: number, message: string) {
    return (source: Observable<T>): Observable<T> => {
      return source.pipe(
        timeout(each),
        catchError(error => of(error)),
        map(value => {
          if (value instanceof Error) {
            if (value.message === 'Timeout has occurred') {
              throw new Error(message)
            }
            throw value
          }

          return value
        }),
      )
    }
  }
}

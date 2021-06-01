import { Observable, ReplaySubject, Subject } from 'rxjs'
import { SocketEventType } from '../contract/socket.enum'
import { ISocketStore } from '../contract/socket.interface'
import { SocketEvent } from '../contract/socket.type'

export class SocketStore implements ISocketStore {
  private readonly _events: SocketEvent[]
  private readonly _events$: Subject<SocketEvent>

  constructor() {
    this._events = []

    this._events$ = new ReplaySubject(100)
    this._events$.subscribe()
  }

  events(by?: {type?: SocketEventType}): SocketEvent[] {
    let result = this._events

    if (by?.type) {
      result = result.filter(item => item.type === by.type)
    }

    return result
  }

  events$(): Observable<SocketEvent> {
    return this._events$
  }

  addEvent(event: SocketEvent): void {
    this._events.push(event)
    this._events$.next(event)
  }
}
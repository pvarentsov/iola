import { Observable, ReplaySubject, Subject } from 'rxjs'
import { SocketEventType } from '../contract/socket.enum'
import { ISocketEventStore } from '../contract/socket.interface'
import { SocketEvent } from '../contract/socket.type'

export class EventStore implements ISocketEventStore {
  private readonly _events: Required<SocketEvent>[]
  private readonly _events$: Subject<Required<SocketEvent>>

  constructor() {
    this._events = []

    this._events$ = new ReplaySubject(100)
    this._events$.subscribe()
  }

  list(by?: {types?: SocketEventType[]}): Required<SocketEvent>[] {
    let result = this._events

    if (by?.types) {
      result = result.filter(item => by.types!.includes(item.type))
    }

    return result
  }

  listen(): Observable<Required<SocketEvent>> {
    return this._events$
  }

  add(event: SocketEvent): void {
    const id = this._events.length + 1

    this._events.push({id, ...event})
    this._events$.next({id, ...event})
  }
}

import { interval, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

import { BinaryMessage, IBinaryMessageStore } from '@iola/core/socket'

export class BinaryMessageStore implements IBinaryMessageStore {
  private readonly store: BinaryMessage[]
  private readonly ticker$: Observable<number>

  private loading: boolean

  constructor() {
    this.store = []

    this.ticker$ = interval(2000)
    this.loading = false
  }

  group(): Observable<Buffer> {
    const diffBetweenMessages = 500

    return this.ticker$.pipe(
      map(() => this.groupMessage(diffBetweenMessages)),
      filter(buffer => buffer.length > 0),
    )
  }

  add(data: Buffer): void {
    this.store.push({
      date: Date.now(),
      data: data
    })
  }

  private groupMessage(diffBetweenMessages: number): Buffer {
    let buffer = Buffer.alloc(0)

    if (!this.loading) {
      if (this.store.length) {
        this.loading = true
        const count = this.countGroupedChunks(diffBetweenMessages)

        if (count > 0) {
          for (let i = 0; i < count; i++) {
            const message = this.store.shift()
            const data = message?.data || Buffer.alloc(0)

            buffer = Buffer.concat([buffer, data])
          }
        }

        this.loading = false
      }
    }

    return buffer
  }

  private countGroupedChunks(diffBetweenMessages: number): number {
    let count = 0
    let lastDate = 0

    for (const message of this.store) {
      if (lastDate === 0) {
        count++
        lastDate = message.date
        continue
      }
      if (message.date - lastDate >= diffBetweenMessages) {
        break
      }
      else {
        count++
        lastDate = message.date
      }
    }

    return count
  }
}

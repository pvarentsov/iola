import { Optional } from '@iola/core/common'
import { BinaryMessage, IBinaryMessageStore } from '@iola/core/socket'
import { interval, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'

export class BinaryMessageStore implements IBinaryMessageStore {
  private readonly store: BinaryMessage[]
  private readonly buffer: BinaryMessage[]
  private readonly ticker$: Observable<number>

  constructor() {
    this.store = []
    this.buffer = []

    this.ticker$ = interval(200)
  }

  load(): Observable<Buffer> {
    const diffBetweenMessages = 500

    return this.ticker$.pipe(
      map<number, Buffer>(() => this.loadBuffer(diffBetweenMessages)!),
      filter<Buffer>(buffer => buffer !== undefined),
    )
  }

  add(data: Buffer): void {
    this.store.push({
      date: new Date(),
      data: data
    })
  }

  private loadBuffer(diffBetweenMessages: number): Optional<Buffer> {
    const date = Date.now()
    const lastBufferedMessage = this.buffer[this.buffer.length - 1]

    let ready = false
    let count = 0

    if (lastBufferedMessage && date - lastBufferedMessage.date.getTime() >= diffBetweenMessages) {
      return this.concatBuffer()
    }

    if (this.store.length > 0) {
      for (const message of this.store) {
        if (!lastBufferedMessage) {
          count++
          continue
        }

        const messageDiff = message.date.getTime() - lastBufferedMessage.date.getTime()

        if (messageDiff >= diffBetweenMessages) {
          ready = true
          break
        }

        count++
      }
    }

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        this.buffer.push(this.store.shift()!)
      }
    }

    if (ready) {
      return this.concatBuffer()
    }
  }

  private concatBuffer(): Buffer {
    let buffer = Buffer.alloc(0)

    if (this.buffer.length === 0) {
      return buffer
    }
    for (let i = 0; i < this.buffer.length; i++) {
      buffer = Buffer.concat([buffer, this.buffer.shift()!.data])
    }

    return buffer
  }
}

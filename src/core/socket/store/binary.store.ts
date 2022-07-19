import { Observable, ReplaySubject, Subject } from 'rxjs'
import { IBinaryStore } from '@iola/core/socket'

export class BinaryStore implements IBinaryStore {
  private chunks: Array<Chunks>
  private buffer$: Subject<Buffer>
  private readonly timer: NodeJS.Timer

  constructor() {
    this.chunks = []
    this.buffer$ = new ReplaySubject(100)
    this.timer = setInterval(() => this.add(Buffer.alloc(0)), 1000)
  }

  listen(): Observable<Buffer> {
    return this.buffer$
  }

  add(chunk: Buffer): void {
    if (this.chunks.length === 0) {
      return this.pushIfNecessary(chunk)
    }

    const last = this.chunks[this.chunks.length - 1]

    if (Date.now() - last.date > 100) {
      const buffer = Buffer.concat(this.chunks.map(ch => ch.chunk))

      this.chunks = []
      this.buffer$.next(buffer)
    }

    this.pushIfNecessary(chunk)
  }

  close(): void {
    clearInterval(this.timer)
    this.clear()
  }

  clear(): void {
    this.chunks = []
    this.buffer$ = new ReplaySubject(100)
  }

  private pushIfNecessary(chunk: Buffer): void {
    if (chunk.length > 0) {
      this.chunks.push({date: Date.now(), chunk: chunk})
    }
  }
}

type Chunks = {
  date: number,
  chunk: Buffer,
}
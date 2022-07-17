import { Server } from 'ws'
import { Optional } from '@iola/core/common'

export class WsServer {
  private wss: Server

  public start(port: number): void {
    this.wss = new Server({port})

    this.wss.on('connection', (ws) => {
      ws.on('message', (data, isBuffer) => {
        if (isBuffer) {
          ws.send('binary reply', {binary: isBuffer})
          return
        }

        const json = tryParseJSON(data.toString())

        if (json) {
          const requestIdInfo = findRequestId(json)
          const message: Record<string, any> = {message: 'json reply'}

          if (requestIdInfo) {
            message[requestIdInfo.key] = requestIdInfo.value
          }

          ws.send(JSON.stringify(message), {binary: isBuffer})
          return
        }

        ws.send('string reply', {binary: isBuffer})
      })
    })
  }

  public close(): void {
    this.wss?.removeAllListeners()
    this.wss?.close()
  }
}

function tryParseJSON(str: string): Optional<Record<string, any> | Record<string, any>[]> {
  let res: Optional<Record<string, any> | Record<string, any>[]> = undefined

  try {
    res = JSON.parse(str)
  }
  catch (err) {}

  return res
}

function findRequestId(message: any): Optional<{key: string, value: any}> {
  const requestIdKeys = [
    'requestid',
    'request_id',
    'reqid',
    'req_id',
    'traceid',
    'trace_id',
  ]

  let requestIdKey

  if (typeof message === 'object' && message !== null && !Array.isArray(message)) {
    Object.keys(message).forEach(key => {
      if (requestIdKeys.includes(key.toLowerCase())) {
        requestIdKey = key
      }
    })
  }

  return requestIdKey
    ? {key: requestIdKey, value: message[requestIdKey]}
    : undefined
}


import { Server, WebSocket } from 'ws'
import { IncomingHttpHeaders } from 'http'
import { parse as parseURL } from 'url'
import { parse as parseQuery, ParsedUrlQuery } from 'querystring'

import { Optional } from '@iola/core/common'

export class WsServer {
  private wss: Server

  private _clients: Array<WebSocket> = []
  private _port: number
  private _headers: IncomingHttpHeaders
  private _query: ParsedUrlQuery

  public start(port: number): void {
    this._port = port
    this.wss = new Server({port})

    this.wss.on('connection', (ws, req) => {
      this._query = parseQuery(parseURL(req.url + '').query + '')
      this._headers = req.headers

      this._clients.push(ws)

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

            if (requestIdInfo.value === 'timeout') {
              setTimeout(() => ws.send(JSON.stringify(message), {binary: isBuffer}), 20)
              return
            }
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

  public disconnectClients(): void {
    for (const client of this._clients) {
      client.terminate()
    }
  }

  public query(): ParsedUrlQuery {
    return this._query
  }

  public headers(): IncomingHttpHeaders {
    return this._headers
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


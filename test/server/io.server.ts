import { IncomingHttpHeaders, createServer, Server as HTTPServer } from 'http'
import { ParsedUrlQuery } from 'querystring'
import { Server } from 'socket.io'

export class IOServer {
  private ios: Server
  private https: HTTPServer

  private _port: number
  private _headers: IncomingHttpHeaders
  private _query: ParsedUrlQuery
  private _auth: Record<string, any>

  public start(port: number): void {
    this._port = port

    this.https = createServer()
    this.ios = new Server(this.https, {cors: {origin: '*'}})

    this.https.listen(port)

    this.ios.on('connection', socket => {
      this._query = socket.handshake.query
      this._headers = socket.handshake.headers
      this._auth = socket.handshake.auth

      socket.on('type:any', (data, cb) => cb(data))
      socket.on('type:binary', (data, cb) => cb(Buffer.from('binary reply')))

      socket.on('timeout', (data, cb) => setTimeout(() => cb(data), 20))
    })
  }

  public close(): void {
    this.ios?.removeAllListeners()
    this.https?.removeAllListeners()

    this.ios?.close()
    this.https?.close()
  }

  public disconnectClients(): void {
    this.ios.disconnectSockets(true)
  }

  public query(): ParsedUrlQuery {
    return this._query
  }

  public headers(): IncomingHttpHeaders {
    return this._headers
  }

  public auth(): Record<string, any> {
    return this._auth
  }
}
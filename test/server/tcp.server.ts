import { createServer, Server, Socket } from 'net'

export class TCPServer {
  private tcps: Server

  private _clients: Array<Socket> = []
  private _port: number

  public start(port: number): void {
    this._port = port

    this.tcps = createServer()
    this.tcps.listen(port)

    this.tcps.on('connection', socket => {
      this._clients.push(socket)

      socket.on('data', chunk => {
        socket.write(chunk)
      })
    })
  }

  public close(): void {
    this.tcps?.removeAllListeners()
    this.tcps?.close()
  }

  public disconnectClients(): void {
    for (const client of this._clients) {
      client.destroy()
    }
    this._clients = []
  }
}
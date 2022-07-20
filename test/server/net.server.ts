import { createServer, Server, Socket } from 'net'
import { join } from 'path'

export class NetServer {
  private nets: Server

  private _clients: Array<Socket> = []

  public start(portOrPath: number|string): void {
    this.nets = createServer()
    this.nets.listen(portOrPath)

    this.nets.on('connection', socket => {
      this._clients.push(socket)

      socket.on('data', chunk => {
        socket.write(chunk)
      })
    })
  }

  public close(): void {
    this.nets?.removeAllListeners()
    this.nets?.close()
  }

  public disconnectClients(): void {
    for (const client of this._clients) {
      client.destroy()
    }
    this._clients = []
  }

  static unixAddr(): string {
    return join(__dirname, 'net.server.unix.sock')
  }
}
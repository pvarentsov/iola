const WebSocket = require('ws')
const util = require('util')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {
  ws.on('message', data => {
    console.log(data.toString())
  })

  setTimeout(() => {
    ws.send(JSON.stringify({
      event: 'handshake',
      data: 'Hi, Iola!'
    }))
  }, 2_000)

  setTimeout(() => {
    ws.send(JSON.stringify({
      event: 'ping',
      data: '🏓'
    }))
  }, 2_000)

  setTimeout(() => {
    ws.send(Buffer.from('Hello!'))
  }, 4_000)

  setTimeout(() => {
    ws.send(42)
  }, 6_000)
})

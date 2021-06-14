const WebSocket = require('ws')
const util = require('util')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {
  ws.on('message', data => {
    const message = data.toString()
    console.log(message)
  })

  setTimeout(() => {
    ws.send('Hi, Iola!')
  }, 2_000)
})

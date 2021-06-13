const WebSocket = require('ws')
const util = require('util')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {
  ws.on('message', data => {
    console.log(data.toString())
  })

  setTimeout(() => {
    ws.send(JSON.stringify({
      event: 'greeting',
      data: 'Hi, Iola!'
    }))
  }, 2_000)
})

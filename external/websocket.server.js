const WebSocket = require('ws')
const util = require('util')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {
  ws.on('message', data => {
    const message = data.toString()

    if (message === 'Something Ends') {
      ws.send(Buffer.from('Something Begins'))
    }

    console.log(message)
  })

  setTimeout(() => {
    ws.send('Hi, Iola!')
  }, 2_000)
})

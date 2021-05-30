const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {
  ws.on('message', data => {
    let parseData = data

    try {
      parseData = JSON.parse(data)
    } catch (error) {}

    ws.send(JSON.stringify({
      event: 'handshake',
      data: 'Hi, Iola!'
    }))
  })

  const sendInterval = setInterval(() => {
    ws.send(JSON.stringify({
      event: 'ping',
      data: '🏓'
    }))
  }, 2_000)

  setTimeout(() => {
    clearInterval(sendInterval)
    ws.close(undefined, 'Server close the connection')
  }, 10_000)
})
const WebSocket = require('ws')

const wss = new WebSocket.Server({ port: 8080 })

wss.on('connection', ws => {
  ws.on('message', data => {
    let parseData = data

    try {
      parseData = JSON.parse(data)
    } catch (error) {}

    ws.send(JSON.stringify({
      event: 'reply',
      data: parseData
    }))
  })

  setInterval(() => {
    ws.send(JSON.stringify({
      event: 'ping',
      data: ':)'
    }))
  }, 5_000)
})
const WebSocket = require('ws')

const PORT = 8080

const wss = new WebSocket.Server({ port: PORT })
console.log(`Server running on 127.0.0.1:${PORT}\n`)

wss.on('connection', (ws, req) => {
  console.dir({
    handshake: {
      url: req.url,
      headers: req.headers,
  }})

  ws.on('message', (data, isBuffer) => {
    console.dir({data, isBuffer})

    ws.send('Hi, Iola!', {binary: false})

    const message = data.toString()
    let json = undefined

    try {
      json = JSON.parse(message)
    } catch (err) {}

    if (json) {
      const requestIdInfo = findRequestId(json)

      if (requestIdInfo) {
        ws.send(JSON.stringify({
          [requestIdInfo.key]: requestIdInfo.value,
          message: 'Hi, Iola!'
        }), {binary: false})
      }
    }
  })
})

function findRequestId(message) {
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

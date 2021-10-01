const http = require('http')
const io = require('socket.io')

const httpServer = http.createServer()
const ioServer = new io.Server(httpServer, {
  cors: {
    origin: '*'
  },
})

ioServer.on('connection', socket => {
  console.dir({
    handshake: {
      query: socket.handshake.query,
      auth: socket.handshake.auth,
      headers: socket.handshake.headers,
  }})

  socket.emit('null', null)
  socket.emit('number', 42)
  socket.emit('bool', false)
  socket.emit('array', ['42', {}, 1])
  socket.emit('object', {a: 'a', b: [null]})
  socket.emit('greeting', new Uint8Array(Buffer.from('hello')))

  socket.on('request', (data, cb) => {
    console.dir({event: 'request', data})
    cb({message: 'reply on request'})
  })

  socket.on('emit', data => {
    console.dir({event: 'emit', data})
  })
});

const PORT = 8081

httpServer.listen(PORT)
console.log(`Server running on 127.0.0.1:${PORT}\n`)

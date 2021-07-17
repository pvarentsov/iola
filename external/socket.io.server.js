const http = require('http')
const io = require('socket.io')

const httpServer = http.createServer()
const ioServer = new io.Server(httpServer, {
  cors: {
    origin: '*'
  }
})

ioServer.on('connection', socket => {
  console.dir({handshake: socket.handshake.query})

  socket.emit('null', null)
  socket.emit('number', 42)
  socket.emit('bool', false)
  socket.emit('array', ['42', {}, 1])
  socket.emit('object', {a: 'a', b: [null]})
  socket.emit('greeting', new Uint8Array(Buffer.from('hell')))

  socket.on('request', (data, cb) => {
    console.dir({event: 'request', data})
    cb({message: 'reply on request'})
  })

  socket.on('emit', data => {
    console.dir({event: 'emit', data})
  })
});

httpServer.listen(8081)

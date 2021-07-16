const http = require('http')
const io = require('socket.io')

const httpServer = http.createServer()
const ioServer = new io.Server(httpServer, {})

ioServer.on('connection', socket => {
  socket.emit('null', null)
  socket.emit('number', 42)
  socket.emit('bool', false)
  socket.emit('array', ['42', {}, 1])
  socket.emit('object', {a: 'a', b: [null]})
  socket.emit('greeting', new Uint8Array(Buffer.from('hell')))

  socket.onAny((event, data, cb) => {
    console.log(event, data)
    cb(42)
  })
});

httpServer.listen(8080)

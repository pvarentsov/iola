const net = require('net');

const server = new net.createServer();

const PORT = 8082

server.listen(PORT);
console.log(`Server running on 127.0.0.1:${PORT}\n`)

server.on('connection', function (socket) {
  socket.on('data', function (chunk) {
    console.log(chunk)
    socket.write(chunk)
    // socket.destroy()
  });

  socket.on('error', err => console.log(`err: ${err}`))
  socket.on('end', () => console.log('end'))
  socket.on('close', () => console.log('close'))
});

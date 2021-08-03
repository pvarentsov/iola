const net = require('net');

const server = new net.createServer();

server.listen(8082);

server.on('connection', function (socket) {
  socket.on('data', function (chunk) {
    console.log(chunk)
    socket.write(chunk)
  });

  socket.on('error', err => console.log(`err: ${err}`))
  socket.on('end', () => console.log('end'))
  socket.on('close', () => console.log('close'))
});

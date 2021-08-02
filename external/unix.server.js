const net = require('net');

const server = new net.createServer();

server.listen(8082);

server.on('connection', function (socket) {
  socket.on('data', function (chunk) {
    console.log(chunk)

    for (let i = 0; i < 1000; i++) {
      socket.write(`${i.toString().padStart(5, '0')}: ${chunk.toString()}`)
    }

    setTimeout(() => socket.write(chunk), 1100)
  });
});

const net = require('net')
const fs = require('fs')
const path = require('path')

const socketPath = path.join(__dirname, 'unix.sock')
fs.unlinkSync(socketPath)

const server = new net.createServer();

server.listen(socketPath);

server.on('connection', function (socket) {
  socket.on('data', function (chunk) {
    console.log(chunk)

    for (let i = 0; i < 1000; i++) {
      socket.write(`${i.toString().padStart(5, '0')}: ${chunk.toString()}`)
    }

    setTimeout(() => socket.write(chunk), 1100)
  });
});

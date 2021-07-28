const net = require('net');

const server = new net.createServer();

server.listen(8082);

server.on('connection', function (socket) {
  socket.on('data', function (chunk) {
    console.log(chunk)

    socket.write(chunk)

    setTimeout(() => socket.write(chunk), 100)
    setTimeout(() => socket.write(chunk), 200)
    setTimeout(() => socket.write(chunk), 300)
    setTimeout(() => socket.write(chunk), 400)
    setTimeout(() => socket.write(chunk), 500)

    setTimeout(() => socket.write(chunk), 1000)
  });
});

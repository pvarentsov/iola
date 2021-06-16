# iola

[![License: MIT](https://img.shields.io/github/license/pvarentsov/iola)](https://github.com/pvarentsov/iola/blob/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/iola.svg)](https://www.npmjs.com/package/iola)

## Description

**iola** - a socket client with rest api. It helps to work with socket servers using your favorite rest client.

**Features:**

1. Read messages via rest api
2. Send messages via rest api
3. Log all socket events in console

<p align="center"> 
  <img src="./demo/demo.png">
</p>

**Roadmap**:
- [ ] Detailed documentation
- [ ] Implement clients
  - [x] WebSocket
  - [ ] SocketIO
  - [ ] Tcp
  - [ ] Unix-socket
- [ ] Add application's binaries for all popular platforms


## Installation
```bash
$ npm install -g iola
```
## Usage

<pre>
$ iola -h

<b>iola</b> - a socket client with rest api

Usage: iola [options]

Options:
  -st, --socket-type &lt;type>        * set socket type (types: "websocket")
  -sa, --socket-address &lt;address>  * set socket address
  -ap, --api-port &lt;port>             set api port (default: "3000")
  -ah, --api-host &lt;host>             set api host (default: "localhost")
  -ne, --no-emoji                    disable emoji
  -v, --version                      print version
  -h, --help                         print help

API:
  GET  /messages                     get message list
  GET  /messages/{id}                get message by id
  POST /messages                     send message 
  GET  /docs                         get api documentation

Example:
  iola --socket-type websocket --socket-address ws://localhost:8080

</pre>

## License

This project is licensed under the [MIT License](https://github.com/pvarentsov/iola/blob/main/LICENSE).

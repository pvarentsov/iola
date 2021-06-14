# iola - a socket client with rest api

![demo](./demo/demo.png)

### Installation
```bash
$ npm install -g iola
```
### Usage

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

# iola

[![License: MIT](https://img.shields.io/github/license/pvarentsov/iola)](https://github.com/pvarentsov/iola/blob/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/iola.svg)](https://www.npmjs.com/package/iola)

<details>
  <summary><b>Table of contents</b> (click to open)</summary>
  <br>
  <ul>
    <li><a href="https://github.com/pvarentsov/iola#description">Description</a></li>
    <li><a href="https://github.com/pvarentsov/iola#installation">Installation</a></li>
    <li><a href="https://github.com/pvarentsov/iola#usage">Usage</a></li>
    <ul>
      <li><a href="https://github.com/pvarentsov/iola#cli">CLI</a></li>
        <ul>
          <li><a href="https://github.com/pvarentsov/iola#websocket">WebSocket</a></li>
        </ul>
      <li><a href="https://github.com/pvarentsov/iola#rest-api">Rest API</a></li>
        <ul>
          <li><a href="https://github.com/pvarentsov/iola#swagger">Swagger</a></li>
          <li><a href="https://github.com/pvarentsov/iola#server-reply">Server reply</a></li>
        </ul>
    </ul>
    <li><a href="https://github.com/pvarentsov/iola#license">License</a></li>
  </ul>
</details>


## Description

**iola** - a socket client with rest api. It helps to work with socket servers using your favorite rest client.

<p align="center"> 
  <img src="./demo/iola-demo.gif">
</p>

**Features:**

1. Read messages via rest api
2. Send messages via rest api
3. Log all socket events in console

**Roadmap**:
- [x] Detailed documentation
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

### CLI

<pre>
$ iola --help

<b>iola</b> - a socket client with rest api

Usage: iola [options] [command]

Options:
  --version                      Display version
  --help                         Display help

Commands:
  websocket [options] &lt;address>  Run websocket client
  help [command]                 Display help for command

API:
  GET  /messages                 Get message list
  GET  /messages/{id}            Get message by id
  POST /messages                 Send message 
  GET  /docs                     Get api documentation
</pre>

#### WebSocket

```text
$ iola help websocket
 
Usage: iola websocket [options] <address>

Run websocket client

Options:
  -ap, --api-port <port>          Set api port (default: "3000")
  -ah, --api-host <host>          Set api host (default: "127.0.0.1")
  -rt, --reply-timeout <timeout>  Set reply timeout in ms (default: "2000")
  -ne, --no-emoji                 Disable emoji
  -h, --help                      Display help

Examples: 
  iola websocket ws://127.0.0.1:8080 
  iola websocket ws://127.0.0.1:8080 --reply-timeout 3000 --no-emoji
```

### Rest API

#### Swagger

<p align="center">
  <img src="./docs/swagger.png">
</p>

<details>
  <summary>get message</summary>
  <p align="center">
    <br>
    <img src="./docs/get-message.png">
  </p>
</details>

<details>
  <summary>get message list</summary>
  <p align="center">
    <br>
    <img src="./docs/get-message-list.png">
  </p>
</details>


<details>
  <summary>send any data</summary>
  <p align="center">
    <br>
    <img src="./docs/send-any-data.png">
  </p>
</details>

<details>
  <summary>send binary data (uint8 array)</summary>
  <p align="center">
    <br>
    <img src="./docs/send-bytes.png">
  </p>
</details>

#### Server reply

<details>
  <summary>websocket</summary>
  <br>
  <p>You can pass the RequestId to the request with json data
     in order to await the server reply with such RequestId in the reply data.
  </p>
  <p align="center">
    <br>
    <img src="./docs/send-data-with-requsetid.png">
  </p>
  <p>RequestId field can be one of the following:
    <ul>
      <li><code>requestId</code></li>
      <li><code>request_id</code></li>
      <li><code>reqId</code></li>
      <li><code>req_id</code></li>
      <li><code>traceId</code></li>
      <li><code>trace_id</code></li>
    </ul>
  </p>
</details>

  
## License

This project is licensed under the [MIT License](https://github.com/pvarentsov/iola/blob/main/LICENSE).

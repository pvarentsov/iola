# iola

[![License: MIT](https://img.shields.io/github/license/pvarentsov/iola)](https://github.com/pvarentsov/iola/blob/main/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/iola.svg)](https://www.npmjs.com/package/iola)

## Table of contents

<!-- toc -->
- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
  * [CLI](#cLI)
    * [WebSocket](#websocket)
  * [Rest API](#rest-api)
    * [Get swagger documentation](#get-swagger-documentation)
    * [Get message by id](#get-message-by-id)
    * [Get message list](#get-message-list)
    * [Send message](#send-message)
- [License](#License)
<!-- tocstop -->

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

#### Get message

<details>
  <summary>screen</summary>
  <p align="center">
    <img src="./docs/get-message.png">
  </p>
</details>

#### Get message list

<details>
  <summary>screen</summary>
  <p align="center">
    <img src="./docs/get-message-list.png">
  </p>
</details>

#### Send message

* Any data
  <details>
    <summary>screen</summary>
    <p align="center">
      <img src="./docs/send-any-data.png">
    </p>
  </details>

* Binary data (uint8 array) 

  <details>
    <summary>screen</summary>
    <p align="center">
      <img src="./docs/send-bytes.png">
    </p>
  </details>

#### Get server reply on message sending

* WebSocket

  * You can pass the RequestId to the request with json body
    in order to await the server reply with such RequestId in the body.
    
  * RequestId field can be one of the following:
     - `requestId`
     - `request_id`
     - `reqId`
     - `req_id`
     - `traceId`
     - `trace_id`
  
  * <details>
      <summary>screen</summary>
      <p align="center">
        <img src="./docs/send-data-with-requsetid.png">
      </p>
    </details>
  
## License

This project is licensed under the [MIT License](https://github.com/pvarentsov/iola/blob/main/LICENSE).

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

#### Get swagger documentation

* ```shell
  curl --request GET \
    --url http://localhost:3000/docs \
    --header 'Content-Type: text/html'
  ```

#### Get message by id

* ```shell
  curl --request GET \
    --url http://localhost:3000/messages/1 \
    --header 'Content-Type: application/json'
  ```

* ```shell
  curl --request GET \
    --url http://localhost:3000/messages/00001 \
    --header 'Content-Type: application/json'
  ```

#### Get message list

* Without filters
  
  ```shell
  curl --request GET \
    --url http://localhost:3000/messages \
    --header 'Content-Type: application/json'
  ```
* Filter: "type" (`SentMessage`,`ReceivedMessage`,`Connected`,`Reconnecting`,`Closed`,`Error`)

  ```shell
  curl --request GET \
    --url 'http://localhost:3000/messages?type=ReceivedMessage' \
    --header 'Content-Type: application/json'
  ```

#### Send message

* Any data: Json
  ```shell
  curl --request POST \
    --url http://localhost:3000/messages \
    --header 'Content-Type: application/json' \
    --data '{
        "data": {
          "event": "greeting",
          "data": "Hi, Server!"
        }
      }'
  ``` 
* Any data: Json with RequestId (only for websocket client)

  ```shell
  # You can pass the RequestId to the request with json body
  # in order to await the server reply with such RequestId in the body.
  #
  # RequestId field can be one of the following: 
  #   - requestId
  #   - request_id
  #   - reqId
  #   - req_id
  #   - traceId
  #   - trace_id
  #
  # Default reply timeout - 2000ms. 
  # To change it need to set "--reply-timeout <timeout>" cli option.
  
  curl --request POST \
    --url http://localhost:3000/messages \
    --header 'Content-Type: application/json' \
    --data '{
        "data": {
          "requestId": "ff18493d-ec93-4fec-a668-fb35a9ecbbcf",
          "data": "Hello!"
        }
      }'
  
  curl --request POST \
    --url http://localhost:3000/messages \
    --header 'Content-Type: application/json' \
    --data '{
        "data": {
          "traceId": "7a1c9088-726c-4a71-b2db-b4ba019054f7",
          "data": "Hello!"
        }
      }'  
  ``` 

* Any data: Text
  
  ```shell
  curl --request POST \
    --url http://localhost:3000/messages \
    --header 'Content-Type: application/json' \
    --data '{
        "data": "Hello!"
      }'
  ```
* Binary data (uint8 array) 
  
  ```shell
  curl --request POST \
    --url http://localhost:3000/messages \
    --header 'Content-Type: application/json' \
    --data '{
        "bytes": [72, 101, 108, 108, 111, 33]
      }'
  ```
  
## License

This project is licensed under the [MIT License](https://github.com/pvarentsov/iola/blob/main/LICENSE).

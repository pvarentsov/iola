export enum SocketType {
  WebSocket = 'websocket',
  SocketIO = 'socket.io',
  Tcp = 'tcp',
  Unix = 'unix',
}

export enum SocketEventType {
  SentMessage = 'SentMessage',
  ReceivedMessage = 'ReceivedMessage',
  Connected = 'Connected',
  Reconnecting = 'Reconnecting',
  Closed = 'Closed',
  Error = 'Error',
}

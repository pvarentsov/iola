export enum SocketType {
  WebSocket = 'websocket',
  SocketIO = 'socketio',
  Tcp = 'tcp',
  Unix = 'unix',
}

export enum SocketEventType {
  SentMessage = 'SentMessage',
  ReceivedMessage = 'ReceivedMessage',
  Connected = 'Connected',
  Closed = 'Closed',
  Error = 'Error',
}

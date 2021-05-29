export enum SocketType {
  WebSocket = 'WebSocket',
  SocketIO = 'SocketIO',
  Tcp = 'Tcp',
  Unix = 'Unix',
}

export enum SocketEventType {
  SentMessage = 'SentMessage',
  ReceivedMessage = 'ReceivedMessage',
  Connected = 'Connected',
  Closed = 'Closed',
  Error = 'Error',
}
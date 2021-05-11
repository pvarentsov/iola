export interface ISocket {
  connect(): void;
  send(): void;
  read(): void;
}
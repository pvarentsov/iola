export interface IHttpServer {
  listen(host: string, port: number): Promise<string>
  engine<T = any>(): T
}

export interface IHttpRouter {
  init(): Promise<void>
}

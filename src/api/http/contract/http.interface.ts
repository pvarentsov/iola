export interface IHttpServer {
  listen(host: string, port: number): Promise<string>
}

export interface IHttpRouter {
  init(): Promise<void>
}

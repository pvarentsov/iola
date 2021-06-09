export interface IHttpServer {
  listen(port: number): Promise<void>
}

export interface IHttpRouter {
  init(): Promise<void>
}

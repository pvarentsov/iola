// import { FastifyInstance } from 'fastify'
//
// import { IHttpRouter, IHttpServer } from '@iola/api/http'
// import { ISocketClient } from '@iola/core/socket'
//
// export class HttpServer implements IHttpServer {
//   private readonly adapter: FastifyInstance
//   private readonly router: IHttpRouter
//   private readonly client: ISocketClient
//
//   constructor(adapter: FastifyInstance, router: IHttpRouter, client: ISocketClient) {
//     this.adapter = adapter
//     this.router = router
//     this.client = client
//   }
//
//   async listen(host: string, port: number): Promise<string> {
//     await this
//       .router
//       .init()
//
//     return this
//       .adapter
//       .listen({host, port})
//   }
// }

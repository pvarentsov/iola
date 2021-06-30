import { IHttpServer } from '@iola/api/http'
import { HttpModule } from '@iola/api/http/nest/http.module'
import { ISocketClient } from '@iola/core/socket'
import { NestFactory } from '@nestjs/core'

export class HttpServer implements IHttpServer {
  constructor(private readonly client: ISocketClient) {}

  async listen(host: string, port: number): Promise<string> {
    const app = await NestFactory.create(HttpModule.forRoot(this.client), {logger: false})
    await app.listen(port, host)

    return app.getUrl()
  }
}

import { IHttpServer } from '@iola/api/http'
import { HttpModule } from '@iola/api/http/nest/http.module'
import { ISocketClient } from '@iola/core/socket'
import { INestApplication } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

export class HttpServer implements IHttpServer {
  constructor(private readonly client: ISocketClient) {}

  async listen(host: string, port: number): Promise<string> {
    const app = await this.init()
    await app.listen(port, host)

    return app.getUrl()
  }

  private async init(): Promise<INestApplication> {
    const app = await NestFactory
      .create(HttpModule.forRoot(this.client))

    const swaggerConfig = new DocumentBuilder()
      .setTitle('iola')
      .setDescription('OpenAPI documentation for iola client')
      .setVersion('1.0.0')
      .build()

    const swaggerDocument = SwaggerModule
      .createDocument(app, swaggerConfig)

    SwaggerModule
      .setup('docs', app, swaggerDocument)

    return app
  }
}

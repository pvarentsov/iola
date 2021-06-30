import { DynamicModule } from '@nestjs/common'

import { HttpController } from '@iola/api/http/nest/http.controller'
import { ISocketClient } from '@iola/core/socket'

export class HttpModule {
  static forRoot(client: ISocketClient): DynamicModule {
    return {
      module: HttpModule,
      providers: [
        {
          provide: 'SOCKET_CLIENT',
          useValue: client,
        }
      ],
      controllers: [
        HttpController,
      ],
    }
  }
}

import 'module-alias/register'

import { TestUtil } from '@iola/test/util/test.util'
import { NetServer } from '@iola/test/server/net.server'

(async (): Promise<void> => {
  const port = await TestUtil.findFreePort()
  const tcp = new NetServer()

  tcp.start(port)

  console.log('TCP server running on 127.0.0.1:' + port)
})()
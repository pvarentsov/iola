import 'module-alias/register'

import { TestUtil } from '@iola/test/util/test.util'
import { IOServer } from '@iola/test/server/io.server'

(async (): Promise<void> => {
  const port = await TestUtil.findFreePort()
  const io = new IOServer()

  io.start(port)

  console.log('IO server running on http://127.0.0.1:' + port)
})()
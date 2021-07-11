import { BinaryEncoding, Optional } from '@iola/core/common'
import { SocketType } from '@iola/core/socket'

export type CliConfig = {
  apiPort: number
  apiHost: string
  socketType: SocketType
  socketAddress: string
  binaryEncoding: Optional<BinaryEncoding>
  emoji: boolean
  connectionTimeout: number
  reconnectionInterval: number
  replyTimeout: number
}

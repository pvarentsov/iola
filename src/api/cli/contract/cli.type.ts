import { BinaryEncoding } from '@iola/core/common'
import { SocketType } from '@iola/core/socket'

export type CliConfig = {
  apiPort: number
  apiHost: string
  socketType: SocketType
  socketAddress: string
  emoji: boolean
  connectionTimeout: number
  reconnectionInterval: number
  replyTimeout?: number
  binaryEncoding?: BinaryEncoding
}

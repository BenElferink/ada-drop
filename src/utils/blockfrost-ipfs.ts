import { BLOCKFROST_IPFS_API_KEY } from '@/constants'
import { BlockFrostIPFS } from '@blockfrost/blockfrost-js'

const blockfrostIpfs = new BlockFrostIPFS({
  projectId: BLOCKFROST_IPFS_API_KEY,
})

export default blockfrostIpfs

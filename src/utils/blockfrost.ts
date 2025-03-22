import { BLOCKFROST_API_KEY } from '@/constants'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'

const blockfrost = new BlockFrostAPI({
  projectId: BLOCKFROST_API_KEY,
  network: 'mainnet',
})

export default blockfrost

import { ADA } from './common'
import { deepClone } from '@odigos/ui-kit/functions'
import { AirdropMethodType, type AirdropSettings, type PopulatedToken } from '@/@types'

export const POPULATED_LOVELACE: PopulatedToken = {
  tokenId: 'lovelace',
  fingerprint: 'lovelace',
  policyId: 'lovelace',
  isFungible: true,
  mintTransactionId: '',
  tokenName: {
    onChain: 'lovelace',
    ticker: 'ADA',
    display: 'ADA',
  },
  tokenAmount: {
    onChain: 0,
    display: 0,
    decimals: ADA['DECIMALS'],
  },
  image: {
    ipfs: '',
    url: 'https://labs.badfoxmc.com/media/ada.png',
  },
  files: [],
  attributes: {},
}

export const INIT_TRAIT_POINTS = {
  category: '',
  trait: '',
  amount: 0,
}
export const INIT_RANK_POINTS = {
  minRange: 0,
  maxRange: 0,
  amount: 0,
}
export const INIT_WHALE_POINTS = {
  shouldStack: false,
  groupSize: 0,
  amount: 0,
}
export const INIT_POLICY_SETTINGS = {
  policyId: '',
  weight: 1,
  withTraits: false,
  traitOptions: [deepClone(INIT_TRAIT_POINTS)],
  withRanks: false,
  rankOptions: [deepClone(INIT_RANK_POINTS)],
  withWhales: false,
  whaleOptions: [deepClone(INIT_WHALE_POINTS)],
}

export const INIT_AIRDROP_SETTINGS: AirdropSettings = {
  airdropMethod: AirdropMethodType.EMPTY,

  tokenId: '',
  tokenName: {
    onChain: '',
    display: '',
    ticker: '',
  },
  tokenAmount: {
    onChain: 0,
    display: 0,
    decimals: 0,
  },
  thumb: '',

  policies: [],
  stakePools: [],

  blacklistWallets: [],
  blacklistTokens: [],
}

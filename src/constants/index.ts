import type { PopulatedToken } from '@/@types'

export const API_KEYS = {
  BLOCKFROST_API_KEY: process.env.BLOCKFROST_API_KEY || '',

  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
}

export const ADA = {
  SYMBOL: '₳',
  DECIMALS: 6,
}

export const WALLETS = {
  STAKE_KEYS: {
    DEV: 'stake1u80fcwkvn0cdy2zn8hlw7vf4v4sq4q23khj4z39wtvflr5cmyn8n7',
  },
  ADDRESSES: {
    DEV: 'addr1q9knw3lmvlpsvemjpgmkqkwtkzv8wueggf9aavvzyt2akpw7nsavexls6g59x007aucn2etqp2q4rd0929z2ukcn78fslm56p9',
  },
  KEYS: {
    // MNEMONIC: Array.isArray(process.env.MNEMONIC) ? process.env.MNEMONIC : process.env.MNEMONIC?.split(',') || [],
  },
}

export const TITLE = `${ADA.SYMBOL}D${ADA.SYMBOL} Drop`
export const LIGHT_ADA_COLOR = '#3cc8c8'

// https://github.com/BenElferink/badfoxmc-labs/commit/afc5eebbf9fb0c01445e5a701c0a6828f44523b6
export const DATA_START_TIME = 1739611211000
export const HISTORIC_DATA_MESSAGES = {
  TITLE: `Historic data (prior to ${new Date(DATA_START_TIME).toLocaleDateString('en-US')})`,
  DESCRIPTION:
    'Some historic data may have missing or innacurate data displayed. This however does not affect the processing of the airdrop, only the visual representation.',
  MISSING_DATA: 'Missing data for historic airdrop',
  INNACURATE_DATA: 'Innacurate data for historic airdrop',
}

export const LINKS = {
  GET_WALLET: 'https://builtoncardano.com/ecosystem/wallets',
}

export const ERROR_TYPES = {
  INVALID_WALLET_IDENTIFIER: 'INVALID_WALLET_IDENTIFIER',
}

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

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

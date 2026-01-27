export const ADA = {
  SYMBOL: '₳',
  DECIMALS: 6,
  THUMB: 'https://adadrop.app/assets/ada.png',
}

export const MIN_LOVELACES_PER_WALLET = 1000000
export const MIN_ADA_PER_WALLET = 1
export const MIN_LOVELACES_PER_UTXO = 1200000
export const MIN_ADA_PER_UTXO = 1.2

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
  GET_WALLET: 'https://www.cardanocube.com/categories/wallets',
}

export const ERROR_TYPES = {
  INVALID_WALLET_IDENTIFIER: 'INVALID_WALLET_IDENTIFIER',
}

export const POLICY_IDS = {
  ADA_HANDLE: 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a',
  BAD_KEY: '80e3ccc66f4dfeff6bc7d906eb166a984a1fc6d314e33721ad6add14',
}

export const WALLETS = {
  STAKE_KEYS: {
    DEV: 'stake1u9ew2ha4cs9v9eaqq6g2j2w0hyhut0qshafcum0cm4p4qdgh5ce76',
  },
  ADDRESSES: {
    DEV: 'addr1q9ew2ha4cs9v9eaqq6g2j2w0hyhut0qshafcum0cm4p4qdtju40mt3q2ctn6qp5s4y5ulwf0ck7pp06n3ekl3h2r2q6sljmdts',
  },
  KEYS: {
    // MNEMONIC: Array.isArray(process.env.MNEMONIC) ? process.env.MNEMONIC : process.env.MNEMONIC?.split(',') || [],
  },
}

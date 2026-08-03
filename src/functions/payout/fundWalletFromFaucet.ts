import { BlockfrostProvider, MeshWallet } from '@meshsdk/core'
import { sleep } from '@/functions/sleep'

/** Public community preprod faucet key (also used by SPO tooling); override via env if rotated. */
export const DEFAULT_PREPROD_FAUCET_API_KEY = 'ooseiteiquo7Wie9oochooyiequi4ooc'
export const PREPROD_FAUCET_SEND_MONEY_URL = 'https://faucet.preprod.world.dev.cardano.org/send-money'

export type FundedTestnetWallet = {
  wallet: MeshWallet
  address: string
  mnemonic: string[]
  lovelace: number
  faucetResponse: unknown
}

export type CreateFundedPreprodWalletOptions = {
  blockfrostProjectId: string
  /** Minimum lovelace required before continuing (default 20 ADA). */
  minLovelace?: number
  faucetApiKey?: string
  balancePollIntervalMs?: number
  balanceTimeoutMs?: number
}

/**
 * Brew a one-off MeshWallet, request tADA from the preprod faucet, and wait until
 * Blockfrost reports a sufficient balance.
 */
export const createFundedPreprodWallet = async (
  options: CreateFundedPreprodWalletOptions
): Promise<FundedTestnetWallet> => {
  const {
    blockfrostProjectId,
    minLovelace = 20_000_000,
    faucetApiKey = process.env.CARDANO_PREPROD_FAUCET_API_KEY || DEFAULT_PREPROD_FAUCET_API_KEY,
    balancePollIntervalMs = 5_000,
    balanceTimeoutMs = 300_000,
  } = options

  const mnemonic = MeshWallet.brew() as string[]
  const provider = new BlockfrostProvider(blockfrostProjectId)
  const wallet = new MeshWallet({
    networkId: 0,
    fetcher: provider,
    submitter: provider,
    key: { type: 'mnemonic', words: mnemonic },
  })
  await wallet.init()

  const address = await wallet.getChangeAddress()
  const faucetResponse = await requestPreprodFaucetFunds(address, faucetApiKey)

  const lovelace = await waitForWalletLovelace(wallet, minLovelace, {
    pollIntervalMs: balancePollIntervalMs,
    timeoutMs: balanceTimeoutMs,
    address,
  })

  return { wallet, address, mnemonic, lovelace, faucetResponse }
}

export const requestPreprodFaucetFunds = async (address: string, apiKey: string): Promise<unknown> => {
  const url = `${PREPROD_FAUCET_SEND_MONEY_URL}/${encodeURIComponent(address)}?api_key=${encodeURIComponent(apiKey)}`
  const res = await fetch(url, { method: 'POST' })
  const text = await res.text()

  let body: unknown = text
  try {
    body = JSON.parse(text)
  } catch {
    // non-JSON body is fine; surface as text
  }

  if (!res.ok) {
    throw new Error(`Preprod faucet request failed (${res.status}): ${typeof body === 'string' ? body : JSON.stringify(body)}`)
  }

  // Some faucet errors still return HTTP 200 with an error payload
  if (body && typeof body === 'object' && 'error' in (body as object)) {
    throw new Error(`Preprod faucet error: ${JSON.stringify(body)}`)
  }

  return body
}

export const waitForWalletLovelace = async (
  wallet: MeshWallet,
  minLovelace: number,
  opts: { pollIntervalMs: number; timeoutMs: number; address: string }
): Promise<number> => {
  const started = Date.now()
  let last = 0

  while (Date.now() - started < opts.timeoutMs) {
    const balance = await wallet.getBalance()
    last = Number(balance.find((a) => a.unit === 'lovelace')?.quantity || 0)
    if (last >= minLovelace) return last
    await sleep(opts.pollIntervalMs)
  }

  throw new Error(
    `Timed out waiting for faucet funds on ${opts.address} (have ${last} lovelace, need ≥ ${minLovelace})`
  )
}

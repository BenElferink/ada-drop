# Payout CI (Cardano preprod)

Live regression coverage for the batched TX builder used by ADA Drop payouts.

## What runs where

| Workflow | Trigger | What it proves |
|---|---|---|
| `.github/workflows/ci.yml` | PR / push to `main` | Batching, size-retry (`0.decimals`), duplicate-pay guard, `ended` — no chain |
| `.github/workflows/payout-testnet.yml` | Monthly (1st) + manual | Brews a throwaway wallet, faucets tADA, then ≥2 chained signed+submitted+confirmed TXs on **preprod** |

## GitHub secrets

| Secret | Required? | Description |
|---|---|---|
| `BLOCKFROST_API_KEY_PREPROD` | **Yes** | Blockfrost project ID for **preprod** (starts with `preprod…`) |
| `CARDANO_PREPROD_FAUCET_API_KEY` | No | Override if the public community faucet key rotates |

No long-lived test mnemonic is required. Each run:

1. `MeshWallet.brew()` → fresh wallet
2. POST preprod faucet `/send-money/<address>`
3. Poll Blockfrost until balance ≥ 20 ADA
4. Run chained payout assertions

## One-time setup

1. Create a Blockfrost project on **preprod**: https://blockfrost.io
2. Add `BLOCKFROST_API_KEY_PREPROD` as a repository secret
3. Run **Actions → Payout testnet → Run workflow**

Faucet docs: https://docs.cardano.org/cardano-testnets/tools/faucet/

## Local commands

```bash
# Unit only (no secrets)
npm test

# Live preprod (skips if BLOCKFROST_API_KEY_PREPROD unset;
# set REQUIRE_TESTNET_SECRETS=1 to fail instead)
export BLOCKFROST_API_KEY_PREPROD="preprod..."
npm run test:payout:testnet
```

## Notes

- The live test forces `batchSize: 2` with 5 recipients → **3 chained TXs**.
- Service fee (`devFee`) is disabled in CI so mainnet DEV addresses are never used on preprod.
- Faucet rate limits exist — monthly schedule keeps load light; manual re-runs may need to wait if limited.
- Production UI and CI share [`src/functions/payout/runBatchedPayout.ts`](../src/functions/payout/runBatchedPayout.ts).

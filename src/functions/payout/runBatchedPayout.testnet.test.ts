import { describe, expect, it } from "vitest";
import { MeshWallet } from "@meshsdk/core";
import type { PayoutRecipient } from "@/@types";
import { runBatchedPayout } from "./runBatchedPayout";
import { confirmTxOnBlockfrost } from "./confirmTxOnBlockfrost";
import { createFundedPreprodWallet } from "./fundWalletFromFaucet";

const BLOCKFROST_KEY = process.env.BLOCKFROST_API_KEY_PREPROD;
const REQUIRE_SECRETS = process.env.REQUIRE_TESTNET_SECRETS === "1";
const hasSecrets = Boolean(BLOCKFROST_KEY);

if (REQUIRE_SECRETS && !hasSecrets) {
  throw new Error(
    "REQUIRE_TESTNET_SECRETS=1 but BLOCKFROST_API_KEY_PREPROD is missing",
  );
}

describe.skipIf(!hasSecrets)("runBatchedPayout on Cardano preprod", () => {
  it("funds a throwaway wallet from the faucet, then completes ≥2 chained batched TXs", async () => {
    const { wallet, address, lovelace } = await createFundedPreprodWallet({
      blockfrostProjectId: BLOCKFROST_KEY as string,
      minLovelace: 20_000_000,
      balanceTimeoutMs: 300_000,
    });

    expect(lovelace).toBeGreaterThanOrEqual(20_000_000);
    console.log(
      `Funded throwaway preprod wallet ${address} with ${lovelace} lovelace`,
    );

    // Throwaway receive addresses (outputs only)
    const recipients: PayoutRecipient[] = [];
    for (let i = 0; i < 5; i += 1) {
      const wordsBrew = MeshWallet.brew() as string[];
      const recv = new MeshWallet({
        networkId: 0,
        key: { type: "mnemonic", words: wordsBrew },
      });
      await recv.init();
      recipients.push({
        stakeKey: `test_recipient_${i}`,
        address: await recv.getChangeAddress(),
        payout: 1_500_000,
      });
    }

    const submitted: string[] = [];

    const result = await runBatchedPayout({
      wallet: wallet as any,
      recipients,
      tokenId: "lovelace",
      batchSize: 2, // 5 recipients → 3 chained batches
      devFee: null,
      confirmTx: async (txHash) => {
        await confirmTxOnBlockfrost(txHash, {
          projectId: BLOCKFROST_KEY as string,
          network: "preprod",
          postConfirmDelayMs: 8_000,
          pollIntervalMs: 2_000,
          timeoutMs: 180_000,
        });
      },
      onBatchSubmitted: async ({ txHash }) => {
        submitted.push(txHash);
      },
    });

    expect(result.error).toBeUndefined();
    expect(result.ended).toBe(true);
    expect(result.txHashes.length).toBeGreaterThanOrEqual(2);
    expect(submitted.length).toBeGreaterThanOrEqual(2);
    expect(result.paidRecipients).toHaveLength(5);
    expect(result.recipients.every((r) => !!r.txHash)).toBe(true);

    const firstHash = result.txHashes[0];
    const { BlockFrostAPI } = await import("@blockfrost/blockfrost-js");
    const api = new BlockFrostAPI({
      projectId: BLOCKFROST_KEY as string,
      network: "preprod",
    });
    const utxos = await api.txsUtxos(firstHash);
    const payoutOutputs = utxos.outputs.filter((o) =>
      recipients.some(
        (r) =>
          r.address === o.address &&
          o.amount.some(
            (a) => a.unit === "lovelace" && a.quantity === "1500000",
          ),
      ),
    );
    expect(payoutOutputs.length).toBeGreaterThanOrEqual(1);
  });
});

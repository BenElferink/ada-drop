import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { sleep } from "@/functions/sleep";

export type ConfirmTxOnBlockfrostOptions = {
  projectId: string;
  network?: "mainnet" | "preprod" | "preview" | "sanchonet";
  /** Extra wait after the TX is seen in a block so the next chained TX can spend change. */
  postConfirmDelayMs?: number;
  pollIntervalMs?: number;
  timeoutMs?: number;
};

/**
 * Poll Blockfrost until the TX is in a block, then optionally wait before returning.
 * Used by CI / headless payouts; production UI may keep using the Next API wrapper.
 */
export const confirmTxOnBlockfrost = async (
  txHash: string,
  options: ConfirmTxOnBlockfrostOptions,
): Promise<void> => {
  const {
    projectId,
    network = "preprod",
    postConfirmDelayMs = 10_000,
    pollIntervalMs = 2_000,
    timeoutMs = 180_000,
  } = options;

  const api = new BlockFrostAPI({ projectId, network });
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const tx = await api.txs(txHash);
      if (tx.block) {
        if (postConfirmDelayMs > 0) await sleep(postConfirmDelayMs);
        return;
      }
    } catch (error: any) {
      const msg = error?.message || error?.toString() || "";
      // Blockfrost 404 while waiting for propagation
      if (!msg.includes("not been found") && !msg.includes("404")) {
        throw error;
      }
    }
    await sleep(pollIntervalMs);
  }

  throw new Error(`Timed out waiting for confirmation of ${txHash}`);
};

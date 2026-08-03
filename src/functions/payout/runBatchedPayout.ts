import { Transaction } from "@meshsdk/core";
import { MIN_LOVELACES_PER_WALLET } from "@/constants/common";
import type { PayoutRecipient, StakeKey } from "@/@types";
import type {
  PaidRecipient,
  RunBatchedPayoutParams,
  RunBatchedPayoutResult,
} from "./types";

export const DEFAULT_LOVELACE_BATCH_SIZE = 200;
export const DEFAULT_TOKEN_BATCH_SIZE = 50;

export const getUnpaidRecipients = (
  recipients: PayoutRecipient[],
  tokenId: string,
  paidStakeKeys: Set<StakeKey>,
): PayoutRecipient[] =>
  recipients.filter(({ txHash, stakeKey, payout }) => {
    if (txHash || paidStakeKeys.has(stakeKey)) return false;
    if (tokenId === "lovelace" && payout < MIN_LOVELACES_PER_WALLET)
      return false;
    return true;
  });

export const resolveBatchSize = (
  requested: number,
  unpaidCount: number,
  tokenId: string,
  prevDifference?: number,
): number => {
  let batchSize = requested;
  if (!batchSize) {
    if (prevDifference) {
      batchSize = Math.floor(prevDifference * unpaidCount);
    }
    if (!batchSize) {
      batchSize = Math.min(
        unpaidCount,
        tokenId === "lovelace"
          ? DEFAULT_LOVELACE_BATCH_SIZE
          : DEFAULT_TOKEN_BATCH_SIZE,
      );
    }
  }
  return batchSize;
};

export const splitIntoBatches = <T>(items: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    // Sensitive sizing formula — keep as-is (not `i + batchSize`)
    batches.push(items.slice(i, (i / batchSize + 1) * batchSize));
  }
  return batches;
};

const errMessage = (error: unknown): string => {
  const e = error as any;
  return e?.response?.data || e?.message || e?.toString() || "UNKNOWN ERROR";
};

/**
 * Headless batched airdrop payout: build → sign → submit → confirm, with size-retry
 * and duplicate-pay guards. Shared by the UI and CI.
 */
export const runBatchedPayout = async (
  params: RunBatchedPayoutParams,
): Promise<RunBatchedPayoutResult> => {
  const {
    wallet,
    recipients: initialRecipients,
    tokenId,
    confirmTx,
    onBatchSubmitted,
    onStatus,
    devFee = null,
  } = params;

  let recipients = initialRecipients.map((r) => ({ ...r }));
  const paidStakeKeys = params.paidStakeKeys
    ? new Set(params.paidStakeKeys)
    : new Set<StakeKey>();
  const paidRecipients: PaidRecipient[] = [...(params.paidRecipients || [])];
  const txHashes: string[] = [...new Set(paidRecipients.map((r) => r.txHash))];
  let devFeePaid = !!params.devFeePaid;

  const run = async (
    batchSizeInput: number = 0,
    prevDifference?: number,
  ): Promise<RunBatchedPayoutResult> => {
    const unpaid = getUnpaidRecipients(recipients, tokenId, paidStakeKeys);

    if (!unpaid.length) {
      return {
        ended: true,
        txHashes,
        recipients,
        paidRecipients,
        paidStakeKeys,
        devFeePaid,
      };
    }

    const batchSize = resolveBatchSize(
      batchSizeInput,
      unpaid.length,
      tokenId,
      prevDifference,
    );
    const batches = splitIntoBatches(unpaid, batchSize);

    if (!devFeePaid && devFee && batches.length) {
      batches[0].unshift({
        stakeKey: devFee.stakeKey,
        address: devFee.address,
        payout: devFee.lovelace,
        isDev: true,
      });
    }

    onStatus?.({
      title: "Batching transactions",
      message: `Trying batch size: ${batchSize}`,
      batchSize,
      batchCount: batches.length,
    });

    try {
      let batchIndex = 0;
      for await (const batch of batches) {
        const pendingBatch = batch.filter(
          ({ isDev, stakeKey }) => isDev || !paidStakeKeys.has(stakeKey),
        );
        if (!pendingBatch.length) continue;

        const tx = new Transaction({
          initiator: wallet as any,
        });

        for (const { address, payout, isDev } of pendingBatch) {
          if (tokenId === "lovelace" || isDev) {
            tx.sendLovelace({ address }, String(payout));
          } else {
            tx.sendAssets({ address }, [
              {
                unit: tokenId,
                quantity: String(payout),
              },
            ]);
          }
        }

        const unsignedTx = await tx.build();
        const signedTx = await wallet.signTx(unsignedTx);
        const txHash = await wallet.submitTx(signedTx);

        if (!devFeePaid && pendingBatch.some((r) => r.isDev)) devFeePaid = true;

        const batchPaid: PaidRecipient[] = [];
        for (const { stakeKey, payout, isDev } of pendingBatch) {
          if (isDev) continue;
          paidStakeKeys.add(stakeKey);
          const entry = { stakeKey, txHash, quantity: payout };
          paidRecipients.push(entry);
          batchPaid.push(entry);
        }
        if (!txHashes.includes(txHash)) txHashes.push(txHash);

        recipients = recipients.map((item) =>
          pendingBatch.some(({ stakeKey }) => stakeKey === item.stakeKey)
            ? { ...item, txHash }
            : item,
        );

        await onBatchSubmitted?.({
          txHash,
          batchRecipients: batchPaid,
          allPaidRecipients: [...paidRecipients],
          batchIndex,
          batchCount: batches.length,
        });

        await confirmTx(txHash);
        batchIndex += 1;
      }

      return {
        ended: true,
        txHashes,
        recipients,
        paidRecipients,
        paidStakeKeys,
        devFeePaid,
      };
    } catch (error) {
      const msg = errMessage(error);
      const nothingSubmittedYet = paidRecipients.length === 0;

      if (msg.indexOf("Maximum transaction size of") !== -1) {
        const splitMessage: string[] = msg.split(" ");
        const [max, curr] = splitMessage
          .map((str) => Number(str.replace(/[^\d]/g, "")))
          .filter((num) => num && !isNaN(num));
        const newDifference = (prevDifference || 1) * (max / curr);
        // Pass 0 so the next attempt recomputes floor(difference * currentUnpaid)
        return await run(0, newDifference);
      }

      if (batchSize > 1 && nothingSubmittedYet) {
        return await run(batchSize - 1, prevDifference);
      }

      const stillUnpaid = getUnpaidRecipients(
        recipients,
        tokenId,
        paidStakeKeys,
      ).length;
      return {
        ended: stillUnpaid === 0,
        txHashes,
        recipients,
        paidRecipients,
        paidStakeKeys,
        devFeePaid,
        error: msg,
      };
    }
  };

  return run(params.batchSize ?? 0, params.prevDifference);
};

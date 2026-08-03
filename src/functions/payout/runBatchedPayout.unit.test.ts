import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PayoutRecipient } from "@/@types";

const { buildState } = vi.hoisted(() => ({
  buildState: {
    maxOutputs: Number.POSITIVE_INFINITY as number,
    builds: [] as number[],
  },
}));

vi.mock("@meshsdk/core", () => ({
  Transaction: class MockTransaction {
    count = 0;
    sendLovelace() {
      this.count += 1;
      return this;
    }
    sendAssets() {
      this.count += 1;
      return this;
    }
    async build() {
      buildState.builds.push(this.count);
      if (this.count > buildState.maxOutputs) {
        throw new Error(
          "Maximum transaction size of 16384 exceeded. Found: 30000",
        );
      }
      return `unsigned-${this.count}`;
    }
  },
}));

import {
  getUnpaidRecipients,
  resolveBatchSize,
  runBatchedPayout,
  splitIntoBatches,
} from "./runBatchedPayout";

const makeRecipients = (n: number): PayoutRecipient[] =>
  Array.from({ length: n }, (_, i) => ({
    stakeKey: `stake_test1_recipient_${i}`,
    address: `addr_test1_recipient_${i}`,
    payout: 1_500_000,
  }));

const makeWallet = () => {
  let submitCount = 0;
  return {
    signTx: vi.fn(async (tx: string) => `signed:${tx}`),
    submitTx: vi.fn(async () => {
      submitCount += 1;
      return `txhash_${submitCount}`;
    }),
    getSubmitCount: () => submitCount,
  };
};

describe("batch sizing helpers", () => {
  it("keeps the sensitive slice formula", () => {
    const items = [0, 1, 2, 3, 4];
    expect(splitIntoBatches(items, 2)).toEqual([[0, 1], [2, 3], [4]]);
  });

  it("resolves batch size from fractional difference (0.decimals)", () => {
    expect(resolveBatchSize(0, 100, "lovelace", 0.5)).toBe(50);
    expect(resolveBatchSize(0, 100, "lovelace")).toBe(100); // capped by unpaid when < default 200
    expect(resolveBatchSize(0, 500, "lovelace")).toBe(200);
    expect(resolveBatchSize(0, 500, "token")).toBe(50);
  });

  it("excludes under-min lovelace and already-paid recipients", () => {
    const recipients: PayoutRecipient[] = [
      { stakeKey: "a", address: "addr_a", payout: 2_000_000 },
      { stakeKey: "b", address: "addr_b", payout: 500_000 },
      {
        stakeKey: "c",
        address: "addr_c",
        payout: 2_000_000,
        txHash: "already",
      },
      { stakeKey: "d", address: "addr_d", payout: 2_000_000 },
    ];
    const unpaid = getUnpaidRecipients(recipients, "lovelace", new Set(["d"]));
    expect(unpaid.map((r) => r.stakeKey)).toEqual(["a"]);
  });
});

describe("runBatchedPayout", () => {
  beforeEach(() => {
    buildState.maxOutputs = Number.POSITIVE_INFINITY;
    buildState.builds = [];
  });

  it("submits chained batches and ends when all are paid", async () => {
    const wallet = makeWallet();
    const recipients = makeRecipients(5);

    const result = await runBatchedPayout({
      wallet,
      recipients,
      tokenId: "lovelace",
      batchSize: 2,
      devFee: null,
      confirmTx: vi.fn(async () => undefined),
    });

    expect(result.error).toBeUndefined();
    expect(result.ended).toBe(true);
    expect(result.txHashes).toEqual(["txhash_1", "txhash_2", "txhash_3"]);
    expect(wallet.submitTx).toHaveBeenCalledTimes(3);
    expect(result.recipients.every((r) => !!r.txHash)).toBe(true);
    expect(result.paidRecipients).toHaveLength(5);
  });

  it("retries with fractional size shrink on Maximum transaction size errors", async () => {
    const wallet = makeWallet();
    const recipients = makeRecipients(10);
    // First attempt with default/full batch exceeds; after shrink, 5 fits
    buildState.maxOutputs = 5;

    const result = await runBatchedPayout({
      wallet,
      recipients,
      tokenId: "lovelace",
      batchSize: 10,
      devFee: null,
      confirmTx: vi.fn(async () => undefined),
    });

    expect(result.error).toBeUndefined();
    expect(result.ended).toBe(true);
    expect(buildState.builds[0]).toBe(10);
    expect(buildState.builds.some((n) => n <= 5)).toBe(true);
    expect(result.paidRecipients).toHaveLength(10);
  });

  it("does not rebuild already-paid recipients after a post-submit failure", async () => {
    const wallet = makeWallet();
    const recipients = makeRecipients(6);
    let confirms = 0;

    const result = await runBatchedPayout({
      wallet,
      recipients,
      tokenId: "lovelace",
      batchSize: 2,
      devFee: null,
      confirmTx: async () => {
        confirms += 1;
        // Fail while confirming the 2nd batch — 3rd batch must never be built
        if (confirms === 2) throw new Error("network blip");
      },
    });

    expect(result.error).toContain("network blip");
    expect(result.ended).toBe(false);
    expect(result.txHashes).toEqual(["txhash_1", "txhash_2"]);
    expect(result.paidRecipients).toHaveLength(4);
    expect(wallet.submitTx).toHaveBeenCalledTimes(2);

    // Resume must only pay the remaining 2 — never re-submit the first 4
    const resumeWallet = makeWallet();
    const resume = await runBatchedPayout({
      wallet: resumeWallet,
      recipients: result.recipients,
      tokenId: "lovelace",
      batchSize: 2,
      paidStakeKeys: result.paidStakeKeys,
      paidRecipients: result.paidRecipients,
      devFee: null,
      confirmTx: vi.fn(async () => undefined),
    });

    expect(resume.error).toBeUndefined();
    expect(resume.ended).toBe(true);
    expect(resumeWallet.submitTx).toHaveBeenCalledTimes(1);
    expect(resume.paidRecipients).toHaveLength(6);
  });

  it("includes optional dev fee only on the first batch", async () => {
    const wallet = makeWallet();
    const recipients = makeRecipients(3);

    await runBatchedPayout({
      wallet,
      recipients,
      tokenId: "lovelace",
      batchSize: 2,
      devFee: {
        address: "addr_dev",
        stakeKey: "stake_dev",
        lovelace: 1_000_000,
      },
      confirmTx: vi.fn(async () => undefined),
    });

    // First TX: 2 recipients + dev fee = 3 outputs; second: 1 recipient
    expect(buildState.builds).toEqual([3, 1]);
  });
});

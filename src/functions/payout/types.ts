import type { PayoutRecipient, StakeKey } from "@/@types";

/** Minimal wallet surface used by the payout builder (CIP-30 or MeshWallet). */
export type PayoutWallet = {
  signTx: (unsignedTx: string, partialSign?: boolean) => Promise<string>;
  submitTx: (tx: string) => Promise<string>;
  // Mesh Transaction initiator — kept loose so browser + MeshWallet both work
  [key: string]: unknown;
};

export type PaidRecipient = {
  stakeKey: StakeKey;
  txHash: string;
  quantity: number;
};

export type DevFee = {
  address: string;
  stakeKey: StakeKey;
  lovelace: number;
};

export type BatchSubmittedInfo = {
  txHash: string;
  batchRecipients: PaidRecipient[];
  allPaidRecipients: PaidRecipient[];
  batchIndex: number;
  batchCount: number;
};

export type RunBatchedPayoutParams = {
  wallet: PayoutWallet;
  recipients: PayoutRecipient[];
  tokenId: string;
  /** Absolute batch size. `0` = derive from prevDifference or default cap. */
  batchSize?: number;
  /** Fractional size scale (0.decimals) compounded across size-limit retries. */
  prevDifference?: number;
  /** Stake keys already submitted this run (resume / mid-retry). */
  paidStakeKeys?: Set<StakeKey>;
  /** Recipients already recorded as paid this run. */
  paidRecipients?: PaidRecipient[];
  /** Whether the service-fee output was already included in a submitted TX. */
  devFeePaid?: boolean;
  /** Service fee sink; omit/null to skip (e.g. testnet CI). */
  devFee?: DevFee | null;
  confirmTx: (txHash: string) => Promise<void>;
  onBatchSubmitted?: (info: BatchSubmittedInfo) => void | Promise<void>;
  onStatus?: (info: {
    title: string;
    message: string;
    batchSize: number;
    batchCount: number;
  }) => void;
};

export type RunBatchedPayoutResult = {
  ended: boolean;
  txHashes: string[];
  recipients: PayoutRecipient[];
  paidRecipients: PaidRecipient[];
  paidStakeKeys: Set<StakeKey>;
  devFeePaid: boolean;
  error?: string;
};

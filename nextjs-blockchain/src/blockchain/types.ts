export type BlockData = string;

export interface BlockSnapshot {
  readonly index: number;
  readonly data: BlockData;
  readonly hash: string;
  readonly previousHash: string;
  readonly timestamp: number;
}

export interface ChainValidationResult {
  readonly isValid: boolean;
  readonly brokenAtIndex: number | null;
}

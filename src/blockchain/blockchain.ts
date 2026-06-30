import { Block } from "./block";
import type { BlockData, BlockSnapshot, ChainValidationResult } from "./types";

const GENESIS_PREVIOUS_HASH = "0";
const GENESIS_DATA = "Genesis Block";

// Mutable internal representation — BlockSnapshot uses readonly, which prevents tamper/repair
// from mutating entries in place. Keep this type private to this module.
type MutableChainEntry = {
  id: string;
  index: number;
  data: string;
  hash: string;
  previousHash: string;
  timestamp: number;
};

export class Blockchain {
  private chain: MutableChainEntry[];

  private constructor(chain: MutableChainEntry[]) {
    this.chain = chain;
  }

  static async create(): Promise<Blockchain> {
    const genesisBlock = await Block.create(0, GENESIS_DATA, GENESIS_PREVIOUS_HASH);
    return new Blockchain([{ ...genesisBlock.toJSON() }]);
  }

  async addBlock(data: BlockData): Promise<BlockSnapshot[]> {
    const normalizedData = data.trim();

    if (!normalizedData) {
      return this.getChain();
    }

    const previousEntry = this.chain.at(-1);

    if (!previousEntry) {
      throw new Error("Cannot add a block before the genesis block exists.");
    }

    const nextBlock = await Block.create(
      this.chain.length,
      normalizedData,
      previousEntry.hash,
    );

    this.chain.push({ ...nextBlock.toJSON() });
    return this.getChain();
  }

  getChain(): BlockSnapshot[] {
    // Spread each entry so callers cannot mutate the internal chain through the snapshot reference
    return this.chain.map((entry) => ({ ...entry }));
  }

  async validate(): Promise<ChainValidationResult> {
    if (this.chain.length === 0) {
      return { isValid: true, brokenAtIndex: null };
    }

    const genesisExpected = await Block.calculateHash(this.chain[0]);
    if (this.chain[0].hash !== genesisExpected) {
      return { isValid: false, brokenAtIndex: 0 };
    }

    for (let index = 1; index < this.chain.length; index += 1) {
      const currentEntry = this.chain[index];
      const previousEntry = this.chain[index - 1];
      const recalculatedHash = await Block.calculateHash(currentEntry);

      if (
        currentEntry.hash !== recalculatedHash ||
        currentEntry.previousHash !== previousEntry.hash
      ) {
        return { isValid: false, brokenAtIndex: index };
      }
    }

    return { isValid: true, brokenAtIndex: null };
  }

  tamper(index: number, newData: string): BlockSnapshot[] {
    if (index < 0 || index >= this.chain.length) {
      throw new RangeError(`No block at index ${index}`);
    }
    // Leave hash stale intentionally — validate() will detect the mismatch
    this.chain[index].data = newData;
    return this.getChain();
  }

  async repair(fromIndex: number): Promise<BlockSnapshot[]> {
    if (fromIndex < 0 || fromIndex >= this.chain.length) {
      throw new RangeError(`No block at index ${fromIndex}`);
    }

    for (let i = fromIndex; i < this.chain.length; i += 1) {
      const entry = this.chain[i];
      // Update previousHash linkage before recalculating hash — order matters for the cascade
      if (i > 0) {
        entry.previousHash = this.chain[i - 1].hash;
      }
      entry.hash = await Block.calculateHash(entry);
    }

    return this.getChain();
  }

  async reset(): Promise<BlockSnapshot[]> {
    const genesis = await Block.create(0, GENESIS_DATA, GENESIS_PREVIOUS_HASH);
    this.chain = [{ ...genesis.toJSON() }];
    return this.getChain();
  }
}

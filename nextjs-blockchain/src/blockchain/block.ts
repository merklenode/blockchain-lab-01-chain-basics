import { sha256Hex } from "./hash";
import type { BlockData, BlockSnapshot } from "./types";

export class Block implements BlockSnapshot {
  readonly index: number;
  readonly data: BlockData;
  readonly hash: string;
  readonly previousHash: string;
  readonly timestamp: number;

  private constructor(snapshot: BlockSnapshot) {
    this.index = snapshot.index;
    this.data = snapshot.data;
    this.hash = snapshot.hash;
    this.previousHash = snapshot.previousHash;
    this.timestamp = snapshot.timestamp;
  }

  static async create(
    index: number,
    data: BlockData,
    previousHash: string,
    timestamp = Math.floor(Date.now() / 1000),
  ): Promise<Block> {
    const hash = await Block.calculateHash({
      index,
      data,
      previousHash,
      timestamp,
    });

    return new Block({ index, data, previousHash, timestamp, hash });
  }

  static async calculateHash(block: Omit<BlockSnapshot, "hash">): Promise<string> {
    return sha256Hex(
      `${block.index}${block.timestamp}${block.data}${block.previousHash}`,
    );
  }

  toJSON(): BlockSnapshot {
    return {
      index: this.index,
      data: this.data,
      hash: this.hash,
      previousHash: this.previousHash,
      timestamp: this.timestamp,
    };
  }
}

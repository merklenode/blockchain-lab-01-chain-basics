import { Block } from "./block";
import type { BlockData, BlockSnapshot, ChainValidationResult } from "./types";

const GENESIS_PREVIOUS_HASH = "0";
const GENESIS_DATA = "Genesis Block";

export class Blockchain {
  private readonly blocks: Block[];

  private constructor(blocks: Block[]) {
    this.blocks = blocks;
  }

  static async create(): Promise<Blockchain> {
    const genesisBlock = await Block.create(0, GENESIS_DATA, GENESIS_PREVIOUS_HASH);
    return new Blockchain([genesisBlock]);
  }

  async addBlock(data: BlockData): Promise<BlockSnapshot[]> {
    const normalizedData = data.trim();

    if (!normalizedData) {
      return this.getChain();
    }

    const previousBlock = this.blocks.at(-1);

    if (!previousBlock) {
      throw new Error("Cannot add a block before the genesis block exists.");
    }

    const nextBlock = await Block.create(
      this.blocks.length,
      normalizedData,
      previousBlock.hash,
    );

    this.blocks.push(nextBlock);
    return this.getChain();
  }

  getChain(): BlockSnapshot[] {
    return this.blocks.map((block) => block.toJSON());
  }

  async validate(): Promise<ChainValidationResult> {
    for (let index = 1; index < this.blocks.length; index += 1) {
      const currentBlock = this.blocks[index];
      const previousBlock = this.blocks[index - 1];
      const recalculatedHash = await Block.calculateHash(currentBlock);

      if (
        currentBlock.hash !== recalculatedHash ||
        currentBlock.previousHash !== previousBlock.hash
      ) {
        return { isValid: false, brokenAtIndex: index };
      }
    }

    return { isValid: true, brokenAtIndex: null };
  }
}

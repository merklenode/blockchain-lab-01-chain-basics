import { beforeEach, describe, expect, it } from "vitest";
import { Block } from "../block";
import { Blockchain } from "../blockchain";

describe("Block.calculateHash", () => {
  it("is deterministic — same input produces identical hex strings", async () => {
    const input = { id: "x", index: 0, data: "hello", previousHash: "0", timestamp: 1000 };
    const h1 = await Block.calculateHash(input);
    const h2 = await Block.calculateHash(input);
    expect(h1).toBe(h2);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("delimiter prevents hash collisions between fields that would otherwise overlap", async () => {
    // Without | separators: index=1, ts=0, data="ab", prev="0"  →  "10ab0"
    //                        index=10, ts=0, data="a", prev="b0" →  "10ab0"  (identical!)
    // With | separators the strings are distinct: "1|0|ab|0" vs "10|0|a|b0"
    const a = { id: "x", index: 1, timestamp: 0, data: "ab", previousHash: "0" };
    const b = { id: "x", index: 10, timestamp: 0, data: "a", previousHash: "b0" };
    expect(await Block.calculateHash(a)).not.toBe(await Block.calculateHash(b));
  });
});

describe("Block.create", () => {
  it("assigns a stable, truthy id", async () => {
    const block = await Block.create(0, "data", "0");
    expect(block.id).toBeTruthy();
    expect(typeof block.id).toBe("string");
  });

  it("links previousHash to the value passed", async () => {
    const prevHash = "abc123";
    const block = await Block.create(1, "data", prevHash);
    expect(block.previousHash).toBe(prevHash);
  });
});

describe("Blockchain", () => {
  let bc: Blockchain;

  beforeEach(async () => {
    bc = await Blockchain.create();
  });

  it("addBlock with empty string leaves chain length unchanged", async () => {
    await bc.addBlock("");
    expect(bc.getChain()).toHaveLength(1);
  });

  it("addBlock links new block's previousHash to the prior block's hash", async () => {
    await bc.addBlock("tx");
    const chain = bc.getChain();
    expect(chain).toHaveLength(2);
    expect(chain[1].previousHash).toBe(chain[0].hash);
  });

  it("validate returns valid for a clean 3-block chain", async () => {
    await bc.addBlock("block 1");
    await bc.addBlock("block 2");
    const result = await bc.validate();
    expect(result).toEqual({ isValid: true, brokenAtIndex: null });
  });

  it("tamper(1) then validate detects break at block 1", async () => {
    await bc.addBlock("original");
    bc.tamper(1, "evil");
    const result = await bc.validate();
    expect(result).toEqual({ isValid: false, brokenAtIndex: 1 });
  });

  it("tamper(0) then validate detects break at genesis block (block 0)", async () => {
    bc.tamper(0, "evil genesis");
    const result = await bc.validate();
    expect(result).toEqual({ isValid: false, brokenAtIndex: 0 });
  });

  it("repair(1) after tamper(1) restores chain validity", async () => {
    await bc.addBlock("original");
    bc.tamper(1, "evil");
    await bc.repair(1);
    const result = await bc.validate();
    expect(result).toEqual({ isValid: true, brokenAtIndex: null });
  });

  it("block id is stable across repair — only hash and previousHash change", async () => {
    await bc.addBlock("block 1");
    const idBefore = bc.getChain()[1].id;
    bc.tamper(1, "evil");
    await bc.repair(1);
    const idAfter = bc.getChain()[1].id;
    expect(idAfter).toBe(idBefore);
  });

  it("reset returns a single genesis block", async () => {
    await bc.addBlock("block 1");
    await bc.addBlock("block 2");
    const chain = await bc.reset();
    expect(chain).toHaveLength(1);
    expect(chain[0].index).toBe(0);
    expect(chain[0].previousHash).toBe("0");
  });

  it("repair cascades hash updates to all downstream blocks", async () => {
    await bc.addBlock("b1");
    await bc.addBlock("b2");
    const hashB2Before = bc.getChain()[2].hash;
    bc.tamper(1, "evil");
    await bc.repair(1);
    const chain = bc.getChain();
    // b2's hash must change because its previousHash link changed
    expect(chain[2].hash).not.toBe(hashB2Before);
    // and the chain must be valid end-to-end
    expect(await bc.validate()).toEqual({ isValid: true, brokenAtIndex: null });
  });
});

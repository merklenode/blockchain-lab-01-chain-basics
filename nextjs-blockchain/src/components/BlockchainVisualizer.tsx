"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Blockchain, type BlockSnapshot } from "@/src/blockchain";

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(timestamp * 1000));
}

function shortHash(hash: string): string {
  if (hash.length <= 18) {
    return hash;
  }

  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export default function BlockchainVisualizer() {
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [chain, setChain] = useState<BlockSnapshot[]>([]);
  const [inputData, setInputData] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [brokenAtIndex, setBrokenAtIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const chainSizeLabel = useMemo(() => {
    const suffix = chain.length === 1 ? "block" : "blocks";
    return `${chain.length} ${suffix}`;
  }, [chain.length]);

  const syncChain = useCallback(async (nextBlockchain: Blockchain) => {
    const validation = await nextBlockchain.validate();

    setChain(nextBlockchain.getChain());
    setIsValid(validation.isValid);
    setBrokenAtIndex(validation.brokenAtIndex);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeBlockchain() {
      try {
        const nextBlockchain = await Blockchain.create();

        if (!isMounted) {
          return;
        }

        setBlockchain(nextBlockchain);
        await syncChain(nextBlockchain);
        setIsReady(true);
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to initialize blockchain.",
        );
      }
    }

    void initializeBlockchain();

    return () => {
      isMounted = false;
    };
  }, [syncChain]);

  async function handleAddBlock() {
    if (!blockchain || !inputData.trim()) {
      return;
    }

    setIsMining(true);
    setError(null);

    try {
      await blockchain.addBlock(inputData);
      setInputData("");
      await syncChain(blockchain);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to add block.",
      );
    } finally {
      setIsMining(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#111827]">
      <section className="border-b border-[#d9dee7] bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#5b6b7f]">
                TypeScript blockchain prototype
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-5xl">
                Blockchain Visualizer
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-md border border-[#d9dee7] bg-[#f9fafb] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#697789]">
                  Ledger
                </p>
                <p className="mt-1 font-mono text-sm font-semibold">
                  {chainSizeLabel}
                </p>
              </div>
              <div className="rounded-md border border-[#d9dee7] bg-[#f9fafb] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#697789]">
                  Integrity
                </p>
                <p
                  className={`mt-1 font-mono text-sm font-semibold ${
                    isValid ? "text-[#1d7f4f]" : "text-[#b42318]"
                  }`}
                >
                  {isValid ? "valid" : `broken at #${brokenAtIndex}`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="min-h-12 flex-1 rounded-md border border-[#cbd5e1] bg-white px-4 text-base outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#dbeafe]"
              disabled={!isReady || isMining}
              onChange={(event) => setInputData(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void handleAddBlock();
                }
              }}
              placeholder="Transaction data or message"
              type="text"
              value={inputData}
            />
            <button
              className="min-h-12 rounded-md bg-[#1f2937] px-5 font-semibold text-white transition hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-[#9aa4b2]"
              disabled={!isReady || isMining || !inputData.trim()}
              onClick={() => void handleAddBlock()}
              type="button"
            >
              {isMining ? "Mining..." : "Mine Block"}
            </button>
          </div>

          {error && (
            <div className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[#991b1b]">
              {error}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-6 md:px-8">
        {chain.map((block) => (
          <article
            className="rounded-md border border-[#d9dee7] bg-white p-5 shadow-sm"
            key={`${block.index}-${block.hash}`}
          >
            <div className="flex flex-col justify-between gap-3 border-b border-[#edf0f4] pb-4 md:flex-row md:items-center">
              <div>
                <p className="font-mono text-sm font-semibold text-[#2563eb]">
                  Block #{block.index}
                </p>
                <h2 className="mt-1 text-xl font-bold">{block.data}</h2>
              </div>
              <time className="font-mono text-sm text-[#5b6b7f]">
                {formatTimestamp(block.timestamp)}
              </time>
            </div>

            <dl className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                  Current hash
                </dt>
                <dd className="mt-2 break-all font-mono text-sm font-semibold text-[#1d4ed8]">
                  <span className="md:hidden">{shortHash(block.hash)}</span>
                  <span className="hidden md:inline">{block.hash}</span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                  Previous hash
                </dt>
                <dd className="mt-2 break-all font-mono text-sm font-semibold text-[#475569]">
                  <span className="md:hidden">{shortHash(block.previousHash)}</span>
                  <span className="hidden md:inline">{block.previousHash}</span>
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}

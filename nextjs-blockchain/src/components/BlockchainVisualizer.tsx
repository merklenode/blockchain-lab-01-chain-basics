"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Blockchain, type BlockSnapshot } from "@/src/blockchain";

type AnimationSpeed = "slow" | "normal" | "off";
type TimelineEntry = { id: string; message: string; ts: number };

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(timestamp * 1000));
}

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat(undefined, { timeStyle: "medium" }).format(
    new Date(ts),
  );
}

function shortHash(hash: string): string {
  if (hash.length <= 18) return hash;
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

const ANIM_SPEED_MAP: Record<AnimationSpeed, string> = {
  slow: "600ms",
  normal: "200ms",
  off: "0ms",
};

export default function BlockchainVisualizer() {
  const [blockchain, setBlockchain] = useState<Blockchain | null>(null);
  const [chain, setChain] = useState<BlockSnapshot[]>([]);
  const [inputData, setInputData] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [brokenAtIndex, setBrokenAtIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Lab controls state
  const [tamperIndex, setTamperIndex] = useState<number | null>(null);
  const [tamperInput, setTamperInput] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return "off";
    }
    return "normal";
  });
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  // Track integrity transitions for the aria-live announcer
  const prevIntegrityKeyRef = useRef<string | null>(null);
  const [integrityAnnouncement, setIntegrityAnnouncement] = useState("");

  const chainSizeLabel = `${chain.length} ${chain.length === 1 ? "block" : "blocks"}`;

  function addToTimeline(message: string) {
    setTimeline((prev) => [
      ...prev,
      { id: crypto.randomUUID(), message, ts: Date.now() },
    ]);
  }

  const syncChain = useCallback(async (bc: Blockchain) => {
    const validation = await bc.validate();
    setChain(bc.getChain());
    setIsValid(validation.isValid);
    setBrokenAtIndex(validation.brokenAtIndex);

    // Only announce when integrity state genuinely transitions
    const key = validation.isValid ? "valid" : `broken-${validation.brokenAtIndex}`;
    if (key !== prevIntegrityKeyRef.current) {
      prevIntegrityKeyRef.current = key;
      setIntegrityAnnouncement(
        validation.isValid
          ? "Chain integrity valid."
          : `Chain integrity broken at block ${validation.brokenAtIndex}.`,
      );
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeBlockchain() {
      try {
        const bc = await Blockchain.create();
        if (!isMounted) return;
        setBlockchain(bc);
        await syncChain(bc);
        setIsReady(true);
        setTimeline([{ id: crypto.randomUUID(), message: "Chain initialized with genesis block.", ts: Date.now() }]);
      } catch (caughtError) {
        if (!isMounted) return;
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to initialize blockchain.",
        );
      }
    }

    void initializeBlockchain();
    return () => { isMounted = false; };
  }, [syncChain]);

  async function handleAddBlock() {
    if (!blockchain || !inputData.trim()) return;
    setIsMining(true);
    setError(null);
    setValidationMessage(null);

    try {
      await blockchain.addBlock(inputData);
      const data = inputData.trim();
      setInputData("");
      await syncChain(blockchain);
      addToTimeline(`Added block "${data}".`);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Unable to add block.",
      );
    } finally {
      setIsMining(false);
    }
  }

  async function handleValidate() {
    if (!blockchain) return;
    const result = await blockchain.validate();
    setIsValid(result.isValid);
    setBrokenAtIndex(result.brokenAtIndex);
    const msg = result.isValid
      ? "Chain is valid."
      : `Broken at block #${result.brokenAtIndex}: stored hash does not match expected.`;
    setValidationMessage(msg);
    addToTimeline(`Validated: ${msg}`);
  }

  async function handleReset() {
    if (!blockchain) return;
    await blockchain.reset();
    await syncChain(blockchain);
    setTimeline([{ id: crypto.randomUUID(), message: "Chain reset to genesis.", ts: Date.now() }]);
    setValidationMessage(null);
    setSelectedIndex(null);
    setTamperIndex(null);
    setTamperInput("");
    setError(null);
    addToTimeline("Chain reset to genesis.");
  }

  function handleTamperConfirm(blockIndex: number) {
    if (!blockchain || !tamperInput.trim()) return;
    const newData = tamperInput.trim();
    blockchain.tamper(blockIndex, newData);
    void syncChain(blockchain).then(() => {
      addToTimeline(`Tampered block #${blockIndex} with "${newData}".`);
    });
    setTamperIndex(null);
    setTamperInput("");
    setValidationMessage(null);
  }

  async function handleRepair(fromIndex: number) {
    if (!blockchain) return;
    await blockchain.repair(fromIndex);
    await syncChain(blockchain);
    addToTimeline(`Repaired chain from block #${fromIndex}.`);
    setValidationMessage(null);
  }

  function toggleSelectBlock(blockIndex: number) {
    setSelectedIndex((prev) => (prev === blockIndex ? null : blockIndex));
  }

  const selectedBlock = selectedIndex !== null ? chain[selectedIndex] : null;

  return (
    <main
      className="min-h-screen bg-[#f6f7f9] text-[#111827]"
      style={{ "--anim-speed": ANIM_SPEED_MAP[animationSpeed] } as React.CSSProperties}
    >
      {/* Hidden live region — announces integrity transitions to screen readers.
          Rendered empty on mount; content set only on genuine state changes. */}
      <p role="status" className="sr-only" aria-atomic="true">
        {integrityAnnouncement}
      </p>

      {/* Header */}
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
                <p className="mt-1 font-mono text-sm font-semibold">{chainSizeLabel}</p>
              </div>

              {/* Integrity badge — aria-live so changes are announced */}
              <div
                aria-live="polite"
                aria-atomic="true"
                className="rounded-md border border-[#d9dee7] bg-[#f9fafb] px-4 py-3"
              >
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

          {/* Add block */}
          <div className="flex flex-col gap-3 md:flex-row">
            <label htmlFor="tx-input" className="sr-only">
              Transaction data
            </label>
            <input
              id="tx-input"
              aria-describedby={error ? "tx-error" : undefined}
              className="min-h-12 flex-1 rounded-md border border-[#cbd5e1] bg-white px-4 text-base outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#dbeafe]"
              disabled={!isReady || isMining}
              onChange={(event) => setInputData(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleAddBlock();
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
              {isMining ? "Mining…" : "Mine Block"}
            </button>
          </div>

          {/* Lab action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-md border border-[#d9dee7] bg-white px-4 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isReady}
              onClick={() => void handleValidate()}
              type="button"
            >
              Validate Chain
            </button>
            <button
              className="rounded-md border border-[#d9dee7] bg-white px-4 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f3f4f6] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!isReady}
              onClick={() => void handleReset()}
              type="button"
            >
              Reset Chain
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <label
                htmlFor="anim-speed"
                className="text-xs font-semibold uppercase tracking-[0.12em] text-[#697789]"
              >
                Speed
              </label>
              <select
                id="anim-speed"
                className="rounded-md border border-[#d9dee7] bg-white px-3 py-2 text-sm font-semibold text-[#1f2937]"
                value={animationSpeed}
                onChange={(e) =>
                  setAnimationSpeed(e.target.value as AnimationSpeed)
                }
              >
                <option value="off">Instant</option>
                <option value="normal">Normal</option>
                <option value="slow">Slow</option>
              </select>
            </div>
          </div>

          {/* Explicit validation message — rendered always so screen readers catch updates */}
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={
              validationMessage
                ? `rounded-md border px-4 py-3 text-sm font-medium ${
                    isValid
                      ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
                      : "border-[#fecaca] bg-[#fef2f2] text-[#991b1b]"
                  }`
                : "sr-only"
            }
          >
            {validationMessage ?? ""}
          </p>

          {error && (
            <div
              id="tx-error"
              role="alert"
              className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-medium text-[#991b1b]"
            >
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Chain + inspector layout */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8">
        <div
          className={`grid gap-6 ${selectedBlock ? "lg:grid-cols-[1fr_340px]" : ""}`}
        >
          {/* Block list */}
          <section className="grid gap-4" aria-label="Blockchain">
            {chain.map((block) => {
              const isBroken =
                !isValid &&
                brokenAtIndex !== null &&
                block.index >= brokenAtIndex;
              const isTamperActive = tamperIndex === block.index;
              const isSelected = selectedIndex === block.index;

              return (
                <article
                  key={block.id}
                  className={`block-card rounded-md border bg-white p-5 shadow-sm transition-colors ${
                    isBroken
                      ? "border-l-4 border-l-[#ef4444] border-t-[#d9dee7] border-r-[#d9dee7] border-b-[#d9dee7]"
                      : "border-[#d9dee7]"
                  } ${isSelected ? "ring-2 ring-[#2563eb]" : ""} cursor-pointer`}
                  onClick={() => toggleSelectBlock(block.index)}
                >
                  <div className="flex flex-col justify-between gap-3 border-b border-[#edf0f4] pb-4 md:flex-row md:items-center">
                    <div>
                      <p className="font-mono text-sm font-semibold text-[#2563eb]">
                        Block #{block.index}
                        {isBroken && (
                          <span className="ml-2 font-mono text-xs text-[#ef4444]">
                            ✗ tampered
                          </span>
                        )}
                      </p>
                      <h2 className="mt-1 text-xl font-bold break-all">{block.data}</h2>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <time className="font-mono text-sm text-[#5b6b7f]">
                        {formatTimestamp(block.timestamp)}
                      </time>
                      <button
                        aria-label={`Tamper block ${block.index}`}
                        className="rounded-md border border-[#d9dee7] bg-[#f9fafb] px-3 py-1.5 text-xs font-semibold text-[#1f2937] transition hover:bg-[#f3f4f6]"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isTamperActive) {
                            setTamperIndex(null);
                            setTamperInput("");
                          } else {
                            setTamperIndex(block.index);
                            setTamperInput(block.data);
                          }
                        }}
                        type="button"
                      >
                        {isTamperActive ? "Cancel" : "Tamper"}
                      </button>
                    </div>
                  </div>

                  {/* Tamper inline form */}
                  {isTamperActive && (
                    <div
                      className="mt-4 flex flex-col gap-3 sm:flex-row"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label htmlFor={`tamper-input-${block.index}`} className="sr-only">
                        Replacement data for block {block.index}
                      </label>
                      <input
                        id={`tamper-input-${block.index}`}
                        autoFocus
                        className="min-h-10 flex-1 rounded-md border border-[#fca5a5] bg-white px-3 text-sm outline-none focus:border-[#ef4444] focus:ring-4 focus:ring-[#fee2e2]"
                        onChange={(e) => setTamperInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTamperConfirm(block.index);
                          if (e.key === "Escape") {
                            setTamperIndex(null);
                            setTamperInput("");
                          }
                        }}
                        placeholder="Replacement data"
                        type="text"
                        value={tamperInput}
                      />
                      <div className="flex gap-2">
                        <button
                          className="rounded-md bg-[#ef4444] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#dc2626] disabled:opacity-50"
                          disabled={!tamperInput.trim()}
                          onClick={() => handleTamperConfirm(block.index)}
                          type="button"
                        >
                          Confirm
                        </button>
                        <button
                          className="rounded-md border border-[#d9dee7] bg-white px-4 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f3f4f6]"
                          onClick={() => {
                            setTamperIndex(null);
                            setTamperInput("");
                          }}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <dl className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                        Current hash
                      </dt>
                      <dd
                        className={`mt-2 break-all font-mono text-sm font-semibold ${
                          isBroken ? "text-[#ef4444]" : "text-[#1d4ed8]"
                        }`}
                      >
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
              );
            })}

            {/* Repair button */}
            {!isValid && brokenAtIndex !== null && (
              <button
                aria-label={`Repair chain from block ${brokenAtIndex}`}
                className="w-full rounded-md border border-[#fca5a5] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#991b1b] transition hover:bg-[#fee2e2]"
                onClick={() => void handleRepair(brokenAtIndex)}
                type="button"
              >
                Repair chain from block #{brokenAtIndex}
              </button>
            )}
          </section>

          {/* Selected block inspector */}
          {selectedBlock && (
            <aside
              className="rounded-md border border-[#d9dee7] bg-white p-5 shadow-sm h-fit"
              aria-label={`Block ${selectedBlock.index} inspector`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-sm font-semibold text-[#2563eb]">
                  Block #{selectedBlock.index} Inspector
                </h2>
                <button
                  aria-label="Close inspector"
                  className="text-[#697789] hover:text-[#111827]"
                  onClick={() => setSelectedIndex(null)}
                  type="button"
                >
                  ✕
                </button>
              </div>
              <dl className="grid gap-4">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                    Index
                  </dt>
                  <dd className="mt-1 font-mono text-sm">{selectedBlock.index}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                    Data
                  </dt>
                  <dd className="mt-1 text-sm break-all">{selectedBlock.data}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                    Timestamp
                  </dt>
                  <dd className="mt-1 font-mono text-sm">
                    {formatTimestamp(selectedBlock.timestamp)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                    Hash
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-[#1d4ed8]">
                    {selectedBlock.hash}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                    Previous Hash
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-[#475569]">
                    {selectedBlock.previousHash}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                    Status
                  </dt>
                  <dd
                    className={`mt-1 font-mono text-sm font-semibold ${
                      !isValid &&
                      brokenAtIndex !== null &&
                      selectedBlock.index >= brokenAtIndex
                        ? "text-[#ef4444]"
                        : "text-[#1d7f4f]"
                    }`}
                  >
                    {!isValid &&
                    brokenAtIndex !== null &&
                    selectedBlock.index >= brokenAtIndex
                      ? "tampered / invalid"
                      : "valid"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#697789]">
                    Stable ID
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs text-[#697789]">
                    {selectedBlock.id}
                  </dd>
                </div>
              </dl>
            </aside>
          )}
        </div>

        {/* Action timeline */}
        {timeline.length > 0 && (
          <section className="mt-8" aria-label="Action timeline">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#697789]">
              Action Timeline
            </h2>
            <ol className="grid gap-2">
              {timeline.map((entry) => (
                <li
                  key={entry.id}
                  className="flex gap-3 rounded-md border border-[#d9dee7] bg-white px-4 py-3 text-sm"
                >
                  <time className="shrink-0 font-mono text-xs text-[#697789] mt-0.5">
                    {formatTime(entry.ts)}
                  </time>
                  <span>{entry.message}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}

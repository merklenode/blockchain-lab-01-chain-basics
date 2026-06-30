const encoder = new TextEncoder();

export async function sha256Hex(input: string): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto API is not available in this runtime.");
  }

  const buffer = await globalThis.crypto.subtle.digest(
    "SHA-256",
    encoder.encode(input),
  );

  return Array.from(new Uint8Array(buffer), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

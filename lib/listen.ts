import type { HeardWord } from "./align.ts";

// status 0 = network failure; 400/422 = the recording itself had nothing to hear.
export class ListenError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function listen(blob: Blob): Promise<HeardWord[]> {
  let res: Response;
  try {
    res = await fetch("/api/listen", { method: "POST", headers: { "Content-Type": blob.type }, body: blob });
  } catch {
    throw new ListenError("network", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ListenError(data.error ?? `status ${res.status}`, res.status);
  return data.words;
}

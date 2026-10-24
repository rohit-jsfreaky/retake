import type { HeardWord } from "./align.ts";

export class ListenError extends Error {}

export async function listen(blob: Blob): Promise<HeardWord[]> {
  let res: Response;
  try {
    res = await fetch("/api/listen", { method: "POST", headers: { "Content-Type": blob.type }, body: blob });
  } catch {
    throw new ListenError("network");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ListenError(data.error ?? `status ${res.status}`);
  return data.words;
}

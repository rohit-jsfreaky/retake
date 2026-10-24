// Passes the audio to Deepgram so the key never reaches the browser.
const MAX_BYTES = 5 * 1024 * 1024;
// No smart_format (it rewrites spoken words) and no keyterms (they would bias the listener toward the script).
const DEEPGRAM_URL = "https://api.deepgram.com/v1/listen?model=nova-3&language=en&filler_words=true";

export async function POST(request: Request) {
  const key = process.env.DEEPGRAM_API_KEY;
  if (!key) return Response.json({ error: "The listener is not set up." }, { status: 500 });

  const type = request.headers.get("content-type") ?? "";
  if (!type.startsWith("audio/")) return Response.json({ error: "Send audio." }, { status: 415 });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) {
    return Response.json({ error: "Recording is too long." }, { status: 413 });
  }

  const audio = await request.arrayBuffer();
  if (audio.byteLength === 0) return Response.json({ error: "Empty recording." }, { status: 400 });
  if (audio.byteLength > MAX_BYTES) return Response.json({ error: "Recording is too long." }, { status: 413 });

  let res: Response;
  try {
    res = await fetch(DEEPGRAM_URL, {
      method: "POST",
      headers: { Authorization: `Token ${key}`, "Content-Type": type },
      body: audio,
    });
  } catch {
    return Response.json({ error: "Couldn't reach the listener." }, { status: 502 });
  }
  // Deepgram answers 400 "corrupt or unsupported data" for a recording with no sound in it (Stop pressed at once).
  if (res.status === 400) return Response.json({ error: "No speech in this recording." }, { status: 422 });
  if (!res.ok) {
    console.error("deepgram", res.status, await res.text());
    return Response.json({ error: "The listener failed." }, { status: 502 });
  }
  const data = await res.json();
  return Response.json({ words: data.results?.channels?.[0]?.alternatives?.[0]?.words ?? [] });
}

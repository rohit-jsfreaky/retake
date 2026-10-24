// Plays part of a recording. Decoded with Web Audio because Chrome's MediaRecorder webm has no seek index,
// so <audio>.currentTime jumps are unreliable; a decoded buffer plays any segment exactly.
let ctx: AudioContext | null = null;
let current: AudioBufferSourceNode | null = null;
const buffers = new Map<string, Promise<AudioBuffer>>();

export async function playClip(url: string, from = 0, to?: number) {
  ctx ??= new AudioContext();
  const audio = ctx;
  if (!buffers.has(url)) {
    buffers.set(url, fetch(url).then((r) => r.arrayBuffer()).then((b) => audio.decodeAudioData(b)));
  }
  const buffer = await buffers.get(url)!;
  current?.stop();
  const source = audio.createBufferSource();
  source.buffer = buffer;
  source.connect(audio.destination);
  const start = Math.max(0, from);
  source.start(0, start, to === undefined ? undefined : Math.max(0, to - start));
  current = source;
}

export function forgetClip(url: string) {
  buffers.delete(url);
  URL.revokeObjectURL(url);
}

"use client";
import { useRef, useState } from "react";

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const rec = useRef<{ recorder: MediaRecorder; chunks: Blob[]; timer: number } | null>(null);

  async function start() {
    setBlocked(false);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setBlocked(true);
      return;
    }
    // 32 kbps Opus is plenty for speech and keeps a 4-minute take near 1 MB.
    const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.start();
    const began = Date.now();
    setSeconds(0);
    const timer = window.setInterval(() => setSeconds(Math.floor((Date.now() - began) / 1000)), 250);
    rec.current = { recorder, chunks, timer };
    setRecording(true);
  }

  function stop(): Promise<Blob> {
    const current = rec.current!;
    rec.current = null;
    window.clearInterval(current.timer);
    setRecording(false);
    return new Promise((resolve) => {
      current.recorder.onstop = () => {
        current.recorder.stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(current.chunks, { type: current.recorder.mimeType }));
      };
      current.recorder.stop();
    });
  }

  return { recording, seconds, blocked, start, stop };
}

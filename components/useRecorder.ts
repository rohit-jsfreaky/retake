"use client";
import { useRef, useState } from "react";

type Current = { recorder: MediaRecorder; chunks: Blob[]; timer: number; audio: AudioContext };

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [micName, setMicName] = useState("");
  const [level, setLevel] = useState(0); // 0..1, how loud the mic is right now
  const [quiet, setQuiet] = useState(false); // nothing loud for the last 2 seconds
  const rec = useRef<Current | null>(null);

  async function start() {
    setBlocked(false);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setBlocked(true);
      return;
    }
    setMicName(stream.getAudioTracks()[0]?.label ?? "");

    // A level meter, so a wrong or muted mic shows up while recording, not after.
    const audio = new AudioContext();
    const analyser = audio.createAnalyser();
    audio.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);

    // 32 kbps Opus is plenty for speech and keeps a 4-minute take near 1 MB.
    const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.start();
    const began = Date.now();
    setSeconds(0);
    const recent: number[] = [];
    const timer = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - began) / 1000));
      analyser.getByteTimeDomainData(samples);
      const peak = samples.reduce((max, v) => Math.max(max, Math.abs(v - 128)), 0);
      setLevel(peak / 128);
      recent.push(peak / 128);
      if (recent.length > 20) recent.shift();
      setQuiet(recent.length === 20 && Math.max(...recent) < 0.05);
    }, 100);
    rec.current = { recorder, chunks, timer, audio };
    setRecording(true);
  }

  function stop(): Promise<Blob> {
    const current = rec.current!;
    rec.current = null;
    window.clearInterval(current.timer);
    current.audio.close();
    setRecording(false);
    setLevel(0);
    setQuiet(false);
    return new Promise((resolve) => {
      current.recorder.onstop = () => {
        current.recorder.stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(current.chunks, { type: current.recorder.mimeType }));
      };
      current.recorder.stop();
    });
  }

  return { recording, seconds, blocked, micName, level, quiet, start, stop };
}

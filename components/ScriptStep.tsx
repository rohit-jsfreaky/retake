"use client";

export function ScriptStep({ script, onChange, onStart }: { script: string; onChange: (s: string) => void; onStart: () => void }) {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold">Practise the exact words you have to say in English, before you say them.</h1>
      <p className="text-muted">For anyone recording a demo, an interview intro or a call opener in a language that isn&apos;t their first.</p>
      <textarea
        className="min-h-60 rounded-lg border border-line bg-panel p-4 text-lg"
        placeholder="Paste what you're going to say"
        value={script}
        onChange={(e) => onChange(e.target.value)}
      />
      <button className="self-start rounded-lg bg-accent px-5 py-2.5 text-white disabled:opacity-40" disabled={!script.trim()} onClick={onStart}>
        Start reading
      </button>
    </section>
  );
}

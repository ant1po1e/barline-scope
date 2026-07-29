export default function Header() {
  return (
    <header className="mb-7">
      <div className="mb-2.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-amber">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber shadow-[0_0_8px_#ffb648]" />
        barline scope
      </div>
      <h1 className="mb-2.5 text-[28px] font-bold leading-[1.1] tracking-tight sm:text-4xl">
        See what your timing points actually do
      </h1>
      <p className="max-w-xl text-[15px] leading-relaxed text-ink-dim">
        Paste the raw <code className="rounded bg-panel2 border border-border-soft px-1.5 py-0.5 font-mono text-[13px] text-cyan">[TimingPoints]</code>{" "}
        lines from a <code className="rounded bg-panel2 border border-border-soft px-1.5 py-0.5 font-mono text-[13px] text-cyan">.osu</code> file. This
        traces the exact scroll speed and position the barline would have — the same math the game uses (
        <code className="rounded bg-panel2 border border-border-soft px-1.5 py-0.5 font-mono text-[13px] text-cyan">BPM × SV</code>) — as an animated
        sweep and a pair of graphs, so you can tell what an SV/BPM trick really looks like before you drop it in the editor.
      </p>
    </header>
  );
}

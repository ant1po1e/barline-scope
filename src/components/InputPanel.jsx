const PLACEHOLDER = `52020,6E-08,4,2,1,45,1,0
52020,-111.1111111,4,2,1,45,0,0
52020.1,400,4,2,1,45,1,0
52036.8,-454.545454545455,4,2,1,45,0,0`;

export default function InputPanel({
  text,
  setText,
  refBpm,
  setRefBpm,
  leadMs,
  setLeadMs,
  tailMs,
  setTailMs,
  onParse,
  status,
}) {
  return (
    <section className="mb-4 rounded-2xl border border-border bg-panel p-5">
      <h2 className="mb-3.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-ink-dim">Timing points</h2>

      <textarea
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") onParse();
        }}
        placeholder={PLACEHOLDER}
        className="min-h-[130px] w-full resize-y rounded-lg border border-border bg-panel2 p-3 px-3.5 font-mono text-[13px] leading-relaxed text-ink outline-none focus:border-amber-dim"
      />

      <div className="mt-3.5 flex flex-wrap items-end gap-3.5">
        <Field label="Reference BPM" hint="1.0× speed = this BPM at SV 1.0x">
          <input
            type="number"
            step="0.01"
            value={refBpm}
            onChange={(e) => setRefBpm(e.target.value)}
            onBlur={onParse}
            className="w-[120px] rounded-lg border border-border bg-panel2 px-2.5 py-2 font-mono text-[13px] text-ink outline-none focus:border-amber-dim"
          />
        </Field>
        <Field label="Lead before first point" hint="ms of runway to show">
          <input
            type="number"
            step="100"
            min="0"
            value={leadMs}
            onChange={(e) => setLeadMs(e.target.value)}
            className="w-[120px] rounded-lg border border-border bg-panel2 px-2.5 py-2 font-mono text-[13px] text-ink outline-none focus:border-amber-dim"
          />
        </Field>
        <Field label="Tail after last point" hint="ms of settle time to show">
          <input
            type="number"
            step="100"
            min="0"
            value={tailMs}
            onChange={(e) => setTailMs(e.target.value)}
            className="w-[120px] rounded-lg border border-border bg-panel2 px-2.5 py-2 font-mono text-[13px] text-ink outline-none focus:border-amber-dim"
          />
        </Field>
        <button
          onClick={onParse}
          className="rounded-[9px] bg-amber px-[18px] py-2.5 text-[13.5px] font-semibold text-[#1a1200] transition-opacity hover:opacity-90 active:scale-[0.97]"
        >
          Trace it
        </button>
      </div>

      <div
        className={`mt-3 min-h-[16px] font-mono text-xs ${
          status?.type === "err" ? "text-bpm-red" : status?.type === "ok" ? "text-sv-green" : "text-ink"
        }`}
      >
        {status?.message}
      </div>
    </section>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] tracking-wide text-ink-dim">{label}</label>
      {children}
      <small className="text-[10.5px] text-ink-mute">{hint}</small>
    </div>
  );
}

export { PLACEHOLDER };

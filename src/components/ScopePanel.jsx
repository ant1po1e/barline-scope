import { useEffect, useRef } from "react";
import { fitCanvas } from "../lib/canvas.js";
import { valueAt, effectsAt, findIndex, fmt } from "../lib/timingMath.js";

export default function ScopePanel({
  timeline,
  bpmPts,
  svPts,
  refBpm,
  curTime,
  setCurTime,
  playing,
  setPlaying,
  rate,
  setRate,
  loop,
  setLoop,
}) {
  const canvasRef = useRef(null);

  const bpm = valueAt(bpmPts, curTime, "bpm", refBpm);
  const sv = valueAt(svPts, curTime, "sv", 1.0);
  const eff = effectsAt(bpmPts, curTime);
  const kiai = (eff & 1) === 1;
  const speed = timeline ? timeline.speeds[findIndex(timeline, curTime)] : 0;

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline, curTime]);

  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline, curTime]);

  function draw() {
    const canvas = canvasRef.current;
    if (!canvas || !timeline) return;
    const { ctx, w, h } = fitCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const pos = timeline.positions[findIndex(timeline, curTime)];
    const laneLen = 260; // arbitrary "pixels of travel per lane cycle" unit
    const wrapped = ((pos % laneLen) + laneLen) % laneLen;
    const yFrac = wrapped / laneLen;

    // faint mania-style column guides
    ctx.strokeStyle = "rgba(255,255,255,.05)";
    ctx.lineWidth = 1;
    const cols = 4;
    for (let c = 1; c < cols; c++) {
      const x = (w / cols) * c;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // trailing phosphor-decay echoes of the recent sweep
    const trail = 10;
    for (let k = trail; k >= 1; k--) {
      const tt = curTime - k * Math.max(1, (timeline.tEnd - timeline.tStart) / 240);
      if (tt < timeline.tStart) continue;
      const pj = timeline.positions[findIndex(timeline, tt)];
      const wj = ((pj % laneLen) + laneLen) % laneLen;
      const yj = (wj / laneLen) * h;
      const alpha = (1 - k / trail) * 0.22;
      ctx.fillStyle = `rgba(255,182,72,${alpha})`;
      ctx.fillRect(0, yj - 1, w, 2);
    }

    // main barline
    const y = yFrac * h;
    const grad = ctx.createLinearGradient(0, y - 10, 0, y + 10);
    grad.addColorStop(0, "rgba(255,182,72,0)");
    grad.addColorStop(0.5, "rgba(255,182,72,.9)");
    grad.addColorStop(1, "rgba(255,182,72,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y - 10, w, 20);
    ctx.fillStyle = kiai ? "#ffe38a" : "#ffb648";
    ctx.shadowColor = kiai ? "#ffd166" : "#ffb648";
    ctx.shadowBlur = kiai ? 18 : 10;
    ctx.fillRect(0, y - 1.5, w, 3);
    ctx.shadowBlur = 0;
  }

  function scrub(t) {
    if (!timeline) return;
    const clamped = Math.min(timeline.tEnd, Math.max(timeline.tStart, t));
    setCurTime(clamped);
  }

  if (!timeline) return null;

  return (
    <section className="relative mb-4 rounded-2xl border border-border bg-panel p-5">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-ink-dim">Barline sweep</h2>
        <div className="flex flex-wrap gap-4 font-mono text-xs">
          <span className="text-ink-mute">
            t <b className="text-[13px] font-semibold text-ink">{Math.round(curTime)}ms</b>
          </span>
          <span className="text-ink-mute">
            BPM <b className="text-[13px] font-semibold text-bpm-red">{fmt(bpm, 1)}</b>
          </span>
          <span className="text-ink-mute">
            SV <b className="text-[13px] font-semibold text-sv-green">{fmt(sv, 3)}x</b>
          </span>
          <span className="text-ink-mute">
            × <b className="text-[13px] font-semibold text-amber">{fmt(speed, 3)}x</b>
          </span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-[#06070a] [background-image:repeating-linear-gradient(180deg,rgba(255,255,255,.018)_0px,rgba(255,255,255,.018)_1px,transparent_1px,transparent_3px)]">
        <canvas ref={canvasRef} className="block h-[320px] w-full sm:h-[440px]" />
        <div
          className={`pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,209,102,.16),transparent_70%)] transition-opacity duration-300 ${
            kiai ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-3">
        <button
          onClick={() => setPlaying(!playing)}
          title="Play / pause"
          className="flex h-10 w-10 items-center justify-center rounded-[9px] border border-border bg-panel2 text-[15px] transition-colors hover:bg-[#1c2029] active:scale-[0.97]"
        >
          {playing ? "⏸" : "▶"}
        </button>
        <input
          type="range"
          min={timeline.tStart}
          max={timeline.tEnd}
          step={timeline.dt}
          value={curTime}
          onChange={(e) => {
            setPlaying(false);
            scrub(parseFloat(e.target.value));
          }}
          className="min-w-[160px] flex-1"
        />
        <span className="min-w-[118px] text-right font-mono text-xs text-ink-dim">
          {Math.round(curTime - timeline.tStart)} / {Math.round(timeline.tEnd - timeline.tStart)} ms
        </span>
        <select
          value={rate}
          onChange={(e) => setRate(parseFloat(e.target.value))}
          title="Playback rate"
          className="rounded-lg border border-border bg-panel2 px-2.5 py-2 font-mono text-xs text-ink outline-none"
        >
          {[0.1, 0.25, 0.5, 1, 2, 4].map((r) => (
            <option key={r} value={r}>
              {r}×
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer select-none items-center gap-1.5 font-mono text-xs text-ink-dim">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
          loop
        </label>
      </div>
    </section>
  );
}

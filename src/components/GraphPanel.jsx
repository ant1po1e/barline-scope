import { useEffect, useRef } from "react";
import { fitCanvas } from "../lib/canvas.js";
import { logMap, fmt } from "../lib/timingMath.js";

export default function GraphPanel({ timeline, bpmPts, svPts, curTime, setCurTime, setPlaying }) {
  const speedRef = useRef(null);
  const posRef = useRef(null);
  const speedRangeRef = useRef(null);
  const posRangeRef = useRef(null);

  useEffect(() => {
    drawSpeedGraph();
    drawPosGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline, curTime]);

  useEffect(() => {
    const onResize = () => {
      drawSpeedGraph();
      drawPosGraph();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeline, curTime]);

  function drawTicks(ctx, w, h) {
    ctx.lineWidth = 1;
    for (const p of bpmPts) {
      const x = ((p.time - timeline.tStart) / (timeline.tEnd - timeline.tStart)) * w;
      ctx.strokeStyle = "rgba(255,93,93,.55)";
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 6);
      ctx.stroke();
    }
    for (const p of svPts) {
      const x = ((p.time - timeline.tStart) / (timeline.tEnd - timeline.tStart)) * w;
      ctx.strokeStyle = "rgba(89,232,120,.55)";
      ctx.beginPath();
      ctx.moveTo(x, h - 6);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }

  function drawCursor(ctx, w, h) {
    const x = ((curTime - timeline.tStart) / (timeline.tEnd - timeline.tStart)) * w;
    ctx.strokeStyle = "rgba(255,255,255,.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }

  function drawSpeedGraph() {
    const canvas = speedRef.current;
    if (!canvas || !timeline) return;
    const { ctx, w, h } = fitCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const vals = timeline.speeds.map(logMap);
    let vMin = Math.min(...vals);
    let vMax = Math.max(...vals);
    if (vMax - vMin < 0.001) {
      vMax += 0.5;
      vMin -= 0.5;
    }
    const pad = (vMax - vMin) * 0.08;
    vMin -= pad;
    vMax += pad;

    const zeroY = h - ((0 - vMin) / (vMax - vMin)) * h;
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(w, zeroY);
    ctx.stroke();

    drawTicks(ctx, w, h);

    ctx.beginPath();
    for (let i = 0; i < vals.length; i++) {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((vals[i] - vMin) / (vMax - vMin)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#ffb648";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    drawCursor(ctx, w, h);

    const rawMax = Math.max(...timeline.speeds);
    const rawMin = Math.min(...timeline.speeds);
    if (speedRangeRef.current) speedRangeRef.current.textContent = `${fmt(rawMin, 2)}x → ${fmt(rawMax, 2)}x`;
  }

  function drawPosGraph() {
    const canvas = posRef.current;
    if (!canvas || !timeline) return;
    const { ctx, w, h } = fitCanvas(canvas);
    ctx.clearRect(0, 0, w, h);

    const vals = timeline.positions;
    let vMin = Math.min(...vals);
    let vMax = Math.max(...vals);
    if (vMax - vMin < 0.001) {
      vMax += 1;
      vMin -= 1;
    }
    const pad = (vMax - vMin) * 0.08;
    vMin -= pad;
    vMax += pad;

    drawTicks(ctx, w, h);

    ctx.beginPath();
    for (let i = 0; i < vals.length; i++) {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((vals[i] - vMin) / (vMax - vMin)) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#5eead4";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = "rgba(94,234,212,.08)";
    ctx.fill();

    drawCursor(ctx, w, h);

    if (posRangeRef.current) posRangeRef.current.textContent = `${fmt(vMin + pad, 1)} → ${fmt(vMax - pad, 1)}`;
  }

  function scrubFromEvent(e, canvas) {
    if (!timeline) return;
    const rect = canvas.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setPlaying(false);
    setCurTime(timeline.tStart + frac * (timeline.tEnd - timeline.tStart));
  }

  function bindDrag(ref) {
    return {
      onPointerDown: (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        scrubFromEvent(e, ref.current);
      },
      onPointerMove: (e) => {
        if (e.buttons === 1) scrubFromEvent(e, ref.current);
      },
    };
  }

  if (!timeline) return null;

  return (
    <section className="mb-4 rounded-2xl border border-border bg-panel p-5">
      <h2 className="mb-3.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-ink-dim">What's driving it</h2>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <h3 className="mb-2 flex justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-dim">
            <span>
              <span className="mr-1.5 inline-block h-[9px] w-[9px] rounded-sm bg-amber align-middle" />
              Effective speed (log scale, BPM × SV)
            </span>
            <span ref={speedRangeRef} />
          </h3>
          <canvas
            ref={speedRef}
            {...bindDrag(speedRef)}
            className="block h-[130px] w-full cursor-crosshair rounded-[10px] border border-border bg-[#06070a]"
          />
        </div>

        <div>
          <h3 className="mb-2 flex justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-dim">
            <span>
              <span className="mr-1.5 inline-block h-[9px] w-[9px] rounded-sm bg-cyan align-middle" />
              Cumulative barline distance
            </span>
            <span ref={posRangeRef} />
          </h3>
          <canvas
            ref={posRef}
            {...bindDrag(posRef)}
            className="block h-[130px] w-full cursor-crosshair rounded-[10px] border border-border bg-[#06070a]"
          />
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-4 font-mono text-[11.5px] text-ink-mute">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-bpm-red" /> red tick = BPM (red) line
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-sv-green" /> green tick = SV (green) line
        </span>
        <span>drag on a graph or the scrubber to scan through time</span>
      </div>
    </section>
  );
}

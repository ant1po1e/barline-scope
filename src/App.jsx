import { useEffect, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import InputPanel, { PLACEHOLDER } from "./components/InputPanel.jsx";
import ScopePanel from "./components/ScopePanel.jsx";
import GraphPanel from "./components/GraphPanel.jsx";
import { parseTimingLines, buildTimeline } from "./lib/timingMath.js";

export default function App() {
  const [text, setText] = useState(PLACEHOLDER);
  const [refBpm, setRefBpm] = useState("120");
  const [leadMs, setLeadMs] = useState("500");
  const [tailMs, setTailMs] = useState("1500");
  const [status, setStatus] = useState(null);

  const [bpmPts, setBpmPts] = useState([]);
  const [svPts, setSvPts] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [refBpmUsed, setRefBpmUsed] = useState(120);

  const [curTime, setCurTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState(1);
  const [loop, setLoop] = useState(true);

  const lastFrameTsRef = useRef(null);

  function handleParse() {
    const { bpmPoints, svPoints, errors, parsed } = parseTimingLines(text);
    if (parsed === 0) {
      setStatus({
        type: "err",
        message:
          "No valid timing lines found. Paste raw .osu [TimingPoints] lines (time,beatLength,meter,sampleSet,sampleIndex,volume,uninherited,effects).",
      });
      setTimeline(null);
      return;
    }

    let ref = parseFloat(refBpm);
    if (!isFinite(ref) || ref <= 0) {
      ref = bpmPoints.length ? bpmPoints[0].bpm : 120;
      setRefBpm(ref.toFixed(2));
    }

    const allTimes = bpmPoints.map((p) => p.time).concat(svPoints.map((p) => p.time));
    const minT = Math.min(...allTimes);
    const maxT = Math.max(...allTimes);
    const lead = Math.max(0, parseFloat(leadMs) || 0);
    const tail = Math.max(0, parseFloat(tailMs) || 0);
    const tStart = minT - lead;
    const tEnd = maxT + tail;

    const tl = buildTimeline(bpmPoints, svPoints, tStart, tEnd, ref);

    setBpmPts(bpmPoints);
    setSvPts(svPoints);
    setRefBpmUsed(ref);
    setTimeline(tl);
    setCurTime(tStart);
    setStatus({
      type: errors ? "err" : "ok",
      message:
        `Parsed ${parsed} timing point(s) (${bpmPoints.length} BPM, ${svPoints.length} SV)` +
        (errors ? ` — skipped ${errors} malformed line(s).` : "."),
    });
  }

  // Parse once on first load so there's something to look at immediately.
  useEffect(() => {
    handleParse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Playback loop.
  useEffect(() => {
    if (!playing || !timeline) return;
    let rafId;
    lastFrameTsRef.current = null;

    const step = (ts) => {
      if (lastFrameTsRef.current === null) lastFrameTsRef.current = ts;
      const dtMs = ts - lastFrameTsRef.current;
      lastFrameTsRef.current = ts;

      setCurTime((prev) => {
        let next = prev + dtMs * rate;
        if (next > timeline.tEnd) {
          if (loop) next = timeline.tStart;
          else {
            next = timeline.tEnd;
            setPlaying(false);
          }
        }
        return next;
      });
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [playing, timeline, rate, loop]);

  return (
    <div className="mx-auto max-w-[1000px] px-5 pb-20 pt-8">
      <Header />

      <InputPanel
        text={text}
        setText={setText}
        refBpm={refBpm}
        setRefBpm={setRefBpm}
        leadMs={leadMs}
        setLeadMs={setLeadMs}
        tailMs={tailMs}
        setTailMs={setTailMs}
        onParse={handleParse}
        status={status}
      />

      <ScopePanel
        timeline={timeline}
        bpmPts={bpmPts}
        svPts={svPts}
        refBpm={refBpmUsed}
        curTime={curTime}
        setCurTime={setCurTime}
        playing={playing}
        setPlaying={setPlaying}
        rate={rate}
        setRate={setRate}
        loop={loop}
        setLoop={setLoop}
      />

      <GraphPanel timeline={timeline} bpmPts={bpmPts} svPts={svPts} curTime={curTime} setCurTime={setCurTime} setPlaying={setPlaying} />

      <Footer />
    </div>
  );
}

// Parses raw .osu [TimingPoints] lines into separate BPM (red/uninherited)
// and SV (green/inherited) point lists.
export function parseTimingLines(text) {
  const bpmPoints = [];
  const svPoints = [];
  const lines = text.split("\n");
  let errors = 0;
  let parsed = 0;

  for (const raw of lines) {
    const s = raw.trim();
    if (!s || s.startsWith("[") || s.startsWith("//")) continue;
    const parts = s.split(",");
    if (parts.length < 2) {
      if (s.length) errors++;
      continue;
    }
    const time = parseFloat(parts[0]);
    const beatLength = parseFloat(parts[1]);
    if (!isFinite(time) || !isFinite(beatLength)) {
      errors++;
      continue;
    }
    const uninherited = parts.length > 6 ? parseInt(parts[6], 10) : 1;
    const effects = parts.length > 7 ? parseInt(parts[7], 10) : 0;

    if (uninherited === 1 || parts.length < 7) {
      if (beatLength > 0) {
        bpmPoints.push({ time, bpm: 60000 / beatLength, effects: isFinite(effects) ? effects : 0 });
        parsed++;
      } else errors++;
    } else {
      if (beatLength !== 0) {
        svPoints.push({ time, sv: -100 / beatLength });
        parsed++;
      } else errors++;
    }
  }

  bpmPoints.sort((a, b) => a.time - b.time);
  svPoints.sort((a, b) => a.time - b.time);
  return { bpmPoints, svPoints, errors, parsed };
}

// Returns the value of the most recent point at/before time t, or fallback.
export function valueAt(points, t, key, fallback) {
  let v = fallback;
  for (const p of points) {
    if (p.time <= t) v = p[key];
    else break;
  }
  return v;
}

export function effectsAt(bpmPoints, t) {
  let v = 0;
  for (const p of bpmPoints) {
    if (p.time <= t) v = p.effects;
    else break;
  }
  return v;
}

const MAX_SAMPLES = 4000;

// Samples effective speed (SV × BPM/refBpm) and integrates it into a
// cumulative "distance" curve across [tStart, tEnd].
export function buildTimeline(bpmPoints, svPoints, tStart, tEnd, refBpm) {
  const duration = Math.max(1, tEnd - tStart);
  const n = Math.min(MAX_SAMPLES, Math.max(200, Math.round(duration)));
  const dt = duration / n;
  const times = new Array(n + 1);
  const speeds = new Array(n + 1);
  const positions = new Array(n + 1);
  let pos = 0;

  for (let i = 0; i <= n; i++) {
    const t = tStart + i * dt;
    const bpm = valueAt(bpmPoints, t, "bpm", refBpm);
    const sv = valueAt(svPoints, t, "sv", 1.0);
    const speed = sv * (bpm / refBpm);
    if (i > 0) pos += speed * dt;
    times[i] = t;
    speeds[i] = speed;
    positions[i] = pos;
  }

  return { times, speeds, positions, dt, tStart, tEnd };
}

export function logMap(v) {
  const s = v < 0 ? -1 : 1;
  return s * Math.log10(1 + Math.abs(v));
}

export function fmt(v, d = 2) {
  if (!isFinite(v)) return "—";
  if (Math.abs(v) >= 100000 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(2);
  return v.toFixed(d);
}

// Maps a time t to the nearest sample index in a built timeline.
export function findIndex(timeline, t) {
  if (!timeline) return 0;
  const frac = (t - timeline.tStart) / (timeline.tEnd - timeline.tStart);
  const i = Math.round(frac * (timeline.times.length - 1));
  return Math.min(timeline.times.length - 1, Math.max(0, i));
}

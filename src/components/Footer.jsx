export default function Footer() {
  return (
    <footer className="mt-8 font-mono text-xs leading-[1.7] text-ink-mute">
      <b className="text-ink-dim">How this is computed:</b> for a red line, BPM = 60000 / beatLength. For a green line, SV = −100 / beatLength. At any
      instant, effective speed = SV(t) × BPM(t) / reference BPM — the same two numbers osu!mania multiplies together to decide how fast everything
      scrolls. Position is that speed integrated over time. Nothing here reproduces the game's rendering cache — it's the honest math, so a huge spike
      really does mean the barline covers a huge distance in that instant.
    </footer>
  );
}

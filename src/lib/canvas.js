import { useCallback } from "react";

// Sizes a canvas's backing store to match devicePixelRatio and returns a
// ready-to-draw 2D context plus the CSS (logical) width/height.
export function fitCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, rect.width);
  const h = Math.max(1, rect.height);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

export function useFitCanvas() {
  return useCallback((canvas) => fitCanvas(canvas), []);
}

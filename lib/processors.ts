import type {
  StripeWedgeSettings,
  MultiWedgeSettings,
  SplitToneSettings,
  GlitchSettings,
} from "./types";

function hexToRgb(hex: string): [number, number, number] {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)]
    : [0, 0, 128];
}

// Returns a canvas with all pixel colors inverted (negative image)
function invertImage(img: HTMLImageElement, W: number, H: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const cx = c.getContext("2d")!;
  cx.drawImage(img, 0, 0, W, H);
  cx.globalCompositeOperation = "difference";
  cx.fillStyle = "#ffffff";
  cx.fillRect(0, 0, W, H);
  return c;
}

function getClipPath(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  mode: StripeWedgeSettings["mode"],
  angle: number,
  originX: number
) {
  const rad = (angle * Math.PI) / 180;
  const slope = Math.tan(rad);
  const ox = W * originX;

  ctx.beginPath();
  if (mode === "upper-right") {
    const xAtH = ox - H / slope;
    ctx.moveTo(ox, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H);
    if (xAtH > 0) ctx.lineTo(xAtH, H);
    ctx.lineTo(Math.max(0, ox - H / slope), H);
    ctx.closePath();
  } else if (mode === "lower-left") {
    ctx.moveTo(0, 0);
    ctx.lineTo(ox, 0);
    ctx.lineTo(W, Math.max(0, H - (W - ox) * slope));
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
  } else if (mode === "upper-left") {
    ctx.moveTo(0, 0);
    ctx.lineTo(W * (1 - originX), 0);
    ctx.lineTo(0, Math.min(H, W * (1 - originX) * slope));
    ctx.closePath();
  } else if (mode === "lower-right") {
    const rx = W * originX;
    ctx.moveTo(rx, H);
    ctx.lineTo(W, H);
    ctx.lineTo(W, Math.max(0, H - (W - rx) * slope));
    ctx.closePath();
  }
  ctx.clip();
}

export function processStripeWedge(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  s: StripeWedgeSettings
): void {
  const W = img.naturalWidth, H = img.naturalHeight;
  canvas.width = W; canvas.height = H;

  // Draw at display scale so stripes are never sub-pixel
  const scale = Math.min(1, 1200 / Math.max(W, H));
  const dW = Math.round(W * scale), dH = Math.round(H * scale);

  const off = document.createElement("canvas");
  off.width = dW; off.height = dH;
  const octx = off.getContext("2d")!;

  // Use inverted image as source if invert is on
  const src = s.invert ? invertImage(img, dW, dH) : null;
  octx.drawImage(src ?? img, 0, 0, dW, dH);

  const [r, g, b] = hexToRgb(s.color);
  const sw = Math.max(1, Math.round(s.stripeW * scale));
  const gap = Math.max(1, Math.round(s.gap * scale));
  const pitch = sw + gap;

  octx.save();
  getClipPath(octx, dW, dH, s.mode, s.angle, s.originX);
  octx.fillStyle = `rgba(${r},${g},${b},${s.opacity})`;
  for (let x = 0; x < dW + pitch; x += pitch) {
    octx.fillRect(x, 0, sw, dH);
  }
  octx.restore();

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(off, 0, 0, W, H);
}

export function processMultiWedge(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  s: MultiWedgeSettings
): void {
  const W = img.naturalWidth, H = img.naturalHeight;
  canvas.width = W; canvas.height = H;

  const scale = Math.min(1, 1200 / Math.max(W, H));
  const dW = Math.round(W * scale), dH = Math.round(H * scale);

  const off = document.createElement("canvas");
  off.width = dW; off.height = dH;
  const octx = off.getContext("2d")!;

  const src = s.invert ? invertImage(img, dW, dH) : null;
  octx.drawImage(src ?? img, 0, 0, dW, dH);

  const [r, g, b] = hexToRgb(s.color);
  const sw = Math.max(1, Math.round(s.stripeW * scale));
  const gap = Math.max(1, Math.round(s.gap * scale));
  const pitch = sw + gap;
  const segW = dW / s.count;

  for (let i = 0; i < s.count; i++) {
    octx.save();
    octx.beginPath();
    octx.rect(i * segW, 0, segW, dH);
    octx.clip();

    const slope = Math.tan((s.angle * Math.PI) / 180);
    const ox = (i + 1) * segW;

    octx.beginPath();
    octx.moveTo(ox, 0);
    octx.lineTo((i + 1) * segW, 0);
    octx.lineTo((i + 1) * segW, dH);
    const xAtH = ox - dH / slope;
    if (xAtH > i * segW) octx.lineTo(xAtH, dH);
    octx.lineTo(Math.max(i * segW, ox - dH / slope), dH);
    octx.closePath();
    octx.clip();

    octx.fillStyle = `rgba(${r},${g},${b},${s.opacity})`;
    for (let x = i * segW; x < (i + 1) * segW; x += pitch) {
      octx.fillRect(x, 0, sw, dH);
    }
    octx.restore();
  }

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(off, 0, 0, W, H);
}

export function processSplitTone(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  s: SplitToneSettings
): void {
  const ctx = canvas.getContext("2d")!;
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const W = canvas.width, H = canvas.height;
  const [r, g, b] = hexToRgb(s.tintColor);

  // Use inverted image as source if invert is on
  const src: HTMLImageElement | HTMLCanvasElement = s.invert ? invertImage(img, W, H) : img;

  if (s.direction === "diagonal") {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(W, 0); ctx.lineTo(0, H);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(src, 0, 0);
    if (s.grayLeft) {
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W, 0); ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(src, 0, 0);
    ctx.globalAlpha = s.tintOpacity;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.restore();
  } else {
    const vertical = s.direction === "vertical";
    ctx.save();
    ctx.beginPath();
    vertical ? ctx.rect(0, 0, W / 2, H) : ctx.rect(0, 0, W, H / 2);
    ctx.clip();
    ctx.drawImage(src, 0, 0);
    if (s.grayLeft) {
      ctx.globalCompositeOperation = "color";
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    vertical ? ctx.rect(W / 2, 0, W / 2, H) : ctx.rect(0, H / 2, W, H / 2);
    ctx.clip();
    ctx.drawImage(src, 0, 0);
    ctx.globalAlpha = s.tintOpacity;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = Math.max(1, W / 800);
    ctx.beginPath();
    if (vertical) { ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); }
    else { ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); }
    ctx.stroke();
  }
}

export function processGlitch(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  s: GlitchSettings
): void {
  const ctx = canvas.getContext("2d")!;
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const W = canvas.width, H = canvas.height;
  const [r1, g1, b1] = hexToRgb(s.color1);
  const [r2, g2, b2] = hexToRgb(s.color2);

  // Use inverted image as source if invert is on
  const src: HTMLImageElement | HTMLCanvasElement = s.invert ? invertImage(img, W, H) : img;

  // Draw base image (inverted or normal) first
  ctx.drawImage(src, 0, 0);

  // Render glitch bands on offscreen then composite at s.opacity
  const off = document.createElement("canvas");
  off.width = W; off.height = H;
  const octx = off.getContext("2d")!;

  for (let i = 0; i < s.stripeCount; i++) {
    const y = Math.random() * H;
    const h = (H / s.stripeCount) * (0.5 + Math.random());
    const shift = (Math.random() - 0.5) * s.intensity * W * 0.08;

    octx.save();
    octx.beginPath(); octx.rect(0, y, W, h); octx.clip();
    octx.drawImage(src, shift, 0);

    const useColor1 = i % 2 === 0;
    octx.globalAlpha = 0.18 + Math.random() * 0.12;
    octx.fillStyle = useColor1 ? `rgb(${r1},${g1},${b1})` : `rgb(${r2},${g2},${b2})`;
    octx.fillRect(0, y, W, h);
    octx.globalAlpha = 1;
    octx.restore();
  }

  ctx.globalAlpha = s.opacity;
  ctx.drawImage(off, 0, 0);
  ctx.globalAlpha = 1;
}

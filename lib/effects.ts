import type { Effect, Preset } from "./types";

export const DEFAULT_EFFECTS: Effect[] = [
  {
    id: "stripeWedge",
    label: "Stripe Wedge",
    icon: "◩",
    description: "Diagonal wedge filled with vertical stripes — the signature look",
    settings: {
      mode: "upper-right",
      angle: 30,
      originX: 1.0,
      stripeW: 2,
      gap: 4,
      opacity: 0.9,
      color: "#1133dd",
      invert: false,
    },
  },
  {
    id: "multiWedge",
    label: "Multi Wedge",
    icon: "▤",
    description: "Repeating wedge pattern across multiple vertical panels",
    settings: {
      count: 3,
      angle: 35,
      stripeW: 2,
      gap: 5,
      opacity: 0.9,
      color: "#1133dd",
      invert: false,
    },
  },
  {
    id: "splitTone",
    label: "Split Tone",
    icon: "◑",
    description: "Grayscale on one side, color tint on the other",
    settings: {
      direction: "vertical",
      tintColor: "#1133dd",
      tintOpacity: 0.55,
      grayLeft: true,
      invert: false,
    },
  },
  {
    id: "glitch",
    label: "Glitch",
    icon: "⚡",
    description: "Digital glitch displacement with color channel shift",
    settings: {
      intensity: 5,
      color1: "#1133dd",
      color2: "#dd1133",
      stripeCount: 12,
      opacity: 0.9,
      invert: false,
    },
  },
];

export const PRESETS: Preset[] = [
  {
    id: "classic-blue",
    name: "Classic Blue",
    effectId: "stripeWedge",
    settings: { mode: "upper-right", angle: 30, originX: 1.0, stripeW: 2, gap: 4, opacity: 0.9, color: "#1133dd", invert: false },
  },
  {
    id: "deep-navy",
    name: "Deep Navy",
    effectId: "stripeWedge",
    settings: { mode: "upper-right", angle: 25, originX: 0.85, stripeW: 3, gap: 5, opacity: 0.88, color: "#0022bb", invert: false },
  },
  {
    id: "lower-slash",
    name: "Lower Slash",
    effectId: "stripeWedge",
    settings: { mode: "lower-left", angle: 28, originX: 0.0, stripeW: 2, gap: 4, opacity: 0.9, color: "#0d28cc", invert: false },
  },
  {
    id: "dense-grid",
    name: "Dense Grid",
    effectId: "stripeWedge",
    settings: { mode: "upper-right", angle: 40, originX: 0.9, stripeW: 1, gap: 2, opacity: 0.95, color: "#1133dd", invert: false },
  },
  {
    id: "triple-wedge",
    name: "Triple Wedge",
    effectId: "multiWedge",
    settings: { count: 3, angle: 35, stripeW: 2, gap: 5, opacity: 0.9, color: "#1133dd", invert: false },
  },
  {
    id: "penta-wedge",
    name: "Penta Wedge",
    effectId: "multiWedge",
    settings: { count: 5, angle: 30, stripeW: 1, gap: 3, opacity: 0.92, color: "#0d28cc", invert: false },
  },
  {
    id: "split-vertical",
    name: "Split V",
    effectId: "splitTone",
    settings: { direction: "vertical", tintColor: "#1133dd", tintOpacity: 0.55, grayLeft: true, invert: false },
  },
  {
    id: "split-diagonal",
    name: "Split Diag",
    effectId: "splitTone",
    settings: { direction: "diagonal", tintColor: "#1133dd", tintOpacity: 0.6, grayLeft: true, invert: false },
  },
  {
    id: "glitch-blue-red",
    name: "Glitch BR",
    effectId: "glitch",
    settings: { intensity: 6, color1: "#1133dd", color2: "#dd1133", stripeCount: 14, opacity: 0.9, invert: false },
  },
];

export const BLUE_SWATCHES = [
  "#3d6cff", "#1133dd", "#0022bb", "#0d28cc",
  "#001199", "#334dff", "#112299", "#001166",
];

"use client";

import { useState, useEffect } from "react";
import type { Effect, EffectSettings } from "@/lib/types";
import { BLUE_SWATCHES } from "@/lib/effects";

interface Props {
  effect: Effect;
  onUpdate: (partial: Partial<EffectSettings>) => void;
}

function Slider({
  label, k, min, max, step = 1, dp = 0, s, onUpdate,
}: {
  label: string; k: string; min: number; max: number; step?: number; dp?: number;
  s: Record<string, unknown>; onUpdate: (p: Partial<EffectSettings>) => void;
}) {
  const val = s[k] as number;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-[9px] tracking-widest mb-1" style={{ color: "#111827" }}>
        <span>{label}</span>
        <span style={{ color: "#2563eb" }}>{val.toFixed(dp)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={val}
        onChange={(e) => onUpdate({ [k]: parseFloat(e.target.value) } as Partial<EffectSettings>)}
      />
    </div>
  );
}

function ColorPicker({
  label, k, s, onUpdate,
}: {
  label: string; k: string;
  s: Record<string, unknown>; onUpdate: (p: Partial<EffectSettings>) => void;
}) {
  const val = s[k] as string;
  const [text, setText] = useState(val);
  useEffect(() => { setText(val); }, [val]);

  function handleTextChange(raw: string) {
    setText(raw);
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      onUpdate({ [k]: hex } as Partial<EffectSettings>);
    }
  }

  return (
    <div className="mb-3">
      <div className="text-[9px] tracking-widest mb-1" style={{ color: "#111827" }}>{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="color" value={val}
          onChange={(e) => { onUpdate({ [k]: e.target.value } as Partial<EffectSettings>); setText(e.target.value); }}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={() => setText(val)}
          spellCheck={false}
          className="text-[10px] px-2 py-0.5 rounded border w-24"
          style={{ borderColor: "#d1d5db", background: "#f9fafb", color: "#111827", fontFamily: "monospace", outline: "none" }}
        />
      </div>
    </div>
  );
}

function Select({
  label, k, options, s, onUpdate,
}: {
  label: string; k: string; options: { v: string; l: string }[];
  s: Record<string, unknown>; onUpdate: (p: Partial<EffectSettings>) => void;
}) {
  const val = s[k] as string;
  return (
    <div className="mb-3">
      <div className="text-[9px] tracking-widest mb-1" style={{ color: "#111827" }}>{label}</div>
      <select
        value={val}
        onChange={(e) => onUpdate({ [k]: e.target.value } as Partial<EffectSettings>)}
        style={{ background: "#111827", color: "#ffffff", border: "1px solid #374151", borderRadius: "4px", padding: "4px 6px", width: "100%", fontFamily: "inherit", fontSize: "11px" }}
      >
        {options.map((o) => <option key={o.v} value={o.v} style={{ background: "#111827", color: "#ffffff" }}>{o.l}</option>)}
      </select>
    </div>
  );
}

function Toggle({
  label, k, s, onUpdate,
}: {
  label: string; k: string;
  s: Record<string, unknown>; onUpdate: (p: Partial<EffectSettings>) => void;
}) {
  const val = s[k] as boolean;
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-[9px] tracking-widest" style={{ color: "#111827" }}>{label}</span>
      <button
        onClick={() => onUpdate({ [k]: !val } as Partial<EffectSettings>)}
        className="w-10 h-5 rounded-full transition-all relative"
        style={{ background: val ? "#2563eb" : "#d1d5db" }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: val ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
    </div>
  );
}

function SwatchRow({
  k, s, onUpdate,
}: {
  k: string;
  s: Record<string, unknown>; onUpdate: (p: Partial<EffectSettings>) => void;
}) {
  return (
    <div className="flex gap-1 flex-wrap mb-3">
      {BLUE_SWATCHES.map((hex) => (
        <div
          key={hex}
          onClick={() => onUpdate({ [k]: hex } as Partial<EffectSettings>)}
          className="w-5 h-5 rounded cursor-pointer border border-transparent hover:scale-110 transition-transform"
          style={{ background: hex, outline: s[k] === hex ? `2px solid ${hex}` : "none", outlineOffset: "2px" }}
        />
      ))}
    </div>
  );
}

export default function ControlPanel({ effect, onUpdate }: Props) {
  const s = effect.settings as Record<string, unknown>;
  const p = { s, onUpdate };

  if (effect.id === "stripeWedge") return (
    <>
      <Select label="MODE" k="mode" options={[
        { v: "upper-right", l: "Upper Right" }, { v: "lower-left", l: "Lower Left" },
        { v: "upper-left", l: "Upper Left" }, { v: "lower-right", l: "Lower Right" },
      ]} {...p} />
      <Slider label="ANGLE °" k="angle" min={10} max={80} {...p} />
      <Slider label="ORIGIN X" k="originX" min={0} max={1} step={0.01} dp={2} {...p} />
      <Slider label="STRIPE WIDTH" k="stripeW" min={1} max={12} {...p} />
      <Slider label="GAP" k="gap" min={1} max={20} {...p} />
      <Slider label="OPACITY" k="opacity" min={0.05} max={1} step={0.01} dp={2} {...p} />
      <Toggle label="INVERT" k="invert" {...p} />
      <ColorPicker label="COLOR" k="color" {...p} />
      <SwatchRow k="color" {...p} />
    </>
  );

  if (effect.id === "multiWedge") return (
    <>
      <Slider label="PANEL COUNT" k="count" min={2} max={6} {...p} />
      <Slider label="ANGLE °" k="angle" min={10} max={80} {...p} />
      <Slider label="STRIPE WIDTH" k="stripeW" min={1} max={8} {...p} />
      <Slider label="GAP" k="gap" min={1} max={15} {...p} />
      <Slider label="OPACITY" k="opacity" min={0.05} max={1} step={0.01} dp={2} {...p} />
      <Toggle label="INVERT" k="invert" {...p} />
      <ColorPicker label="COLOR" k="color" {...p} />
      <SwatchRow k="color" {...p} />
    </>
  );

  if (effect.id === "splitTone") return (
    <>
      <Select label="DIRECTION" k="direction" options={[
        { v: "vertical", l: "Vertical" }, { v: "horizontal", l: "Horizontal" }, { v: "diagonal", l: "Diagonal" },
      ]} {...p} />
      <Toggle label="GRAY LEFT/TOP" k="grayLeft" {...p} />
      <Toggle label="INVERT" k="invert" {...p} />
      <ColorPicker label="TINT COLOR" k="tintColor" {...p} />
      <SwatchRow k="tintColor" {...p} />
      <Slider label="INTENSITY" k="tintOpacity" min={0} max={1} step={0.01} dp={2} {...p} />
    </>
  );

  if (effect.id === "glitch") return (
    <>
      <Slider label="INTENSITY" k="intensity" min={1} max={10} {...p} />
      <Slider label="STRIPE COUNT" k="stripeCount" min={5} max={20} {...p} />
      <Slider label="OPACITY" k="opacity" min={0.05} max={1} step={0.01} dp={2} {...p} />
      <Toggle label="INVERT" k="invert" {...p} />
      <ColorPicker label="COLOR A" k="color1" {...p} />
      <ColorPicker label="COLOR B" k="color2" {...p} />
    </>
  );

  return null;
}

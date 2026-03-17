"use client";

import { useRef, useState, useEffect } from "react";
import type { Effect, EffectId, EffectSettings, TextOverlay } from "@/lib/types";
import { PRESETS } from "@/lib/effects";
import ControlPanel from "./ControlPanel";

interface Props {
  image: HTMLImageElement | null;
  effects: Effect[];
  activeId: EffectId;
  onSelectEffect: (id: EffectId) => void;
  onImageLoad: (img: HTMLImageElement) => void;
  onUpdateSettings: (id: EffectId, partial: Partial<EffectSettings>) => void;
  textOverlay: TextOverlay;
  onUpdateTextOverlay: (partial: Partial<TextOverlay>) => void;
}

const FONT_OPTIONS = [
  { value: "Arial, sans-serif",        label: "Arial" },
  { value: "Georgia, serif",           label: "Georgia" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "Impact, sans-serif",       label: "Impact" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
];

export default function Sidebar({
  image, effects, activeId, onSelectEffect, onImageLoad, onUpdateSettings,
  textOverlay, onUpdateTextOverlay,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.type.match(/^image\//)) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => onImageLoad(img);
      img.src = src;
    };
    reader.readAsDataURL(file);
  }

  const activeEffect = effects.find((e) => e.id === activeId)!;
  const effectPresets = PRESETS.filter((p) => p.effectId === activeId);

  return (
    <aside
      className="border-r flex flex-col overflow-hidden flex-shrink-0"
      style={{ width: "374px", borderColor: "#e5e7eb", background: "#ffffff" }}
    >
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

        {/* Upload */}
        <div>
          <Label>Source</Label>
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full px-3 py-2 rounded text-[10px] tracking-wider border transition-all"
            style={{ fontFamily: "inherit", background: "#f9fafb", borderColor: "#d1d5db", color: "#111827" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "#111827"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#111827"; e.currentTarget.style.borderColor = "#d1d5db"; }}
          >
            {image ? "↺ Change Image" : "↑ Upload Image"}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        <Divider />

        {/* Effect selector */}
        <div>
          <Label>Effect</Label>
          <div className="flex flex-col gap-1">
            {effects.map((e) => (
              <button
                key={e.id}
                onClick={() => onSelectEffect(e.id)}
                className="w-full text-left px-3 py-2 rounded text-[10px] tracking-wider border transition-all flex items-center gap-2"
                style={{
                  fontFamily: "inherit",
                  background: e.id === activeId ? "#111827" : "transparent",
                  borderColor: e.id === activeId ? "#111827" : "#e5e7eb",
                  color: e.id === activeId ? "#ffffff" : "#111827",
                }}
              >
                <span style={{ opacity: 0.7 }}>{e.icon}</span>
                {e.label}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        {/* Presets */}
        {effectPresets.length > 0 && (
          <div>
            <Label>Presets</Label>
            <div className="grid grid-cols-2 gap-1">
              {effectPresets.map((pr) => (
                <button
                  key={pr.id}
                  onClick={() => onUpdateSettings(pr.effectId, pr.settings as Partial<EffectSettings>)}
                  className="px-2 py-1.5 rounded text-[9px] tracking-wider border transition-all"
                  style={{ fontFamily: "inherit", background: "#f9fafb", borderColor: "#e5e7eb", color: "#111827" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#111827"; e.currentTarget.style.color = "#ffffff"; e.currentTarget.style.borderColor = "#111827"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#111827"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                >
                  {pr.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Divider />

        {/* Effect Parameters */}
        <div>
          <Label>Parameters</Label>
          <ControlPanel
            effect={activeEffect}
            onUpdate={(partial) => onUpdateSettings(activeId, partial)}
          />
        </div>

        <Divider />

        {/* Text Overlay */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Text Overlay</Label>
            <button
              onClick={() => onUpdateTextOverlay({ enabled: !textOverlay.enabled })}
              className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
              style={{ background: textOverlay.enabled ? "#111827" : "#d1d5db" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                style={{ left: textOverlay.enabled ? "calc(100% - 18px)" : "2px" }}
              />
            </button>
          </div>

          {textOverlay.enabled && (
            <div className="flex flex-col gap-3">
              {/* Text input */}
              <div>
                <FieldLabel>TEXT</FieldLabel>
                <input
                  type="text"
                  value={textOverlay.text}
                  placeholder="Enter text…"
                  onChange={(e) => onUpdateTextOverlay({ text: e.target.value })}
                  className="w-full px-2 py-1.5 rounded border text-[11px]"
                  style={{ borderColor: "#d1d5db", background: "#f9fafb", color: "#111827", fontFamily: "inherit", outline: "none" }}
                />
              </div>

              {/* Font family */}
              <div>
                <FieldLabel>FONT</FieldLabel>
                <select
                  value={textOverlay.fontFamily}
                  onChange={(e) => onUpdateTextOverlay({ fontFamily: e.target.value })}
                  style={{ background: "#111827", color: "#ffffff", border: "1px solid #374151", borderRadius: "4px", padding: "4px 6px", width: "100%", fontFamily: "inherit", fontSize: "11px" }}
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.value} value={f.value} style={{ background: "#111827", color: "#ffffff" }}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Bold toggle */}
              <div className="flex items-center justify-between">
                <FieldLabel>BOLD</FieldLabel>
                <button
                  onClick={() => onUpdateTextOverlay({ bold: !textOverlay.bold })}
                  className="w-10 h-5 rounded-full transition-all relative"
                  style={{ background: textOverlay.bold ? "#111827" : "#d1d5db" }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: textOverlay.bold ? "calc(100% - 18px)" : "2px" }}
                  />
                </button>
              </div>

              {/* Font size */}
              <SliderRow
                label="SIZE"
                value={textOverlay.fontSize}
                min={1} max={20} step={0.5}
                display={`${textOverlay.fontSize}%`}
                onChange={(v) => onUpdateTextOverlay({ fontSize: v })}
              />

              {/* Color */}
              <TextColorPicker
                value={textOverlay.color}
                onChange={(c) => onUpdateTextOverlay({ color: c })}
              />

              {/* Opacity */}
              <SliderRow
                label="OPACITY"
                value={textOverlay.opacity}
                min={0} max={1} step={0.01}
                display={textOverlay.opacity.toFixed(2)}
                onChange={(v) => onUpdateTextOverlay({ opacity: v })}
              />

              {/* Position X */}
              <SliderRow
                label="POSITION X"
                value={textOverlay.x}
                min={0} max={1} step={0.01}
                display={textOverlay.x.toFixed(2)}
                onChange={(v) => onUpdateTextOverlay({ x: v })}
              />

              {/* Position Y */}
              <SliderRow
                label="POSITION Y"
                value={textOverlay.y}
                min={0} max={1} step={0.01}
                display={textOverlay.y.toFixed(2)}
                onChange={(v) => onUpdateTextOverlay({ y: v })}
              />
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] tracking-widest mb-2 font-semibold" style={{ color: "#6b7280" }}>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[9px] tracking-widest mb-1" style={{ color: "#111827" }}>
      {children}
    </div>
  );
}

function TextColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => { setText(value); }, [value]);

  function handleTextChange(raw: string) {
    setText(raw);
    const hex = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) onChange(hex);
  }

  return (
    <div>
      <FieldLabel>COLOR</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color" value={value}
          onChange={(e) => { onChange(e.target.value); setText(e.target.value); }}
        />
        <input
          type="text"
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={() => setText(value)}
          spellCheck={false}
          className="text-[10px] px-2 py-0.5 rounded border w-24"
          style={{ borderColor: "#d1d5db", background: "#f9fafb", color: "#111827", fontFamily: "monospace", outline: "none" }}
        />
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, step, display, onChange }: {
  label: string; value: number; min: number; max: number; step: number;
  display: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between text-[9px] tracking-widest mb-1">
        <span style={{ color: "#111827" }}>{label}</span>
        <span style={{ color: "#2563eb" }}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function Divider() {
  return <div className="h-px" style={{ background: "#f3f4f6" }} />;
}

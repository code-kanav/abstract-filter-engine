"use client";

import { useState, useRef } from "react";
import type { Effect } from "@/lib/types";
import {
  processStripeWedge, processMultiWedge, processDuotone,
  processBlurFocus, processSplitTone, processDiagonalSlice,
  processGlitch, processHalftone,
} from "@/lib/processors";
import type {
  StripeWedgeSettings, MultiWedgeSettings, DuotoneSettings,
  BlurFocusSettings, SplitToneSettings, DiagonalSliceSettings,
  GlitchSettings, HalftoneSettings,
} from "@/lib/types";

interface Props {
  image: HTMLImageElement;
  effects: Effect[];
  onClose: () => void;
}

interface ExportItem {
  effectId: string;
  label: string;
  selected: boolean;
  status: "idle" | "processing" | "done" | "error";
  dataUrl?: string;
}

function renderEffect(cv: HTMLCanvasElement, image: HTMLImageElement, effect: Effect) {
  const s = effect.settings;
  switch (effect.id) {
    case "stripeWedge":   processStripeWedge(cv, image, s as StripeWedgeSettings); break;
    case "multiWedge":    processMultiWedge(cv, image, s as MultiWedgeSettings); break;
    case "duotone":       processDuotone(cv, image, s as DuotoneSettings); break;
    case "blurFocus":     processBlurFocus(cv, image, s as BlurFocusSettings); break;
    case "splitTone":     processSplitTone(cv, image, s as SplitToneSettings); break;
    case "diagonalSlice": processDiagonalSlice(cv, image, s as DiagonalSliceSettings); break;
    case "glitch":        processGlitch(cv, image, s as GlitchSettings); break;
    case "halftone":      processHalftone(cv, image, s as HalftoneSettings); break;
  }
}

export default function BatchExportModal({ image, effects, onClose }: Props) {
  const [items, setItems] = useState<ExportItem[]>(
    effects.map((e) => ({ effectId: e.id, label: e.label, selected: true, status: "idle" }))
  );
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);

  function toggleItem(id: string) {
    setItems((prev) => prev.map((it) => it.effectId === id ? { ...it, selected: !it.selected } : it));
  }

  function toggleAll(val: boolean) {
    setItems((prev) => prev.map((it) => ({ ...it, selected: val })));
  }

  async function runExport() {
    setExporting(true);
    const cv = document.createElement("canvas");
    offscreenRef.current = cv;
    const results: ExportItem[] = [...items];

    for (let i = 0; i < results.length; i++) {
      if (!results[i].selected) continue;
      setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: "processing" } : it));
      await new Promise((res) => setTimeout(res, 10));
      try {
        const effect = effects.find((e) => e.id === results[i].effectId)!;
        renderEffect(cv, image, effect);
        const dataUrl = cv.toDataURL("image/png");
        results[i] = { ...results[i], status: "done", dataUrl };
        setItems([...results]);
      } catch {
        results[i] = { ...results[i], status: "error" };
        setItems([...results]);
      }
    }

    setExporting(false);
    setDone(true);
  }

  async function downloadAll() {
    const { default: JSZip } = await import("jszip");
    const { saveAs } = await import("file-saver");
    const zip = new JSZip();
    for (const it of items) {
      if (it.status === "done" && it.dataUrl) {
        const base64 = it.dataUrl.split(",")[1];
        zip.file(`abstract-${it.effectId}.png`, base64, { base64: true });
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "abstract-filters.zip");
  }

  const selectedCount = items.filter((it) => it.selected).length;
  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-96 rounded-lg border overflow-hidden animate-slide-up"
        style={{ background: "#08091a", borderColor: "#1a1d38" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#0e1028" }}>
          <span className="text-[10px] tracking-widest" style={{ color: "#3a4a8a" }}>BATCH EXPORT</span>
          <button onClick={onClose} className="text-[12px]" style={{ color: "#2e3560" }}>✕</button>
        </div>

        {/* Effect list */}
        <div className="px-5 py-4">
          <div className="flex justify-between mb-3">
            <span className="text-[9px] tracking-widest" style={{ color: "#2e3560" }}>
              {selectedCount} SELECTED
            </span>
            <div className="flex gap-3">
              <button onClick={() => toggleAll(true)} className="text-[9px] tracking-widest" style={{ color: "#3d6cff", fontFamily: "inherit" }}>ALL</button>
              <button onClick={() => toggleAll(false)} className="text-[9px] tracking-widest" style={{ color: "#2e3560", fontFamily: "inherit" }}>NONE</button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {items.map((it) => (
              <div
                key={it.effectId}
                onClick={() => !exporting && toggleItem(it.effectId)}
                className="flex items-center justify-between px-3 py-2 rounded border cursor-pointer transition-all"
                style={{
                  borderColor: it.selected ? "#1e3a8a" : "#1a1d38",
                  background: it.selected ? "rgba(61,108,255,0.04)" : "transparent",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all"
                    style={{
                      borderColor: it.selected ? "#3d6cff" : "#1e2450",
                      background: it.selected ? "#3d6cff" : "transparent",
                    }}
                  >
                    {it.selected && <span style={{ color: "#fff", fontSize: "8px" }}>✓</span>}
                  </div>
                  <span className="text-[10px] tracking-wider" style={{ color: it.selected ? "#8090c0" : "#2e3560" }}>
                    {it.label}
                  </span>
                </div>
                <StatusBadge status={it.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {exporting && (
          <div className="px-5 pb-2">
            <div className="h-0.5 rounded-full overflow-hidden" style={{ background: "#0e1028" }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ background: "#3d6cff", width: `${(doneCount / selectedCount) * 100}%` }}
              />
            </div>
            <div className="text-[9px] tracking-widest mt-1.5 text-center" style={{ color: "#2e3560" }}>
              {doneCount}/{selectedCount} PROCESSED
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t flex gap-2 justify-end" style={{ borderColor: "#0e1028" }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-[9px] tracking-widest border"
            style={{ fontFamily: "inherit", borderColor: "#1e2450", color: "#3a4a7a" }}
          >
            CANCEL
          </button>
          {done ? (
            <button
              onClick={downloadAll}
              className="px-4 py-2 rounded text-[9px] tracking-widest"
              style={{ fontFamily: "inherit", background: "#3d6cff", color: "#fff" }}
            >
              ↓ DOWNLOAD ZIP ({doneCount})
            </button>
          ) : (
            <button
              onClick={runExport}
              disabled={exporting || selectedCount === 0}
              className="px-4 py-2 rounded text-[9px] tracking-widest transition-all"
              style={{
                fontFamily: "inherit",
                background: exporting || selectedCount === 0 ? "#1a1d38" : "#3d6cff",
                color: exporting || selectedCount === 0 ? "#3a4a7a" : "#fff",
                cursor: exporting || selectedCount === 0 ? "not-allowed" : "pointer",
              }}
            >
              {exporting ? "PROCESSING…" : `EXPORT ${selectedCount}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ExportItem["status"] }) {
  if (status === "idle") return null;
  const map = {
    processing: { label: "…", color: "#e8ff47" },
    done: { label: "✓", color: "#10b981" },
    error: { label: "✕", color: "#ef4444" },
  };
  const { label, color } = map[status as keyof typeof map];
  return <span className="text-[10px]" style={{ color }}>{label}</span>;
}

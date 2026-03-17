"use client";

import type { Effect } from "@/lib/types";

type ViewMode = "single" | "before-after";

interface Props {
  hasImage: boolean;
  activeEffect: Effect;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onDownload: () => void;
}

export default function Header({
  hasImage,
  activeEffect,
  viewMode,
  onViewModeChange,
  onDownload,
}: Props) {
  return (
    <header className="h-12 border-b flex items-center justify-between px-5 flex-shrink-0 z-10"
      style={{ borderColor: "#e5e7eb", background: "#ffffff" }}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-brand-600 rounded-sm flex items-center justify-center text-[10px] font-bold text-white"
          style={{ transform: "rotate(45deg)" }}>
          <span style={{ transform: "rotate(-45deg)" }}>A</span>
        </div>
        <span className="font-display font-black text-sm tracking-widest" style={{ color: "#111827" }}>
          ARISE
        </span>
        <span className="text-[9px] tracking-widest" style={{ color: "#6b7280" }}>
          Image Enhancement Playground 
        </span>
        {hasImage && (
          <span className="ml-2 text-[9px] tracking-widest px-2 py-0.5 rounded border"
            style={{ color: "#111827", borderColor: "#d1d5db", background: "#f3f4f6" }}>
            {activeEffect.icon} {activeEffect.label.toUpperCase()}
          </span>
        )}
      </div>

      {hasImage && (
        <div className="flex items-center gap-2">
          <ViewToggle viewMode={viewMode} onChange={onViewModeChange} />
          <HeaderBtn onClick={onDownload}>↓ Download Hi-Res Image</HeaderBtn>
        </div>
      )}
    </header>
  );
}

function ViewToggle({ viewMode, onChange }: { viewMode: "single" | "before-after"; onChange: (m: "single" | "before-after") => void }) {
  return (
    <div className="flex rounded overflow-hidden border text-[9px] tracking-widest"
      style={{ borderColor: "#d1d5db" }}>
      {(["single", "before-after"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className="px-3 py-1.5 transition-colors"
          style={{
            background: viewMode === m ? "#f3f4f6" : "transparent",
            color: viewMode === m ? "#111827" : "#6b7280",
            fontFamily: "inherit",
          }}
        >
          {m === "single" ? "SINGLE" : "BEFORE/AFTER"}
        </button>
      ))}
    </div>
  );
}

function HeaderBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded text-[9px] tracking-widest border transition-all"
      style={{ fontFamily: "inherit", background: "transparent", borderColor: "#d1d5db", color: "#374151" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#111827"; e.currentTarget.style.color = "#111827"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; e.currentTarget.style.color = "#374151"; }}
    >
      {children}
    </button>
  );
}

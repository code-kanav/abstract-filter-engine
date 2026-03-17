"use client";

import { useState, useCallback, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import CanvasView from "@/components/CanvasView";
import Header from "@/components/Header";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { DEFAULT_EFFECTS } from "@/lib/effects";
import type { Effect, EffectId, EffectSettings, TextOverlay } from "@/lib/types";

type ViewMode = "single" | "before-after";

const DEFAULT_TEXT_OVERLAY: TextOverlay = {
  enabled: false,
  text: "",
  fontSize: 8,
  color: "#ffffff",
  x: 0.5,
  y: 0.5,
  opacity: 1,
  fontFamily: "Arial, sans-serif",
  bold: false,
};

export default function Home() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [effects, setEffects] = useState<Effect[]>(DEFAULT_EFFECTS);
  const [activeId, setActiveId] = useState<EffectId>("stripeWedge");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [textOverlay, setTextOverlay] = useState<TextOverlay>(DEFAULT_TEXT_OVERLAY);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeEffect = effects.find((e) => e.id === activeId)!;

  const handleImageLoad = useCallback((img: HTMLImageElement) => {
    setImage(img);
  }, []);

  const updateSettings = useCallback(
    (id: EffectId, partial: Partial<EffectSettings>) => {
      setEffects((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, settings: { ...e.settings, ...partial } } : e
        )
      );
    },
    []
  );

  const updateTextOverlay = useCallback((partial: Partial<TextOverlay>) => {
    setTextOverlay((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleDownload = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const a = document.createElement("a");
    a.download = `arise-${activeEffect.id}.png`;
    a.href = cv.toDataURL("image/png");
    a.click();
  }, [activeEffect]);

  return (
    <div className="flex flex-col h-screen">
      <Header
        hasImage={!!image}
        activeEffect={activeEffect}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onDownload={handleDownload}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          image={image}
          effects={effects}
          activeId={activeId}
          onSelectEffect={setActiveId}
          onImageLoad={handleImageLoad}
          onUpdateSettings={updateSettings}
          textOverlay={textOverlay}
          onUpdateTextOverlay={updateTextOverlay}
        />

        <main className="flex-1 bg-gray-100 flex items-center justify-center overflow-hidden relative">
          {!image ? (
            <EmptyState />
          ) : viewMode === "before-after" ? (
            <BeforeAfterSlider image={image} effect={activeEffect} />
          ) : (
            <CanvasView image={image} effect={activeEffect} canvasRef={canvasRef} textOverlay={textOverlay} onUpdateTextOverlay={updateTextOverlay} />
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center select-none animate-fade-in">
      <div
        className="font-display font-black leading-none tracking-tighter"
        style={{ fontSize: "clamp(48px, 10vw, 96px)", color: "#d1d5db" }}
      >
        UPLOAD
      </div>
      <div className="text-[9px] tracking-[0.3em] mt-3" style={{ color: "#9ca3af" }}>
        AN IMAGE TO BEGIN
      </div>
    </div>
  );
}

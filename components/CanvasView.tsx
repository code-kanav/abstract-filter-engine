"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import type { Effect, TextOverlay } from "@/lib/types";
import {
  processStripeWedge, processMultiWedge,
  processSplitTone, processGlitch,
} from "@/lib/processors";
import type {
  StripeWedgeSettings, MultiWedgeSettings,
  SplitToneSettings, GlitchSettings,
} from "@/lib/types";

interface Props {
  image: HTMLImageElement;
  effect: Effect;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  textOverlay: TextOverlay;
  onUpdateTextOverlay: (partial: Partial<TextOverlay>) => void;
}

export default function CanvasView({ image, effect, canvasRef, textOverlay, onUpdateTextOverlay }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const [isSelected, setIsSelected] = useState(false);

  const render = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv || !image) return;
    const s = effect.settings;

    switch (effect.id) {
      case "stripeWedge":   processStripeWedge(cv, image, s as StripeWedgeSettings); break;
      case "multiWedge":    processMultiWedge(cv, image, s as MultiWedgeSettings); break;
      case "splitTone":     processSplitTone(cv, image, s as SplitToneSettings); break;
      case "glitch":        processGlitch(cv, image, s as GlitchSettings); break;
    }

    if (textOverlay.enabled && textOverlay.text.trim()) {
      const ctx = cv.getContext("2d")!;
      const scaledSize = (textOverlay.fontSize / 100) * Math.min(cv.width, cv.height);
      ctx.save();
      ctx.globalAlpha = textOverlay.opacity;
      ctx.font = `${textOverlay.bold ? "bold " : ""}${scaledSize}px ${textOverlay.fontFamily}`;
      ctx.fillStyle = textOverlay.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.6)";
      ctx.shadowBlur = scaledSize * 0.08;
      ctx.fillText(textOverlay.text, cv.width * textOverlay.x, cv.height * textOverlay.y);
      ctx.restore();
    }
  }, [image, effect, canvasRef, textOverlay]);

  useEffect(() => { render(); }, [render]);

  // Arrow key nudging
  useEffect(() => {
    if (!isSelected || !textOverlay.enabled) return;
    const STEP = 0.005;
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowLeft":  e.preventDefault(); onUpdateTextOverlay({ x: Math.max(0, textOverlay.x - STEP) }); break;
        case "ArrowRight": e.preventDefault(); onUpdateTextOverlay({ x: Math.min(1, textOverlay.x + STEP) }); break;
        case "ArrowUp":    e.preventDefault(); onUpdateTextOverlay({ y: Math.max(0, textOverlay.y - STEP) }); break;
        case "ArrowDown":  e.preventDefault(); onUpdateTextOverlay({ y: Math.min(1, textOverlay.y + STEP) }); break;
        case "Escape":     setIsSelected(false); break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSelected, textOverlay, onUpdateTextOverlay]);

  // Deselect when clicking outside the container
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function getPosFromClient(clientX: number, clientY: number) {
    const cv = canvasRef.current;
    if (!cv) return null;
    const rect = cv.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }

  // Returns screen-space rect of the text on the canvas element
  function getTextScreenRect() {
    const cv = canvasRef.current;
    const container = containerRef.current;
    if (!cv || !container || !textOverlay.text.trim()) return null;

    const cvRect = cv.getBoundingClientRect();
    const conRect = container.getBoundingClientRect();

    // Approximate text dimensions based on font size ratio
    const scaledSize = (textOverlay.fontSize / 100) * Math.min(cvRect.width, cvRect.height);
    const approxWidth  = textOverlay.text.length * scaledSize * 0.6;
    const approxHeight = scaledSize * 1.3;

    const cx = (cvRect.left - conRect.left) + textOverlay.x * cvRect.width;
    const cy = (cvRect.top  - conRect.top)  + textOverlay.y * cvRect.height;

    return {
      left:   cx - approxWidth  / 2,
      top:    cy - approxHeight / 2,
      width:  approxWidth,
      height: approxHeight,
    };
  }

  // Returns true if the client coords are within the text bounding box
  function isOnText(clientX: number, clientY: number): boolean {
    const cv = canvasRef.current;
    if (!cv || !textOverlay.text.trim()) return false;
    const cvRect = cv.getBoundingClientRect();
    const scaledSize = (textOverlay.fontSize / 100) * Math.min(cvRect.width, cvRect.height);
    const approxWidth  = textOverlay.text.length * scaledSize * 0.6;
    const approxHeight = scaledSize * 1.3;
    const cx = cvRect.left + textOverlay.x * cvRect.width;
    const cy = cvRect.top  + textOverlay.y * cvRect.height;
    const padding = 8;
    return (
      clientX >= cx - approxWidth  / 2 - padding &&
      clientX <= cx + approxWidth  / 2 + padding &&
      clientY >= cy - approxHeight / 2 - padding &&
      clientY <= cy + approxHeight / 2 + padding
    );
  }

  function onMouseDown(e: React.MouseEvent) {
    if (!textOverlay.enabled) return;
    if (isOnText(e.clientX, e.clientY)) {
      e.preventDefault();
      isDragging.current = true;
      hasMoved.current = false;
      setIsSelected(true);
    } else {
      // Clicked outside text — deselect only
      isDragging.current = false;
      setIsSelected(false);
    }
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!isDragging.current || !textOverlay.enabled) return;
    hasMoved.current = true;
    const pos = getPosFromClient(e.clientX, e.clientY);
    if (pos) onUpdateTextOverlay(pos);
  }

  function onMouseUp() {
    isDragging.current = false;
    hasMoved.current = false;
  }

  function onTouchStart(e: React.TouchEvent) {
    if (!textOverlay.enabled) return;
    const t = e.touches[0];
    if (isOnText(t.clientX, t.clientY)) {
      isDragging.current = true;
      hasMoved.current = false;
      setIsSelected(true);
    } else {
      isDragging.current = false;
      setIsSelected(false);
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging.current || !textOverlay.enabled) return;
    e.preventDefault();
    hasMoved.current = true;
    const t = e.touches[0];
    const pos = getPosFromClient(t.clientX, t.clientY);
    if (pos) onUpdateTextOverlay(pos);
  }

  const textRect = isSelected && textOverlay.enabled && textOverlay.text.trim() ? getTextScreenRect() : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center p-4"
      style={{ cursor: "default", userSelect: "none" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      <canvas
        ref={canvasRef}
        className="max-w-full max-h-full object-contain rounded-sm animate-fade-in"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}
      />

      {/* Selection border around text */}
      {textRect && (
        <div
          style={{
            position: "absolute",
            left: textRect.left,
            top: textRect.top,
            width: textRect.width,
            height: textRect.height,
            border: "1.5px dashed rgba(255,255,255,0.9)",
            outline: "1px solid rgba(0,0,0,0.4)",
            borderRadius: 3,
            pointerEvents: "none",
            boxSizing: "border-box",
          }}
        />
      )}

      {/* Hint shown when text overlay is enabled but no text entered yet */}
      {textOverlay.enabled && !textOverlay.text.trim() && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            fontSize: 11,
            padding: "4px 12px",
            borderRadius: 6,
            pointerEvents: "none",
            letterSpacing: "0.05em",
          }}
        >
          Enter text in the sidebar, then click or drag to place it
        </div>
      )}
    </div>
  );
}

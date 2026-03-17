"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Effect } from "@/lib/types";
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
}

export default function BeforeAfterSlider({ image, effect }: Props) {
  const beforeRef = useRef<HTMLCanvasElement>(null);
  const afterRef  = useRef<HTMLCanvasElement>(null);

  const renderBefore = useCallback(() => {
    const cv = beforeRef.current;
    if (!cv || !image) return;
    cv.width  = image.naturalWidth;
    cv.height = image.naturalHeight;
    cv.getContext("2d")!.drawImage(image, 0, 0);
  }, [image]);

  const renderAfter = useCallback(() => {
    const cv = afterRef.current;
    if (!cv || !image) return;
    const s = effect.settings;
    switch (effect.id) {
      case "stripeWedge":   processStripeWedge(cv, image, s as StripeWedgeSettings); break;
      case "multiWedge":    processMultiWedge(cv, image, s as MultiWedgeSettings); break;
      case "splitTone":     processSplitTone(cv, image, s as SplitToneSettings); break;
      case "glitch":        processGlitch(cv, image, s as GlitchSettings); break;
    }
  }, [image, effect]);

  useEffect(() => { renderBefore(); }, [renderBefore]);
  useEffect(() => { renderAfter();  }, [renderAfter]);

  return (
    <div className="w-full h-full flex items-center justify-center p-4 gap-4">

      {/* BEFORE */}
      <div className="flex-1 flex flex-col items-center gap-2 min-w-0 h-full">
        <span
          className="text-[9px] tracking-widest px-3 py-1 rounded-full font-semibold"
          style={{ background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" }}
        >
          BEFORE
        </span>
        <div className="flex-1 flex items-center justify-center min-h-0 w-full">
          <canvas
            ref={beforeRef}
            className="max-w-full max-h-full object-contain rounded-sm"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
          />
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, alignSelf: "stretch", background: "#e5e7eb", flexShrink: 0 }} />

      {/* AFTER */}
      <div className="flex-1 flex flex-col items-center gap-2 min-w-0 h-full">
        <span
          className="text-[9px] tracking-widest px-3 py-1 rounded-full font-semibold"
          style={{ background: "#111827", color: "#ffffff", border: "1px solid #111827" }}
        >
          AFTER
        </span>
        <div className="flex-1 flex items-center justify-center min-h-0 w-full">
          <canvas
            ref={afterRef}
            className="max-w-full max-h-full object-contain rounded-sm"
            style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}
          />
        </div>
      </div>

    </div>
  );
}

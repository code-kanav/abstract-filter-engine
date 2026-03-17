export type EffectId =
  | "stripeWedge"
  | "multiWedge"
  | "splitTone"
  | "glitch";

export interface StripeWedgeSettings {
  mode: "upper-right" | "lower-left" | "upper-left" | "lower-right";
  angle: number;
  originX: number;
  stripeW: number;
  gap: number;
  opacity: number;
  color: string;
  invert: boolean;
}

export interface MultiWedgeSettings {
  count: number;
  angle: number;
  stripeW: number;
  gap: number;
  opacity: number;
  color: string;
  invert: boolean;
}

export interface SplitToneSettings {
  direction: "vertical" | "horizontal" | "diagonal";
  tintColor: string;
  tintOpacity: number;
  grayLeft: boolean;
  invert: boolean;
}

export interface GlitchSettings {
  intensity: number;
  color1: string;
  color2: string;
  stripeCount: number;
  opacity: number;
  invert: boolean;
}

export type EffectSettings =
  | StripeWedgeSettings
  | MultiWedgeSettings
  | SplitToneSettings
  | GlitchSettings;

export interface TextOverlay {
  enabled: boolean;
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  opacity: number;
  fontFamily: string;
  bold: boolean;
}

export interface Effect {
  id: EffectId;
  label: string;
  icon: string;
  description: string;
  settings: EffectSettings;
}

export interface Preset {
  id: string;
  name: string;
  effectId: EffectId;
  settings: EffectSettings;
  thumbnail?: string;
}

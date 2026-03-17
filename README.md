# Abstract Filter Engine

A Next.js 14 app for applying diagonal stripe wedge and abstract visual filters to images — inspired by the blue stripe/wedge aesthetic seen in editorial and creative photography.

## Features

- **8 Effects** — Stripe Wedge, Multi Wedge, Duotone, Blur+Focus, Split Tone, Diagonal Slice, Glitch, Halftone
- **14+ Presets** — One-click starting points for each effect
- **Live preview** — Real-time canvas rendering as you adjust sliders
- **Before/After slider** — Drag to compare original vs filtered
- **AI Suggestions** — Claude analyzes your image and recommends filter settings
- **Batch Export** — Process all effects and download as a `.zip`
- **Single Download** — Export the current filtered image as PNG

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Canvas API (offscreen processing)
- Anthropic SDK (AI suggestions)
- JSZip + FileSaver (batch export)
- Framer Motion (animations)

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get your key at https://console.anthropic.com

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production

```bash
npm run build
npm start
```

## Usage

1. **Upload an image** — drag & drop or click the upload zone (JPG, PNG, WEBP)
2. **Select an effect** from the left sidebar
3. **Choose a preset** or adjust the parameter sliders
4. **Switch views** — use SINGLE or BEFORE/AFTER toggle in the header
5. **AI Suggest** — click ✦ AI Suggest to get Claude's recommendations for your image
6. **Batch Export** — export all 8 effects at once as a ZIP file
7. **Download** — save the current result as PNG

## Project Structure

```
abstract-app/
├── app/
│   ├── globals.css          # Base styles, custom scrollbar, range/color inputs
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Main page — state orchestration
│   └── api/
│       └── ai-suggest/
│           └── route.ts     # Anthropic API route for image analysis
├── components/
│   ├── Header.tsx           # Top bar — view toggle, batch, AI buttons
│   ├── Sidebar.tsx          # Upload, effect list, preset grid
│   ├── ControlPanel.tsx     # Per-effect parameter sliders/controls
│   ├── CanvasView.tsx       # Main canvas renderer + download button
│   ├── BeforeAfterSlider.tsx # Drag-to-compare view
│   ├── BatchExportModal.tsx  # Multi-effect export with ZIP download
│   └── AIPanel.tsx          # AI suggestions modal
├── lib/
│   ├── types.ts             # TypeScript types for all effects and settings
│   ├── effects.ts           # Default effect configs, presets, duotone presets
│   └── processors.ts        # Pure canvas processing functions (reusable)
└── public/
```

## Adding New Effects

1. Add the type to `lib/types.ts`
2. Add the processor function to `lib/processors.ts`
3. Add the default config to `DEFAULT_EFFECTS` in `lib/effects.ts`
4. Add presets to `PRESETS` in `lib/effects.ts`
5. Add controls to `ControlPanel.tsx`
6. Add the switch case to `CanvasView.tsx` and `BeforeAfterSlider.tsx`

## AI Suggestions

The AI route sends your image to Claude and gets back 3 filter recommendations with specific settings tuned to the image's content, mood, and composition. Requires `ANTHROPIC_API_KEY` in `.env.local`.

If you don't have an API key, the rest of the app works fully without it.

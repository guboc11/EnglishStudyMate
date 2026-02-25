# EnglishStudyMate

EnglishStudyMate is a mobile-first English expression learning app.
Instead of direct translation memorization, it exposes learners to progressively richer context using AI-generated stories and images.

## Current Status (February 2026)

Implemented in `Product/apps/mobile`:
- Home search flow
- Meaning gate (sense + domain selection for ambiguous inputs)
- AI-generated learning bundle via backend (4-step progressive disclosure)
- Search history and meaning detail screen

**4-Step Learning Flow:**
1. **Step 1 (맥락 문장)** — single sentence with natural context, no media
2. **Step 2 (짧은 이야기)** — 2-sentence story + AI-generated image
3. **Step 3 (심화 이야기)** — 3–4 sentence story + AI-generated image
4. **Step 4 (뜻 보기)** — Korean meaning, nuance, etymology, short example

Backend implemented in `Product/apps/backend`:
- Real-time Gemini API calls (text + image) executed server-side
- CORS + rate limit baseline enabled

## Tech Stack

- App: React Native + Expo
- Backend: Node.js + Express
- Package manager: pnpm
- AI APIs: Gemini 2.0 Flash (text), Gemini 2.5 Flash Image (image)

## Quick Start

### 1. Prerequisites

- Node.js 20+ recommended
- `pnpm` installed globally

### 2. Install

```bash
cd Product/apps/mobile
pnpm install

cd ../backend
pnpm install
```

### 3. Environment Variables

Create `.env` in `Product/apps/backend`:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
ALLOWED_ORIGINS=http://localhost:8081
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=40
```

Create `.env` in `Product/apps/mobile`:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:8787
```

### 4. Run (Development)

Start backend:

```bash
cd Product/apps/backend
pnpm start
```

Start Expo app:

```bash
cd Product/apps/mobile
pnpm start
```

Then launch with Expo options:
- iOS simulator
- Android emulator
- Web preview

## Scripts

Run inside `Product/apps/mobile`:
- `pnpm start`: Expo development server
- `pnpm ios`: Start and open iOS target
- `pnpm android`: Start and open Android target
- `pnpm web`: Start web target

Run inside `Product/apps/backend`:
- `pnpm start`: Start Express API server
- `pnpm dev`: Start Express API server in watch mode

## Deploy on Render (Static + Web Service)

### Service A: Static Site (Expo Web)
- Root Directory: `Product/apps/mobile`
- Build Command: `pnpm install && pnpm exec expo export --platform web`
- Publish Directory: `dist`
- Env: `EXPO_PUBLIC_API_BASE_URL=<your_backend_url>`

### Service B: Web Service (Express API)
- Root Directory: `Product/apps/backend`
- Build Command: `pnpm install`
- Start Command: `pnpm start`
- Env:
  - `GEMINI_API_KEY` (required)
  - `GEMINI_MODEL` (optional)
  - `GEMINI_IMAGE_MODEL` (optional)
  - `ALLOWED_ORIGINS=<your_static_site_url>`
  - `RATE_LIMIT_WINDOW_MS` (optional)
  - `RATE_LIMIT_MAX` (optional)

## Troubleshooting

- Missing backend API base URL:
  - Symptom: client fails immediately with missing API base URL error
  - Fix: ensure `EXPO_PUBLIC_API_BASE_URL` is set in `Product/apps/mobile/.env`

- Missing server API key:
  - Symptom: backend returns generation failure
  - Fix: ensure `GEMINI_API_KEY` is set in `Product/apps/backend/.env`

- Image generation is slow or fails:
  - Step 2 and Step 3 images are generated on-demand via Gemini Image API
  - Use the "이미지 다시 생성" button to retry if it fails

## Repository Structure

- `Product/apps/mobile`: runnable Expo app
- `Product/apps/backend`: Express API server (Gemini text + image)
- `scripts/`: batch content generation CLI tools (배치 전용)
- `Product/docs/UI_PROTO_TECH_SPEC.md`: technical spec
- `Execution/Plans/UI_PROTO_SPEC.md`: product/UI flow spec
- `Foundation/`: mission, principles, strategy, operating model

## Reference Docs

- Product spec: `Execution/Plans/UI_PROTO_SPEC.md`
- Technical spec: `Product/docs/UI_PROTO_TECH_SPEC.md`
- Mission: `Foundation/direction/MISSION.md`
- Principles: `Foundation/direction/PRINCIPLES.md`
- Strategy: `Foundation/Strategy/STRATEGY.md`

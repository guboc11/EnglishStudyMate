# EnglishStudyMate

EnglishStudyMate is a mobile-first English expression learning app.
Instead of direct translation memorization, it focuses on repeated contextual exposure and recall with AI-generated learning content.

## Current Status (February 2026)

Implemented in `Product/apps/mobile`:
- Home search flow
- Meaning gate (sense + domain selection for ambiguous inputs)
- AI-generated learning bundle (example/review stories + meaning summary)
- Example flow (text, image, and video generation experiment on Example 3)
- Review flow with generated images
- Search history and meaning detail screen

## Tech Stack

- App: React Native + Expo
- Package manager: pnpm
- AI APIs: Gemini text/image + Veo (video experiment)

## Quick Start

### 1. Prerequisites

- Node.js 20+ recommended
- `pnpm` installed globally

### 2. Install

```bash
cd Product/apps/mobile
pnpm install
```

### 3. Environment Variables

Create `.env` in `Product/apps/mobile`:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
EXPO_PUBLIC_VEO_MODEL=veo-3.1-generate-preview
```

Variable notes:
- `EXPO_PUBLIC_GEMINI_API_KEY`: required
- `EXPO_PUBLIC_GEMINI_IMAGE_MODEL`: optional, defaults to `gemini-2.5-flash-image`
- `EXPO_PUBLIC_VEO_MODEL`: optional, defaults to `veo-3.1-generate-preview`

### 4. Run (Development)

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

## Deploy on Render (Static Site)

Use Render **Static Site** settings:

- Root Directory: `Product/apps/mobile`
- Build Command: `pnpm install && pnpm exec expo export --platform web`
- Publish Directory: `dist`
- Start Command: leave empty

## Troubleshooting

- Missing API key:
  - Symptom: generation fails immediately
  - Fix: ensure `EXPO_PUBLIC_GEMINI_API_KEY` is set in `.env`

- Example 3 video generation is slow/fails:
  - Veo uses long-running operations and may take over a minute
  - Retry from the Example 3 screen if request times out or fails

- Render build fails:
  - Confirm service type is Static Site
  - Confirm Root Directory is `Product/apps/mobile`
  - Confirm Publish Directory is `dist`

## Repository Structure

- `Product/apps/mobile`: runnable Expo app
- `Product/docs/UI_PROTO_TECH_SPEC.md`: technical spec
- `Execution/Plans/UI_PROTO_SPEC.md`: product/UI flow spec
- `Foundation/`: mission, principles, strategy, operating model

## Reference Docs

- Product spec: `Execution/Plans/UI_PROTO_SPEC.md`
- Technical spec: `Product/docs/UI_PROTO_TECH_SPEC.md`
- Mission: `Foundation/direction/MISSION.md`
- Principles: `Foundation/direction/PRINCIPLES.md`
- Strategy: `Foundation/Strategy/STRATEGY.md`

# Lumen — AI Media Studio

> Generate, compose, and direct media with AI.

Lumen is an AI media-generation app with three connected surfaces:

- **Studio** — generate image / video / audio from leading model APIs (Fal.ai, Replicate, ElevenLabs).
- **Flows** — a node-based canvas to chain creative steps (prompt → image → video → audio).
- **Chat** — a conversational interface with tool calling that generates assets and builds flows.

Dark-first UI, single accent, built to feel between Linear and Higgsfield.

## Demo

**Studio** — generate image / video / audio. Runs in mock mode without API keys.

![Studio](docs/studio.png)

**Chat** — describe what you want; the assistant calls tools and the result lands inline (and in your Studio gallery).

![Chat](docs/chat.png)

**Flows** — chain a prompt into image/video/audio nodes and run the graph end to end.

![Flows](docs/flows.png)

> Screenshots are running in **mock mode** (no API keys) — the gradient placeholders are the mock provider.
> With real keys the same UI shows real model output.

## Setup (3 steps)

```bash
# 1. Install
pnpm install

# 2. Configure (optional — runs without keys in mock mode)
cp .env.example .env.local   # add FAL_KEY / ANTHROPIC_API_KEY / ELEVENLABS_API_KEY if you have them

# 3. Run
pnpm dev                     # http://localhost:3000
```

**Runs with zero keys.** Without API keys, the provider layer falls back to a `mock` that returns
placeholder media so you can explore every surface. Add keys to `.env.local` for real generation.

## Stack

Next.js 16 (App Router) · TypeScript strict · Tailwind v4 · shadcn/ui (base-ui) · Vercel AI SDK ·
Fal.ai + Replicate + ElevenLabs (behind a unified provider layer) · React Flow · Zustand (persist).

## Architecture

- `src/lib/providers/` — every external call lives here behind one `generate()` interface,
  routed `fal → replicate → mock` (image), `fal → mock` (video), `elevenlabs → mock` (audio),
  with timeout + retry and graceful mock fallback.
- `src/lib/store/` — one Zustand store per domain (Studio history is `lumen-studio`, persisted).
- `src/app/api/generate` — validated server endpoint; keys never reach the client.
- `src/components/{layout,studio,flows,chat}` — feature UI on shadcn primitives + DESIGN.md tokens.

See `CLAUDE.md` (team conventions), `SPEC.md` (features + acceptance criteria),
`DESIGN.md` (design system), `PLAN.md` (roadmap), `DECISIONS.md` (architecture log).

## Deploy to Vercel

```bash
pnpm dlx vercel            # link & deploy a preview
pnpm dlx vercel --prod     # promote to production
```

Set these environment variables in the Vercel project (Settings → Environment Variables) — all optional;
anything missing falls back to mock mode, except Chat which needs `ANTHROPIC_API_KEY`:

| Var | Used for |
|---|---|
| `ANTHROPIC_API_KEY` | Chat (AI SDK). Without it, Chat shows a "set the key" banner. |
| `FAL_KEY` | Image / video generation (primary). |
| `REPLICATE_API_TOKEN` | Image fallback. |
| `ELEVENLABS_API_KEY` | Audio (TTS). |

The `/api/chat` and `/api/generate` routes run on the Node.js runtime (`maxDuration` is raised for video).

## Status

| Surface | State |
|---|---|
| Studio — image / video / audio | ✅ Done & verified (build/types/lint green, tested end-to-end) |
| Chat — streaming + tool calling | ✅ Done & verified live (generates assets into Studio) |
| Flows — canvas + node graph + execution | ✅ Done & verified (topological run, prompt→image→output) |
| Cross-integration (all 4 directions) | ✅ Done & verified (Chat↔Studio, Chat→Flows, Studio↔Flows) |
| Deploy to Vercel | ⏳ Ready to deploy — see guide above (run by the owner) |

Roadmap and what's in/out per day: `PLAN.md`.

---

Built as a portfolio demo. The team of agents that builds it lives in `.claude/agents/`.

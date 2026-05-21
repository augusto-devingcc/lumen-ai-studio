# CLAUDE.md — Lumen (cerebro del equipo)

> **Léeme primero.** Este archivo gobierna cómo trabaja todo el equipo en este repo.
> Si algo aquí contradice tu instinto, gana este archivo. Si encuentras una contradicción
> real, anótala en `DECISIONS.md` y sigue.

## 1. Producto en 5 líneas

**Lumen** es un estudio de generación de medios con IA. Tiene tres superficies conectadas:
1. **Studio** — genera imagen, video y audio llamando a modelos líderes (Fal.ai, Replicate, ElevenLabs).
2. **Flows** — canvas node-based (estilo Higgsfield/Artlist) para encadenar pasos creativos: prompt → imagen → video → audio.
3. **Chat** — interfaz conversacional con tool calling que puede generar assets en Studio, construir/editar Flows y ejecutar tareas creativas.
El MVP demuestra que las tres superficies se sienten **reales y conectadas**, no que tienen todas las features posibles.

## 2. Stack (y por qué)

| Capa | Elección | Razón |
|---|---|---|
| Framework | Next.js 16 (App Router) + React 19 | Estándar Vercel, server components, streaming nativo |
| Lenguaje | TypeScript estricto | `strict: true`, sin `any` |
| Estilos | Tailwind v4 + shadcn/ui | Velocidad + componentes accesibles que controlamos |
| Chat IA | Vercel AI SDK v6 + **Vercel AI Gateway** (`createGateway`) | Un solo key para Claude/Gemini/GPT; tool calling + streaming |
| Generación | **Fal.ai** (imagen, video y audio — todo) | Un solo proveedor; modelos en tendencia |
| Keys | **BYOK** (el usuario pone sus keys en Settings) | Sin keys compartidas; se envían por header por-request |
| Canvas | React Flow (`@xyflow/react`) | Estándar de facto para editores node-based |
| Estado | Zustand (+ `persist`) | Simple, sin boilerplate, persistencia local trivial |
| Persistencia | localStorage vía Zustand persist (MVP) | Sin DB hasta que haga falta — ver DECISIONS.md |
| Deploy | Vercel | Cero config con Next.js |

> Cambios al stack se documentan en `DECISIONS.md` en 2-3 líneas. No expandir sin necesidad.

## 3. Estructura de carpetas

```
src/
  app/
    layout.tsx              # AppShell global (sidebar + theme)
    page.tsx                # redirect → /studio
    studio/page.tsx
    flows/page.tsx
    chat/page.tsx
    api/
      generate/route.ts     # endpoint unificado de generación (image|video|audio)
      chat/route.ts         # chat con tool calling (AI SDK)
  components/
    ui/                     # primitivos shadcn (button, dialog, input, ...)
    layout/                 # AppShell, Sidebar, SurfaceNav
    studio/                 # GeneratorPanel, ResultGrid, Lightbox, ...
    flows/                  # Canvas, nodos, NodeInspector
    chat/                   # ChatPanel, Message, ToolCallCard
  lib/
    providers/              # TODA llamada externa vive aquí
      types.ts              # GenerationRequest/Result unificados
      index.ts             # router de provider (fal → replicate → mock)
      fal.ts  replicate.ts  elevenlabs.ts  mock.ts
    agents/
      tools.ts              # definiciones de tools para el Chat
    store/                  # studio-store.ts, flows-store.ts, chat-store.ts
    types.ts                # tipos compartidos del dominio
    utils.ts                # cn(), helpers
```

## 4. Convenciones

- **Imports absolutos** con `@/` (configurado en tsconfig). Nunca `../../..`.
- **Server Components por defecto.** `"use client"` solo cuando hay estado, efectos o eventos.
- **Naming**: componentes `PascalCase`, hooks `useCamelCase`, archivos de componente `PascalCase.tsx`, utilidades `kebab-case.ts`.
- **Tipos del dominio** viven en `lib/types.ts` y `lib/providers/types.ts`. No redefinir tipos ad-hoc.
- **Estado cliente** en stores Zustand bajo `lib/store/`. No `useState` para estado que cruza componentes.
- **Toda llamada a API externa pasa por `lib/providers/`.** Un componente NUNCA hace `fetch` directo a Fal/Replicate/ElevenLabs.

## 5. Reglas de código (no negociables)

- **Cero `any`.** Usa tipos reales o `unknown` + narrowing.
- **Manejo de errores explícito.** Toda llamada externa tiene `try/catch`, timeout y al menos 1 retry.
- **Timeout + retry** en todos los fetches a APIs externas (helper en `lib/providers/`).
- **Sin claves en el cliente.** Las API keys solo se usan en route handlers / server. El cliente llama a `/api/*`.
- **Loading state y error state obligatorios** en toda UI que dispara una operación async.
- **`.env.local` está en `.gitignore`.** `.env.example` se mantiene completo y actualizado.

## 6. Definition of Done (una feature está lista cuando)

1. ✅ Compila: `pnpm build` sin errores de tipos.
2. ✅ Corre: `pnpm dev` sin errores en consola al usar la feature.
3. ✅ Tiene **loading state**.
4. ✅ Tiene **error state** (qué pasa si la API falla / no hay key).
5. ✅ Sigue **DESIGN.md** (tokens, espaciado, jerarquía).
6. ✅ Cumple los **acceptance criteria** del `SPEC.md`.
7. ✅ Pasa el **qa-reviewer**.

## 7. Cómo correr

```bash
pnpm install
cp .env.example .env.local   # rellena las keys que tengas
pnpm dev                     # http://localhost:3000
```

**La app corre SIN keys**: el provider layer cae a un `mock` que devuelve assets de placeholder.
Esto permite desarrollar y demostrar las tres superficies aunque falte alguna key.

### Keys — BYOK (no env vars)
Las API keys NO se leen del entorno. El usuario las ingresa en la pestaña **Settings**; se guardan en
`localStorage` (store `lumen-settings`) y se mandan por header en cada request:
- **Vercel AI Gateway key** → Chat (Claude / Gemini / GPT, todo por el gateway). Header `x-ai-gateway-key`.
- **Fal.ai key** → imagen / video / audio. Header `x-fal-key`.
Sin key → modo mock. Única env opcional: `LUMEN_FORCE_MOCK=1`.

## 8. Flujo de trabajo del equipo

El **Orchestrator** coordina. Por cada feature del PLAN.md:
1. Lee acceptance criteria en SPEC.md.
2. Arquitectura nueva → `architect`.
3. APIs externas → `api-integrator` (wrapper en `lib/providers/`).
4. UI → `ui-designer` (sigue DESIGN.md).
5. Orchestrator integra en la ruta/página.
6. `qa-reviewer` verifica.
7. Marca checkbox en PLAN.md + commit.

**Principios:** taste > velocidad bruta · no teatro de agentes (si es más rápido hacerlo, hazlo) · confirma antes de scope creep · logs honestos en DECISIONS.md.

# PLAN.md — Roadmap de Lumen

Roadmap por días. Marca el checkbox al cerrar cada item (compila + corre + pasa qa-reviewer).
El orden importa: cada día asume el anterior.

---

## Día 1 — Cimientos + Studio (imagen) ✅ COMPLETO Y VERIFICADO
- [x] Scaffolding: Next.js 16, Tailwind v4, shadcn/ui inicializado, alias `@/`.
- [x] `.env.example` completo, `.env.local` en `.gitignore` (con excepción `!.env.example`).
- [x] `DESIGN.md` (tokens dark, tipografía, componentes, do/don't).
- [x] AppShell: sidebar con navegación entre Studio / Flows / Chat, tema oscuro forzado.
- [x] Tipos compartidos (`lib/types.ts`, `lib/providers/types.ts`).
- [x] Provider layer (`lib/providers/`) con interfaz unificada + **mock fallback** (fal → replicate → mock).
- [x] Endpoint `POST /api/generate` (image/video/audio) con timeout + retry.
- [x] Studio: panel de imagen (modelo, prompt, aspect, seed) + grid + lightbox + historial (Zustand persist).
- [x] Verificado: `tsc` ✓, `pnpm build` ✓, `pnpm lint` ✓, generación end-to-end en navegador (modo mock) ✓.

## Día 2 — Studio completo + Chat ✅ COMPLETO Y VERIFICADO
- [x] Provider: video (Fal) y audio (ElevenLabs) en la interfaz unificada (ya desde Día 1).
- [x] Studio: generación de video (text→video) con player inline + tab dedicado.
- [x] Studio: generación de audio (TTS, voces ElevenLabs) con player inline + tab dedicado.
- [x] Endpoint `POST /api/chat` con AI SDK v6 + Anthropic (`claude-sonnet-4-6`), streaming.
- [x] Chat UI: streaming, historial persistente (localStorage), loading + error state (banner sin key).
- [x] Tools `generate_image`/`generate_video`/`generate_audio` (client-side) → asset inline + guardado en Studio.
- [x] Verificado **en vivo** con key real: el Chat mejora el prompt, llama la tool, muestra la imagen
      inline y el mismo asset aparece en la galería de Studio (integración Chat→Studio).

## Día 3 — Flows ✅ COMPLETO Y VERIFICADO
- [x] Canvas React Flow: pan/zoom, fondo de puntos, minimap, controles, colorMode dark.
- [x] Nodos: Prompt, Image, Video, Audio, Output (con estados idle/running/done/error).
- [x] Conexiones tipadas (handles por tipo) + NodeInspector lateral + paleta para añadir nodos.
- [x] Ejecución secuencial en orden topológico (Kahn); salida de un nodo → input del siguiente.
- [x] Persistencia del grafo (Zustand persist) + flujo de ejemplo (loadStarter) + Save to Studio.
- [x] Verificado: tsc/lint/build en verde + qa-reviewer (PASS en todos los criterios de Día 3) +
      ejecución probada en navegador (Prompt → Image → Output produjo resultados en cadena).

## Día 4 — Integración cruzada + persistencia + polish ✅ COMPLETO Y VERIFICADO
- [x] Chat → Flows: tool `create_flow` construye el grafo (verificado: "build a flow…" → grafo en /flows).
- [x] Studio → Flows: "Use in a Flow" (nodo source bloqueado que pasa el asset sin regenerar);
      Flows → Studio: "Save to Studio" en el Output.
- [x] Estado compartido revisado (un store por dominio: studio / flows / chat; sin duplicación).
- [x] Persistencia en las tres superficies (Zustand persist / localStorage).
- [x] Polish: empty states, loading/error en cada superficie, microinteracciones, tokens DESIGN.md.
- [x] Bug corregido: el reset de `runFlow` ya no borra el resultado de nodos source bloqueados.

## Día 5 — QA + Deploy + README ✅ (deploy queda del lado del owner)
- [x] QA pass: tsc + lint + build en verde; qa-reviewer corrido sobre Flows (PASS).
- [x] Fix de bugs encontrados (passthrough de nodos source bloqueados en runFlow).
- [x] `pnpm build` limpio (9 rutas).
- [~] Deploy a Vercel: **no ejecutado por decisión del usuario**. App lista para deploy; guía + env vars en README.
- [x] README: demo con capturas de las 3 superficies (`docs/*.png`) + setup en 3 pasos + guía de deploy.

---

### Estado vivo
> El Orchestrator actualiza esta sección al cerrar cada día, con qué quedó dentro/fuera y por qué.

- **Día 1:** ✅ completo y verificado. App corre en `localhost:3000`, Studio genera imágenes
  end-to-end con fallback a mock (sin keys). Build/types/lint en verde. Las tres rutas existen
  (Flows y Chat con placeholders intencionales y on-brand).
- **Día 2:** ✅ completo y verificado (en vivo, con key real de Anthropic). Studio genera imagen,
  video y audio (tabs). Chat con streaming + tool calling que genera assets y los guarda en Studio.
- **Día 3:** ✅ completo y verificado. Flows con canvas React Flow, 5 tipos de nodo, ejecución
  topológica secuencial, NodeInspector, persistencia y Save to Studio. qa-reviewer en PASS.
- **Día 4:** ✅ completo y verificado. Las 4 integraciones cruzadas funcionan (Chat→Studio, Chat→Flows,
  Studio→Flows, Flows→Studio). Persistencia en las tres superficies. Polish aplicado.
- **Día 5:** ✅ QA pass (tsc/lint/build verdes, qa-reviewer) + README con demo (capturas reales de las 3
  superficies en `docs/`). **Deploy a Vercel: no ejecutado por decisión del usuario** — la app está lista
  y la guía está en el README. Único item abierto del MVP.

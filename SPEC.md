# SPEC.md — Lumen (contrato del producto)

**Producto:** Lumen — estudio de generación de medios con IA.
**Tagline:** *Generate, compose, and direct media with AI.*

**Regla de oro del MVP:** no son "todas las features posibles", son las **mínimas para que
las tres superficies se sientan reales y conectadas**. Mejor 3 features pulidas que 10 a medias.

**Leyenda:** `[ ]` pendiente · `[x]` hecho · 🎯 = feature núcleo del MVP (prioridad máxima).

---

## Superficie: Studio

Generación de medios con un panel de controles a la izquierda y una galería de resultados a la derecha.

### 🎯 Feature: Generación de imagen — ✅ COMPLETO
- Acceptance criteria:
  - [x] Usuario selecciona modelo de una lista (`flux-dev`, `flux-schnell`, `sdxl`).
  - [x] Input de prompt + controles básicos (aspect ratio: 1:1 / 16:9 / 9:16 / 4:3 / 3:4, seed opcional + dado).
  - [x] Botón Generate con **loading state** (skeleton en grid + spinner en botón).
  - [x] **Error state**: si falta key cae a mock con aviso (toast); si la API falla, mensaje claro.
  - [x] Resultado se guarda en **historial local** (Zustand persist, cap 60).
  - [x] Click en resultado → **lightbox** con metadata (modelo, provider, seed, dimensiones, aspect, costo, mock).

### 🎯 Feature: Generación de video — ✅ COMPLETO
- Acceptance criteria:
  - [x] Selección de modelo de video (`ltx-video`, `kling-video` vía Fal).
  - [x] Modo text-to-video. (image-to-video soportado en el provider; UI de imagen-input queda para Día 4.)
  - [x] Controles: prompt, aspect ratio.
  - [x] Loading state con hint de que el video tarda más (icono Clock).
  - [x] Resultado reproducible inline (`<video>`), guardado en historial, abrible en lightbox.

### 🎯 Feature: Generación de audio — ✅ COMPLETO
- Acceptance criteria:
  - [x] Modo TTS (ElevenLabs): texto + selección de voz (5 voces).
  - [x] Loading + error states (cae a mock sin key).
  - [x] Reproductor de audio inline, guardado en historial.

### Feature: Historial y galería
- Acceptance criteria:
  - [ ] Grid unificado de todos los assets generados (imagen/video/audio) con filtro por tipo.
  - [ ] Persistencia entre recargas (Zustand persist).
  - [ ] Acción de borrar un asset y "usar como input" (envía a Flows o reusa en Studio).

---

## Superficie: Flows

Canvas node-based para encadenar pasos creativos. Estilo Higgsfield/Artlist.

### 🎯 Feature: Canvas y nodos — ✅ COMPLETO
- Acceptance criteria:
  - [x] Canvas React Flow con pan/zoom, fondo de puntos, minimap y controles.
  - [x] Paleta para añadir nodos. Tipos: **Prompt**, **Image**, **Video**, **Audio**, **Output**.
  - [x] Conexiones (edges) entre nodos con handles tipados (Prompt solo source, Output solo target).
  - [x] Cada nodo muestra su estado: idle / running / done / error.
  - [x] Click en nodo → **NodeInspector** lateral para editar sus parámetros.

### 🎯 Feature: Ejecución del grafo — ✅ COMPLETO
- Acceptance criteria:
  - [x] Botón "Run flow" ejecuta los nodos en **orden topológico** (Kahn).
  - [x] La salida de un nodo se pasa como input del siguiente (prompt → imagen → output/video).
  - [x] Cada nodo refleja su loading/done/error en vivo durante la ejecución.
  - [x] El Output node muestra el resultado final y permite guardarlo en el historial de Studio.

### Feature: Persistencia de flows — ✅ COMPLETO
- Acceptance criteria:
  - [x] El grafo (nodos + edges + params) persiste en local (Zustand persist).
  - [x] Se puede limpiar el canvas y empezar de cero (+ flujo de ejemplo `loadStarter`).

---

## Superficie: Chat

Interfaz conversacional con tool calling. El asistente entiende lenguaje natural y actúa.

### 🎯 Feature: Chat con streaming — ✅ COMPLETO
- Acceptance criteria:
  - [x] Mensajes con **streaming** (Vercel AI SDK v6 + Anthropic `claude-sonnet-4-6`).
  - [x] Historial de conversación persistente (localStorage).
  - [x] Loading/typing indicator ("Thinking…") y manejo de error (banner si falta `ANTHROPIC_API_KEY`).

### 🎯 Feature: Tool calling — generar assets — ✅ COMPLETO
- Acceptance criteria:
  - [x] Tools `generate_image`/`generate_video`/`generate_audio` que el modelo invoca; el resultado aparece **inline en el chat** como una `ToolCallCard` (nombre, prompt, estado, preview del media).
  - [x] El asset generado se guarda en el historial de Studio (estado compartido) — verificado en vivo.

### 🎯 Feature: Tool calling — construir/editar Flows — ✅ COMPLETO
- Acceptance criteria:
  - [x] Tool `create_flow` que crea el grafo de Flows desde el chat (prompt + pasos → output).
  - [x] Al ejecutar la tool, el store de Flows se actualiza (`setGraph`/`createFlow`); al ir a /flows el usuario ve el grafo creado por el chat (verificado en vivo).

---

## Integración cruzada (lo que hace al MVP "conectado") — ✅ COMPLETO

- [x] **Chat → Studio**: "genera una imagen de un zorro neón" crea el asset y lo guarda en Studio.
- [x] **Chat → Flows**: "arma un flow que de un prompt haga imagen y luego video" crea el grafo (tool `create_flow`).
- [x] **Studio → Flows**: "Use in a Flow" en el lightbox envía el asset como nodo source bloqueado.
- [x] **Flows → Studio**: el Output de un flow se guarda en el historial de Studio ("Save to Studio").
- [x] Estado compartido entre superficies vía stores Zustand (un solo origen de verdad por dominio).

---

## Fuera de scope del MVP (explícito)

- Autenticación / multiusuario.
- Base de datos remota (se usa persistencia local; Postgres+Drizzle queda para después — ver DECISIONS.md).
- Colaboración en tiempo real.
- Editor de video/timeline avanzado.
- Versionado de flows / undo-redo global.

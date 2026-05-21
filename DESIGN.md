# DESIGN.md — Sistema de diseño de Lumen

Contrato visual del producto. **Todo componente lo respeta.** Si necesitas un token nuevo,
agrégalo aquí y en `src/app/globals.css` antes de usarlo. Nada de hex sueltos en componentes.

## Principios
1. **Oscuro por defecto.** Tinta profunda, superficies en capas, un solo acento. Nunca negro puro ni texto blanco puro.
2. **Jerarquía por tipografía, espacio y contraste** — no por cajas. Menos bordes, más ritmo.
3. **Restraint.** Un acento (iris eléctrico). Sin degradados genéricos morado→azul, sin centrar todo, sin glassmorphism por todos lados.
4. **Microinteracciones sutiles.** Hover/active discretos, transiciones 150–200ms, skeletons al cargar. El movimiento da feedback, no decora.
5. **Mono para metadata** (seeds, modelos, dimensiones, costos). Sans para contenido.

## Tokens de color (definidos en globals.css, en oklch)
| Token | Uso |
|---|---|
| `background` | Fondo de la app (tinta profunda) |
| `card` | Paneles y tarjetas |
| `surface-2` | Superficie elevada (inspectors, popovers internos) |
| `popover` | Overlays / dropdowns |
| `border` | Bordes sutiles, baja luminancia |
| `foreground` | Texto principal |
| `muted-foreground` | Texto secundario / metadata |
| `primary` | Acento único — iris eléctrico. CTAs, foco, selección |
| `ring` | Anillo de foco (= primary) |
| `destructive` | Errores, acciones peligrosas |
| `success` | Estado done / éxito |
| `warning` | Avisos |
| `running` | Nodo/operación en ejecución |

Clases Tailwind: `bg-background`, `bg-card`, `bg-surface-2`, `text-foreground`, `text-muted-foreground`,
`border-border`, `bg-primary`, `text-primary`, `ring-ring`, `text-success`, `text-running`, etc.

## Tipografía
- **Geist Sans** para UI/contenido. **Geist Mono** para metadata y valores técnicos (`font-mono`).
- Escala: display `text-3xl/tight font-semibold` · título de sección `text-lg font-medium` ·
  cuerpo `text-sm` · caption/metadata `text-xs text-muted-foreground font-mono`.
- Tracking ligeramente negativo en titulares (`tracking-tight`).

## Espaciado, radio, elevación
- Densidad cómoda por defecto: `p-6 gap-6`; compacta en barras/inspectors: `p-4 gap-4`.
- Radio: `--radius: 0.625rem`. Usa `rounded-lg` en tarjetas, `rounded-md` en inputs/botones, `rounded-xl` en contenedores grandes.
- Elevación por **contraste de superficie + borde**, no por sombras pesadas. Sombra solo en overlays (`shadow-lg`).

## Layout
- **AppShell**: sidebar fija a la izquierda (≈ `w-60`) con nav entre Studio/Flows/Chat + marca arriba.
- Contenido a la derecha. Studio usa split: panel de controles (≈ `w-80/96`) + galería que crece.
- No centrar todo: usar layouts reales (sidebar + área principal, paneles asimétricos).

## Estados obligatorios por componente interactivo
`default · hover · active · focus-visible (ring) · disabled · loading · error · empty`.
- **Loading**: skeleton o spinner inline; nunca dejar al usuario sin feedback.
- **Error**: mensaje claro y accionable (qué pasó, qué hacer). Para "falta API key" → explicar que corre en modo mock.
- **Empty**: estado vacío diseñado (icono tenue + 1 línea + CTA), no texto pelado.

## Inventario de componentes (shadcn/base-ui en `components/ui`)
Button, Card, Dialog, Input, Textarea, Select, Tabs, Label, Badge, ScrollArea, Separator,
Skeleton, Sonner (toast), Tooltip, DropdownMenu, Sheet, Slider, Switch.
Componentes de feature en `components/{layout,studio,flows,chat}`.

### Do / Don't
- ✅ Un acento. ❌ Varios colores de acento peleando.
- ✅ Bordes sutiles + superficies en capas. ❌ Sombras dramáticas en cada tarjeta.
- ✅ Mono para seeds/modelos/costos. ❌ Mono para párrafos.
- ✅ Empty/loading/error diseñados. ❌ "Cargando..." pelado o pantalla en blanco.
- ✅ `AlertDialog`/confirmación para acciones destructivas. ❌ Borrar sin confirmar.

## Microinteracciones
- Hover en cards: leve subida de superficie (`hover:bg-card/80` o borde que se aclara) + `transition-colors`.
- Botón primario: `active:scale-[0.98]` sutil.
- Resultados nuevos entran con fade/scale corto (`animate-in fade-in zoom-in-95`).

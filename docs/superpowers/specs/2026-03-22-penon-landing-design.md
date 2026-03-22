# Penon Monitor — Landing Page de Presentación

## Propósito

Landing page de alto impacto para presentar Penon Monitor al Gobierno de la Provincia de Tierra del Fuego. La página debe funcionar de forma autónoma — sin necesidad de un presentador al lado. Será compartida entre ministerios (Ambiente, Defensa Civil, Bomberos) como material de presentación del proyecto.

**CTA principal:** Botón "Ver sistema en vivo" → enlace a https://penon.howenh-labs.com/

**Mensaje central:** Penon Monitor es una donación sin costo al pueblo fueguino. El sistema ya funciona. Solo falta que el Estado lo adopte.

---

## Stack Técnico

| Tecnología | Rol |
|---|---|
| React 19 + Vite 7 | Framework + build tool (existentes) |
| Tailwind CSS 4 | Estilos (existente) |
| Framer Motion | Scroll-driven animations, entradas, transiciones |
| React Three Fiber + drei | Globo 3D con satélites orbitando sobre TdF (hero) |
| Remotion Player | Secuencia cinematográfica del pipeline FIRMS (sección 3) |
| Lucide React | Iconografía (existente) |

---

## Identidad Visual — Aurora Austral

### Paleta

| Nombre | Hex | Uso |
|--------|-----|-----|
| Void | `#020617` | Fondo principal (slate-950) |
| Surface | `#0F172A` | Fondo secundario (slate-900) |
| Emerald | `#10B981` | Acento primario — naturaleza, sistema activo |
| Sky | `#38BDF8` | Acento secundario — tecnología, satélites |
| Violet | `#8B5CF6` | Acento terciario — aurora, datos |
| White | `#F8FAFC` | Texto principal |
| Slate | `#94A3B8` | Texto secundario |

### Tipografía

| Uso | Fuente | Peso |
|-----|--------|------|
| Headlines | Outfit | 700-800 |
| Body | Inter | 400-600 |
| Datos / Monospace | JetBrains Mono | 400-700 |

### Elementos visuales

- Gradientes aurora (emerald → sky → violet) en bordes y acentos
- Línea de aurora animada sutil en nav y separadores
- Glass morphism en cards (rgba blanco 3%, blur 10px)
- Dot pulsante verde como indicador "sistema activo"
- Badge "Donación al Pueblo Fueguino" recurrente

---

## Estructura de Secciones

### Sección 1 — Hero

**Propósito:** Hook emocional + números de impacto.

**Layout:**
- Fondo: partículas tipo aurora (emerald/sky/violet) con movimiento sutil
- Centro: Globo 3D (React Three Fiber) mostrando TdF con satélites orbitando
- Badge superior: dot verde pulsante + "SISTEMA ACTIVO"
- Título: "Vigilancia satelital para los bosques del fin del mundo"
- Subtítulo: explicación breve de Penon Monitor
- Stats en fila: `<10 min` (satélite a alerta), `$0` (costo de licencia), `+10/día` (observaciones satelitales sobre TdF)
- CTA: "Ver sistema en vivo →" (link a penon.howenh-labs.com)

**Animaciones:**
- Globo 3D rotando lentamente, satélites con trail de luz orbitando
- Stats con counter animado al entrar en viewport
- Partículas aurora en background con movimiento parallax

**Mobile:** Globo se simplifica a animación 2D (imagen + rotación CSS) para performance.

---

### Sección 2 — El Problema

**Propósito:** Contexto emocional + datos reales de incendios en TdF.

**Layout:**

**Bloque A — Timeline de incendios históricos:**
Timeline vertical scroll-driven. Cada incendio se ilumina al scrollear:
- 1917 — Presidio → Monte Olivia (bosque nativo arrasado)
- 1978 — Ruta 3, zona "El Quemado" (le dio nombre a la zona)
- 2008 — Corazón de la Isla, 6,993 ha (2,517 ha de lenga) — Fuente: Dirección Gral. Desarrollo Forestal TdF
- 2012 — Bahía El Torito, Lago Fagnano, ~1,700 ha
- **2022 — Reserva Corazón de la Isla, ~12,000 ha** (destacado como el principal)

**Bloque B — Caso central: Incendio 2022:**
Cards con datos verificados (fuente: Gobierno de TdF):
- 12,000 ha quemadas (4x la superficie de Ushuaia)
- 2+ meses sin control (30 nov 2022 - ene 2023)
- 1,000 bomberos desplegados
- 20+ aeronaves
- Vientos de 90 km/h
- Bosque virgen de lenga, guindo y ñire
- Declaración de emergencia ambiental provincial (Ley, 7 dic 2022)
- 2 procesados por fogata mal apagada

**Bloque C — El dato demoledor:**
Reveal animado grande:
> "En 14 años de restauración se recuperaron 233 hectáreas. En 2 meses se perdieron 12,000."
> — Dirección General de Desarrollo Forestal, Tierra del Fuego

Counter animado: 233 vs 12,000 con barra de comparación visual.

**Imágenes:** Satelitales de NASA FIRMS del incendio 2022 (públicas). Fotos de medios (solo para imágenes, no datos).

**Fuentes:** Solo oficiales al pie de la sección:
- Dirección General de Desarrollo Forestal, Tierra del Fuego
- Gobierno de Tierra del Fuego (argentina.gob.ar)

---

### Sección 3 — Cómo Funciona FIRMS

**Propósito:** Explicar el sistema satelital de la NASA de forma visual. Que un funcionario sin conocimiento técnico lo entienda en 30 segundos.

**Layout:**

**Bloque A — Secuencia animada (Remotion Player):**
5 pasos cinematográficos:

1. **Los satélites** — 5 satélites polares (Terra, Aqua, Suomi NPP, NOAA-20, NOAA-21) + geoestacionarios GOES 16/18. Visualización de órbitas convergiendo sobre los polos.
2. **Los sensores** — MODIS (1km/píxel, desde 2000) vs VIIRS (375m/píxel, detecta focos de 20m²). Comparación visual de resolución con cuadrícula.
3. **Cómo "ven" el fuego** — No fotos: radiación infrarroja (medio + onda larga). Algoritmo contextual: filtra agua, nubes, brillo solar. Detecta llamas abiertas y combustión latente.
4. **La ventaja polar** — TdF en latitud alta = órbitas se superponen = +10 observaciones diarias por satélites polares + GOES cada 10 min. Animación de franjas superponiéndose sobre TdF.
5. **De la detección a Penon** — Satélite detecta → NASA FIRMS procesa → API pública → Penon consulta → aplica filtros industriales/petroleros → clasifica confianza → muestra en mapa.

**Bloque B — Cards resumen debajo:**
- `375m` resolución VIIRS
- `+10/día` observaciones sobre TdF
- `10 min` frecuencia GOES
- `5` satélites polares activos

**Fallback:** Versión estática del diagrama si Remotion Player no carga.

**Fuente:** NASA FIRMS / NASA Earthdata (oficial).

---

### Sección 4 — Penon Monitor

**Propósito:** Mostrar qué hace Penon con la data satelital. Diferenciador: filtros inteligentes + FWI.

**Layout:**

**Bloque A — Comparación antes/después (scroll-driven):**
- **Sin Penon:** Mapa de TdF con todos los puntos de calor crudos (industriales, petroleros, y reales mezclados). Caos visual. Texto: "Así se ve sin filtrar — falsas alarmas que desvían recursos."
- **Con Penon:** Al scrollear, se activan los filtros. Polígonos industriales y petroleros aparecen. Detecciones dentro se marcan como "industrial" / "petrolera" (opacity baja). Solo quedan focos reales resaltados. Texto: "Esto es lo que importa."

**Bloque B — Diagrama FWI animado (scroll-driven, Framer Motion):**

Diagrama de flujo del Fire Weather Index canadiense, 3 niveles:

```
INPUTS (Open-Meteo)          NIVEL 1              NIVEL 2              NIVEL 3
                              Códigos Humedad      Comportamiento       Resultado

Temperatura ─┬─────────────→ FFMC (fino, ≤2cm)
Humedad Rel. ┤                                  → ISI (velocidad
Viento ──────┤                                    de propagación) ──┐
Precipitación┘                                                      ├→ FWI
                                                                    │
Temperatura ─┬─────────────→ DMC (orgánico,     → BUI (combustible  │
Humedad Rel. ┤               5-10cm)              disponible) ──────┘
Precipitación┘

Temperatura ─┬─────────────→ DC (sequía,
Precipitación┘               10-20cm)
```

Animación: inputs aparecen a la izquierda, líneas fluyen hacia códigos nivel 1, se combinan en nivel 2, convergen en FWI. Cada nodo se ilumina al activarse. El FWI final se traduce al mapa de color sobre TdF.

Texto: "Estándar usado por Canadá, Australia y la UE. Penon lo calcula automáticamente con datos meteorológicos en tiempo real."

Fuente: Natural Resources Canada (oficial).

**Bloque C — 6 Features (cards scroll-reveal):**

| Feature | Icono | Descripción |
|---------|-------|-------------|
| Detección NASA FIRMS | Satélite | Sensores VIIRS + MODIS, el estándar global |
| Filtro industrial | Fábrica | Polígonos de parques industriales de Río Grande |
| Filtro petrolero | Plataforma | Zonas de gas y petróleo del norte de la isla |
| Viento en tiempo real | Viento | Velocidad y dirección animada sobre el mapa (Open-Meteo) |
| Índice FWI | Gauge | Fire Weather Index canadiense, mapa de color por zona de riesgo |
| Niveles de confianza | Escudo | Alta / Nominal / Baja — clasifica cada detección |

---

### Sección 5 — Demo en Vivo

**Propósito:** Prueba de que el sistema funciona ahora mismo.

**Layout:**
- iframe de `https://penon.howenh-labs.com/` embebido
- Frame estilo ventana de browser (barra con dots + URL)
- Glow de aurora alrededor del frame
- Texto: "Esto está funcionando ahora mismo. Los datos que ves son de hoy."

---

### Sección 6 — La Donación

**Propósito:** El mensaje más fuerte de toda la página.

**Layout:**
- Reveal dramático: número grande "$0" con counter animation
- Badge: "DONACIÓN AL PUEBLO FUEGUINO"
- Texto: "Sin costo de licencia. Sin condiciones comerciales. Código fuente, aplicación, todo — propiedad del Estado Provincial."
- 3 cards con los ofrecimientos:
  1. Acompañar la implementación
  2. Capacitar al personal
  3. Mejora continua con feedback de operadores

---

### Sección 7 — Próximos Pasos

**Propósito:** CTA claro y concreto para el gobierno.

**Layout:** Timeline vertical, cada paso se ilumina al scrollear:

1. **Identificar equipo** — Defensa Civil, Bomberos, el organismo que corresponda
2. **Refinar polígonos** — Trabajo conjunto para ajustar zonas industriales y petroleras
3. **Capacitación** — Un día con los operadores
4. **Alertas móviles** — Integración de notificaciones a dispositivos de brigadistas

Texto cierre: "No pedimos presupuesto. Pedimos tiempo y voluntad de implementar algo que ya está funcionando."

---

### Sección 8 — Footer

**Layout:**
- Logo Penon Monitor
- "Powered by Howenh Labs" con link
- Coordenadas -54°S (conecta con el branding de Howenh)
- Email / contacto
- Fuentes oficiales citadas (links a NASA FIRMS, Gobierno TdF, Natural Resources Canada)

---

## Navegación

- Nav fijo superior con glass morphism
- Borde inferior con gradiente aurora sutil
- Links a cada sección (smooth scroll)
- Logo Penon con dot verde pulsante
- Mobile: hamburger menu

---

## Responsive

- Mobile-first
- Globo 3D del hero → animación 2D simplificada en mobile
- Remotion Player → versión estática fallback en pantallas pequeñas
- Grid de features 3 cols → 1 col en mobile
- Timeline se mantiene vertical en todas las resoluciones

---

## Remotion Player — Especificaciones

- **Duración:** ~30 segundos para los 5 pasos
- **Aspect ratio:** 16:9
- **Resolución:** 1920x1080 (se escala responsivamente)
- **Comportamiento:** Autoplay al entrar en viewport (IntersectionObserver), sin loop, con controles visibles (play/pause/scrub)
- **Fallback:** Debajo del player, versión estática del diagrama (imagen + texto) para dispositivos que no soporten el player o pantallas pequeñas
- **Alternativa evaluada:** Si el bundle de Remotion resulta demasiado pesado (>200KB gzipped), reemplazar por video MP4/WebM pre-renderizado con Remotion en build time. Decisión final en implementación.

---

## iframe Demo — Especificaciones

- **Dimensiones:** 100% ancho del contenedor (max-width 1200px), altura 650px desktop / 400px mobile
- **Verificación requerida:** Antes de implementar, confirmar que penon.howenh-labs.com permite embebido (headers X-Frame-Options / CSP). Si no permite iframe, reemplazar por screenshots interactivos con link al sitio.
- **Loading state:** Skeleton con shimmer animation mientras carga
- **Error state:** Mensaje "El sistema está actualizándose" + botón directo a penon.howenh-labs.com

---

## Sección 4 — Mapa comparativo

La comparación antes/después NO es un mapa interactivo. Es una **animación visual con assets estáticos:**
- Imagen base: mapa de TdF (OpenStreetMap o Mapbox static tiles)
- Puntos de calor: posiciones aproximadas representativas (no data real en tiempo real)
- Polígonos industriales/petroleros: SVG overlays que aparecen con animación
- Todo orquestado con Framer Motion scroll-driven, no requiere API ni data live

---

## Performance

- Lazy load para Three.js y Remotion usando IntersectionObserver (cargan cuando están a 200px del viewport)
- Bundle budget: Three.js + R3F (~150KB gzip), Remotion Player (~180KB gzip), Framer Motion (~30KB gzip). Total new deps: ~360KB. Si supera 400KB, evaluar reemplazar Remotion por video pre-renderizado.
- Imágenes satelitales en WebP con fallback
- Fonts cargadas con `display: swap`
- Target: LCP < 2.5s, CLS < 0.1, INP < 200ms
- WebGL fallback: `<Suspense>` con imagen estática del globo + error boundary que muestra la misma imagen si WebGL no está disponible

---

## Datos y Fuentes

**Regla:** Todos los datos deben tener fuente oficial verificable. No se usan datos sin fundamento.

**Fuentes oficiales usadas:**
- Dirección General de Desarrollo Forestal, Tierra del Fuego — datos de restauración (233 ha en 14 años, 86,000 plantas)
- Gobierno de Tierra del Fuego — datos del incendio 2022, emergencia ambiental
- NASA FIRMS / NASA Earthdata — sistema FIRMS, sensores, frecuencias, resoluciones
- Natural Resources Canada — sistema FWI, componentes, cálculo
- Open-Meteo — fuente de datos meteorológicos para el cálculo FWI

**Imágenes de medios:** Permitidas solo para fotos/imágenes del incendio, no para datos.

**Imágenes satelitales:** Obtener de NASA Worldview (worldview.earthdata.nasa.gov) buscando TdF en las fechas del incendio 2022 (dic 2022 - ene 2023). 2-3 imágenes: una mostrando el humo, una con detecciones FIRMS activas, una del antes/después. Formato WebP, resolución mínima 1200px ancho.

---

## SEO y Compartibilidad

Dado que la página se comparte por WhatsApp/email entre funcionarios:
- Open Graph tags: título, descripción, imagen preview
- Imagen OG: render del hero con el título (1200x630px)
- `<title>`: "Penon Monitor — Monitoreo Satelital de Incendios | Tierra del Fuego"
- `<meta description>`: "Sistema de detección de incendios forestales en tiempo real para Tierra del Fuego. Datos NASA, filtros inteligentes, donación al pueblo fueguino."
- favicon: dot verde pulsante (emoji de fuego como fallback)

---

## Accesibilidad

- Alt text descriptivo para todas las imágenes satelitales
- `aria-label` en elementos interactivos (CTA, nav, player)
- Verificar contraste WCAG AA para todas las combinaciones de color (especialmente texto slate sobre fondos oscuros)
- `prefers-reduced-motion`: deshabilitar todas las animaciones, mostrar contenido estático
- Navegación completa por teclado
- Remotion Player: controles accesibles con keyboard

/*
 * Rayos · la película de los capítulos 1 y 2, en canvas. Determinista: `dibujar(ctx, W, H, t, reloj)`
 * pinta el instante t (segundos de la película) y nada más; `reloj` solo mueve lo ambiental.
 *
 * Cifras y reglas, todas del código de Penon (penonInsight):
 *  - GOES-19 (GOES-East) a 75,2° O; órbita de 42.164 km de radio (35.786 km de altura): intrusion_solar.py
 *  - archivos de 20 s, ~12 KB leídos por HTTP Range de ~330 KB, 2 GB/día sin eso, 99,99 % de otras
 *    latitudes, recorte al bbox de TdF (-70,-55.1,-57.5,-51): glm_client.py, config.py
 *  - Penon los busca cada 10 min: scheduler.py
 *  - intrusión solar: banda −0,31° < d < 2,88° alrededor del disco (radio angular 8,70°); la noche del
 *    23/09/2026 da 04:06–04:20 y 05:26–05:40 UTC (calculado con ventanas_intrusion), eclipse en el medio;
 *    el mapa lo muestra en hora de Ushuaia como «sin dato 1:06–2:40» (situacion.ts, ventanaSinGlm)
 * Los destellos, las tormentas y las ráfagas falsas del dibujo son ilustrativos.
 */
import isla from './isla.json'
import mundo from './embudo.json'

export const T = { orbita: 0, disco: 4.5, repo: 10.5, range: 14.5, recorte: 19, sol: 22.5, ventana: 26, mapa: 31 }

const RAD = Math.PI / 180
const LON_GOES = -75.2
const R_GEO = 42164 // km
const R_TIERRA = 6378.137 // km
const DIST = R_GEO / R_TIERRA // radios terrestres del centro de la Tierra al satélite (≈ 6,61)
const RADIO_ANG = Math.asin(R_TIERRA / R_GEO) / RAD // ≈ 8,70°: radio angular de la Tierra vista desde GOES
const BANDA = [(RADIO_ANG - 0.31) / RADIO_ANG, (RADIO_ANG + 2.88) / RADIO_ANG] // en radios del disco
const BBOX = { o: -70, s: -55.1, e: -57.5, n: -51 }
// noche del 23/09/2026, en minutos UTC
const VENTANAS = [
  [4 * 60 + 6, 4 * 60 + 20],
  [5 * 60 + 26, 5 * 60 + 40],
]
const MEDIO_ECLIPSE = (VENTANAS[0][1] + VENTANAS[1][0]) / 2
const SOL_GRADO_MIN = 0.2385 // °/min: lo que se mueve el Sol en el cielo del satélite (ajustado a esas ventanas)

const CIAN = '#22d3ee'
const FALSO = '#f87171'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const SANS = 'Archivo, system-ui, sans-serif'

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const suave = (v) => {
  const x = clamp01(v)
  return x * x * (3 - 2 * x)
}
const tramo = (t, a, b) => suave((t - a) / (b - a))
const lerp = (a, b, k) => a + (b - a) * k
const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(Math.floor(min % 60)).padStart(2, '0')}`

function azar(semilla) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let x = a
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- datos fijos ----------
// la tierra del mundo, grilla de 2° (la misma del embudo)
const TIERRA = []
mundo.tierra.forEach((fila, j) => {
  ;[...fila].forEach((h, k) => {
    const v = parseInt(h, 16)
    for (let b = 0; b < 4; b++) {
      if (v & (8 >> b)) TIERRA.push([-180 + (k * 4 + b + 0.5) * mundo.pasoT, mundo.latN - (j + 0.5) * mundo.pasoT])
    }
  })
})
// la isla en lon/lat (isla.json está en coordenadas de planta)
const { proy } = isla
const aLonLat = (d) =>
  d
    .split('M')
    .filter(Boolean)
    .map((seg) => [...seg.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [+m[1] / proy.KX + proy.LON0, proy.LAT0 - +m[2] / proy.KY]))
const ISLA = aLonLat(isla.capas.tierra)
const ISLA_CHILE = aLonLat(isla.capas.chileIsla)
const ISLA_TODA = [...ISLA_CHILE.map((p) => ({ p, ch: true })), ...ISLA.map((p) => ({ p, ch: false }))]
const TDF = [-67.6, -54.1]

// destellos ilustrativos: tormentas de América que el GLM ve en el disco
const TORMENTAS = [
  [-4, -63, 1.3],
  [-11, -54, 1.1],
  [-23, -57, 1.0],
  [-15, -46, 0.7],
  [5, -73, 0.9],
  [12, -85, 0.7],
  [27, -84, 0.6],
  [35, -96, 0.6],
  [-31, -61, 0.5],
  [8, -64, 0.5],
]
const DESTELLOS = (() => {
  const r = azar(11)
  const peso = TORMENTAS.reduce((a, x) => a + x[2], 0)
  const lista = []
  for (let k = 0; k < 900; k++) {
    let u = r() * peso
    let c = TORMENTAS[0]
    for (const x of TORMENTAS) {
      u -= x[2]
      if (u <= 0) {
        c = x
        break
      }
    }
    const g = () => (r() + r() + r() - 1.5) * 2.4
    lista.push({ t0: T.disco + 1.4 + r() * (T.sol - T.disco - 1.6), lat: c[0] + g(), lon: c[1] + g() * 1.2 })
  }
  // los pocos de Tierra del Fuego
  lista.push({ t0: 7.9, lat: -53.9, lon: -68.0, tdf: true }, { t0: 9.4, lat: -54.4, lon: -67.2, tdf: true })
  return lista
})()
// la ráfaga falsa sobre TdF: aparece durante las dos ventanas
const FALSOS = (() => {
  const r = azar(23)
  return Array.from({ length: 150 }, (_, k) => {
    const v = VENTANAS[k < 75 ? 0 : 1]
    return { min: v[0] + r() * (v[1] - v[0]), lat: TDF[1] + (r() - 0.5) * 2.2, lon: TDF[0] + (r() - 0.5) * 4.5 }
  })
})()
const ESTRELLAS = (() => {
  const r = azar(5)
  return Array.from({ length: 140 }, () => ({ x: r(), y: r(), a: 0.15 + r() * 0.45, s: r() < 0.1 ? 1.4 : 0.8, f: r() * 6.28 }))
})()
// el archivo: bloques de variables; los cuatro que lee Penon suman 12/330 del ancho
const BLOQUES = (() => {
  const r = azar(31)
  const n = 26
  const crudos = Array.from({ length: n }, () => 0.4 + r() * 1.6)
  const usados = { 6: 'flash_lat', 7: 'flash_lon', 15: 'flash_time_offset…', 21: 'flash_energy' }
  const partes = [0.28, 0.28, 0.24, 0.2].map((p) => (p * 12) / 330)
  const resto = 1 - partes.reduce((a, x) => a + x, 0)
  const sumaOtros = crudos.reduce((a, x, i) => a + (usados[i] ? 0 : x), 0)
  let x = 0
  let k = 0
  return crudos.map((c, i) => {
    const w = usados[i] ? partes[k++] : (c / sumaOtros) * resto
    const b = { x, w, nombre: usados[i] || null }
    x += w
    return b
  })
})()

// ---------- proyección ortográfica ----------
function proyectar(lon, lat, v) {
  const f = lat * RAD
  const l = (lon - v.lon0) * RAD
  const f0 = v.lat0 * RAD
  const cosc = Math.sin(f0) * Math.sin(f) + Math.cos(f0) * Math.cos(f) * Math.cos(l)
  if (cosc < 0) return null
  let x = v.r * Math.cos(f) * Math.sin(l)
  let y = -v.r * (Math.cos(f0) * Math.sin(f) - Math.sin(f0) * Math.cos(f) * Math.cos(l))
  if (v.rot) {
    const c = Math.cos(v.rot)
    const s = Math.sin(v.rot)
    ;[x, y] = [x * c - y * s, x * s + y * c]
  }
  return [v.cx + x, v.cy + y, cosc]
}

function globo(ctx, v, a = 1, tierraA = 1) {
  if (a <= 0) return
  ctx.save()
  ctx.globalAlpha = a
  const halo = ctx.createRadialGradient(v.cx, v.cy, v.r * 0.95, v.cx, v.cy, v.r * 1.12)
  halo.addColorStop(0, 'rgba(96,165,250,0.22)')
  halo.addColorStop(1, 'rgba(96,165,250,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(v.cx, v.cy, v.r * 1.12, 0, Math.PI * 2)
  ctx.fill()
  const g = ctx.createRadialGradient(v.cx - v.r * 0.3, v.cy - v.r * 0.3, v.r * 0.1, v.cx, v.cy, v.r)
  g.addColorStop(0, '#0f2142')
  g.addColorStop(1, '#060e1d')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(v.cx, v.cy, v.r, 0, Math.PI * 2)
  ctx.fill()
  if (tierraA > 0) {
    const s = Math.max(1.1, v.r * 0.0105)
    for (const [lon, lat] of TIERRA) {
      const p = proyectar(lon, lat, v)
      if (!p) continue
      ctx.fillStyle = `rgba(148,163,184,${(0.18 + 0.55 * p[2]) * tierraA})`
      ctx.fillRect(p[0] - s / 2, p[1] - s / 2, s, s)
    }
  }
  ctx.strokeStyle = 'rgba(147,197,253,0.35)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(v.cx, v.cy, v.r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function texto(ctx, s, x, y, { tam = 12, color = '#cbd5e1', fam = MONO, peso = 500, al = 'left', base = 'alphabetic', a = 1 } = {}) {
  if (a <= 0) return
  ctx.save()
  ctx.globalAlpha = a
  ctx.font = `${peso} ${tam}px ${fam}`
  ctx.fillStyle = color
  ctx.textAlign = al
  ctx.textBaseline = base
  ctx.fillText(s, x, y)
  ctx.restore()
}

function pildora(ctx, s, x, y, { tam = 12, color = '#e2e8f0', fondo = 'rgba(5,11,24,0.92)', borde = 'rgba(255,255,255,0.18)', al = 'left', a = 1 } = {}) {
  if (a <= 0) return
  ctx.save()
  ctx.globalAlpha = a
  ctx.font = `500 ${tam}px ${MONO}`
  const w = ctx.measureText(s).width + tam * 1.4
  const h = tam * 2
  const x0 = al === 'center' ? x - w / 2 : al === 'right' ? x - w : x
  ctx.fillStyle = fondo
  ctx.strokeStyle = borde
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(x0, y - h / 2, w, h, h / 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(s, x0 + tam * 0.7, y + 0.5)
  ctx.restore()
}

function satelite(ctx, x, y, e, a = 1) {
  if (a <= 0) return
  ctx.save()
  ctx.globalAlpha = a
  ctx.translate(x, y)
  ctx.scale(e, e)
  ctx.fillStyle = '#1e293b'
  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1 / e
  // panel solar
  ctx.fillStyle = '#1d3a6e'
  ctx.fillRect(-4, -34, 8, 22)
  ctx.strokeRect(-4, -34, 8, 22)
  ctx.strokeStyle = 'rgba(148,163,184,0.5)'
  for (let k = 1; k < 4; k++) {
    ctx.beginPath()
    ctx.moveTo(-4, -34 + k * 5.5)
    ctx.lineTo(4, -34 + k * 5.5)
    ctx.stroke()
  }
  ctx.strokeStyle = '#94a3b8'
  ctx.beginPath()
  ctx.moveTo(0, -12)
  ctx.lineTo(0, -7)
  ctx.stroke()
  // cuerpo
  ctx.fillStyle = '#cbd5e1'
  ctx.fillRect(-7, -7, 14, 14)
  ctx.fillStyle = '#e2b04a'
  ctx.fillRect(-7, -7, 14, 4)
  // instrumentos mirando a la Tierra (a la izquierda)
  ctx.fillStyle = '#64748b'
  ctx.fillRect(-11, -4, 4, 8)
  ctx.restore()
}

function estrellas(ctx, W, H, reloj, a = 1) {
  for (const s of ESTRELLAS) {
    ctx.fillStyle = `rgba(226,232,240,${s.a * a * (0.75 + 0.25 * Math.sin(reloj * 1.3 + s.f))})`
    ctx.fillRect(s.x * W, s.y * H, s.s, s.s)
  }
}

/** La composición según la forma de la escena. */
function disposicion(W, H) {
  const ap = W >= H * 1.1
  const m = Math.min(W, H)
  const R0 = ap ? Math.min(0.092 * W, 0.2 * H) : Math.min(0.095 * H, 0.2 * W)
  const E0 = ap ? [0.13 * W, 0.56 * H] : [0.5 * W, 0.85 * H]
  return {
    ap,
    m,
    orbita: { cx: E0[0], cy: E0[1], r: R0, lon0: LON_GOES - 90, lat0: 0, rot: ap ? 0 : -Math.PI / 2 },
    sat: ap ? [E0[0] + DIST * R0, E0[1]] : [E0[0], E0[1] - DIST * R0],
    disco: { cx: W / 2, cy: H / 2, r: 0.43 * m, lon0: LON_GOES, lat0: 0, rot: 0 },
    chico: ap ? { cx: 0.17 * W, cy: 0.5 * H, r: 0.2 * m, lon0: LON_GOES, lat0: 0, rot: 0 } : { cx: 0.5 * W, cy: 0.19 * H, r: 0.15 * m, lon0: LON_GOES, lat0: 0, rot: 0 },
    sol: ap ? { cx: 0.42 * W, cy: 0.42 * H, r: 0.26 * m, lon0: LON_GOES, lat0: 0, rot: 0 } : { cx: 0.5 * W, cy: 0.43 * H, r: 0.205 * m, lon0: LON_GOES, lat0: 0, rot: 0 },
  }
}

const mezclaVista = (a, b, k) => ({
  cx: lerp(a.cx, b.cx, k),
  cy: lerp(a.cy, b.cy, k),
  r: lerp(a.r, b.r, k),
  lon0: lerp(a.lon0, b.lon0, k),
  lat0: lerp(a.lat0, b.lat0, k),
  rot: lerp(a.rot, b.rot, k),
})

function destellos(ctx, v, t, desde = -1) {
  for (const d of DESTELLOS) {
    if (t < d.t0 || t > d.t0 + 0.45 || d.t0 < desde) continue
    const p = proyectar(d.lon, d.lat, v)
    if (!p) continue
    const k = (t - d.t0) / 0.45
    const rr = v.r * (0.018 + 0.03 * k)
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], rr)
    g.addColorStop(0, `rgba(224,247,255,${0.95 * (1 - k)})`)
    g.addColorStop(0.35, `rgba(34,211,238,${0.55 * (1 - k)})`)
    g.addColorStop(1, 'rgba(34,211,238,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(p[0], p[1], rr, 0, Math.PI * 2)
    ctx.fill()
  }
}

function contornoBbox(ctx, v) {
  ctx.beginPath()
  const lados = [
    [BBOX.o, BBOX.n, BBOX.e, BBOX.n],
    [BBOX.e, BBOX.n, BBOX.e, BBOX.s],
    [BBOX.e, BBOX.s, BBOX.o, BBOX.s],
    [BBOX.o, BBOX.s, BBOX.o, BBOX.n],
  ]
  let primero = true
  for (const [a, b, c, d] of lados) {
    for (let k = 0; k <= 12; k++) {
      const p = proyectar(lerp(a, c, k / 12), lerp(b, d, k / 12), v)
      if (!p) continue
      if (primero) ctx.moveTo(p[0], p[1])
      else ctx.lineTo(p[0], p[1])
      primero = false
    }
  }
  ctx.closePath()
}

// ---------- escenas ----------
function escenaOrbita(ctx, W, H, t, L, reloj) {
  // 0–4,5: la órbita de costado, a escala; 4,5–6,2: la cámara se mete en el satélite y la Tierra gira hasta mostrar América
  const k = tramo(t, T.disco, T.disco + 1.7)
  const v = mezclaVista(L.orbita, L.disco, k)
  const E = [L.orbita.cx, L.orbita.cy]
  const R = L.orbita.r
  const S = L.sat
  const aOrb = (1 - tramo(t, T.disco, T.disco + 0.6)) * tramo(t, 0.2, 1.0)
  // órbita geoestacionaria (arco punteado)
  if (aOrb > 0) {
    ctx.save()
    ctx.globalAlpha = aOrb * tramo(t, 0.6, 1.6) * 0.5
    ctx.strokeStyle = '#94a3b8'
    ctx.setLineDash([3, 5])
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(E[0], E[1], DIST * R, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  // cono de visión: de GOES a los bordes del disco
  const aCono = tramo(t, 3.0, 3.9) * (1 - tramo(t, T.disco, T.disco + 0.5))
  if (aCono > 0) {
    const dx = E[0] - S[0]
    const dy = E[1] - S[1]
    const d = Math.hypot(dx, dy)
    const ang = Math.atan2(dy, dx)
    const ab = Math.asin(R / d)
    const lt = Math.sqrt(d * d - R * R) * tramo(t, 3.0, 3.9)
    ctx.save()
    ctx.globalAlpha = aCono
    const g = ctx.createLinearGradient(S[0], S[1], E[0], E[1])
    g.addColorStop(0, 'rgba(226,232,240,0.16)')
    g.addColorStop(1, 'rgba(226,232,240,0.03)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(S[0], S[1])
    ctx.lineTo(S[0] + Math.cos(ang - ab) * lt, S[1] + Math.sin(ang - ab) * lt)
    ctx.lineTo(S[0] + Math.cos(ang + ab) * lt, S[1] + Math.sin(ang + ab) * lt)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = 'rgba(226,232,240,0.35)'
    ctx.beginPath()
    ctx.moveTo(S[0] + Math.cos(ang - ab) * lt, S[1] + Math.sin(ang - ab) * lt)
    ctx.lineTo(S[0], S[1])
    ctx.lineTo(S[0] + Math.cos(ang + ab) * lt, S[1] + Math.sin(ang + ab) * lt)
    ctx.stroke()
    ctx.restore()
  }
  if (t < T.repo) {
    globo(ctx, v, tramo(t, 0, 0.8))
    if (t > T.disco) destellos(ctx, v, t)
  }
  // la cota: 35.786 km de altura
  const aCota = tramo(t, 2.1, 2.8) * (1 - tramo(t, T.disco, T.disco + 0.4))
  if (aCota > 0) {
    const u = [(S[0] - E[0]) / (DIST * R), (S[1] - E[1]) / (DIST * R)]
    const a0 = [E[0] + u[0] * R, E[1] + u[1] * R]
    const n = [-u[1], u[0]]
    const off = L.ap ? -R * 0.9 : R * 0.9
    const p0 = [a0[0] + n[0] * off, a0[1] + n[1] * off]
    const p1 = [S[0] + n[0] * off, S[1] + n[1] * off]
    ctx.save()
    ctx.globalAlpha = aCota
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(p0[0], p0[1])
    ctx.lineTo(p1[0], p1[1])
    for (const p of [p0, p1]) {
      ctx.moveTo(p[0] - n[1] * 0 - n[0] * 5, p[1] - n[1] * 5)
      ctx.lineTo(p[0] + n[0] * 5, p[1] + n[1] * 5)
    }
    ctx.stroke()
    ctx.restore()
    const mx = (p0[0] + p1[0]) / 2
    const my = (p0[1] + p1[1]) / 2
    pildora(ctx, '35.786 km', mx, my, { tam: L.m < 420 ? 11 : 13, al: 'center', a: aCota, color: '#f8fafc' })
  }
  // el satélite: llega por la órbita y en la transición viene hacia la cámara
  const llegada = tramo(t, 1.0, 2.1)
  if (llegada > 0) {
    const angF = Math.atan2(S[1] - E[1], S[0] - E[0])
    const ang = angF - (1 - llegada) * 0.9
    let x = E[0] + Math.cos(ang) * DIST * R
    let y = E[1] + Math.sin(ang) * DIST * R
    const kv = tramo(t, T.disco, T.disco + 1.3)
    x = lerp(x, L.disco.cx + L.disco.r * 0.15, kv)
    y = lerp(y, L.disco.cy - L.disco.r * 0.1, kv)
    const e = (L.m < 420 ? 0.95 : 1.4) * (1 + kv * 2.5)
    satelite(ctx, x, y, e, llegada * (1 - tramo(t, T.disco + 0.1, T.disco + 0.6)))
    const aRot = llegada * (1 - tramo(t, T.disco - 0.3, T.disco + 0.2))
    const lx = L.ap ? S[0] : S[0] + 26
    const ly = L.ap ? S[1] + 46 : S[1] + 4
    texto(ctx, 'GOES-19 · GOES-East', lx, ly, { tam: L.m < 420 ? 12 : 14, color: '#f8fafc', peso: 600, al: L.ap ? 'center' : 'left', a: aRot })
    texto(ctx, 'sobre los 75,2° O', lx, ly + (L.m < 420 ? 16 : 19), { tam: L.m < 420 ? 11 : 12, color: '#94a3b8', al: L.ap ? 'center' : 'left', a: aRot })
  }
  texto(ctx, 'órbita geoestacionaria', L.ap ? E[0] + DIST * R * 0.62 : 14, L.ap ? E[1] - DIST * R * 0.62 : E[1] - DIST * R * 0.5, {
    tam: 11,
    color: '#64748b',
    al: L.ap ? 'center' : 'left',
    a: aOrb * tramo(t, 1.4, 2.0),
  })
  // ya en el disco
  const aDisco = tramo(t, T.disco + 1.6, T.disco + 2.2) * (1 - tramo(t, T.repo, T.repo + 0.4))
  texto(ctx, 'Lo que ve el GLM · disco completo', 16, 24, { tam: 12, color: '#94a3b8', a: aDisco })
  texto(ctx, 'destellos ilustrativos', W - 14, H - 14, { tam: 11, color: '#64748b', al: 'right', a: aDisco })
  // dónde queda Tierra del Fuego
  const aTdf = tramo(t, 8.0, 8.6) * (1 - tramo(t, T.repo, T.repo + 0.4))
  if (aTdf > 0 && k >= 1) {
    const p = proyectar(TDF[0], TDF[1], v)
    if (p) {
      ctx.save()
      ctx.globalAlpha = aTdf
      ctx.strokeStyle = '#f8fafc'
      ctx.lineWidth = 1
      ctx.strokeRect(p[0] - 10, p[1] - 7, 20, 14)
      ctx.restore()
      texto(ctx, 'Tierra del Fuego', p[0] + 16, p[1] + 4, { tam: 12, color: '#f8fafc', a: aTdf })
    }
  }
  void reloj
}

function archivo(ctx, x, y, e, a, marca) {
  ctx.save()
  ctx.globalAlpha = a
  ctx.translate(x, y)
  ctx.scale(e, e)
  ctx.fillStyle = marca ? '#e2e8f0' : '#1e293b'
  ctx.strokeStyle = marca ? '#f8fafc' : '#64748b'
  ctx.lineWidth = 1 / e
  ctx.beginPath()
  ctx.moveTo(-6, -8)
  ctx.lineTo(3, -8)
  ctx.lineTo(6, -5)
  ctx.lineTo(6, 8)
  ctx.lineTo(-6, 8)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function escenaRepo(ctx, W, H, t, L) {
  // 10,5–14,5: el disco se achica; salen archivos de 20 s al repositorio de NOAA; Penon pasa cada 10 min
  const kin = tramo(t, T.repo, T.repo + 0.8)
  const fuera = tramo(t, T.range, T.range + 0.4)
  const a = 1 - fuera
  if (a <= 0) return
  const v = mezclaVista(L.disco, L.chico, kin)
  globo(ctx, v, a)
  destellos(ctx, v, t)
  const repo = L.ap ? { x: 0.53 * W, y: 0.5 * H, w: 0.24 * W, h: 0.42 * H } : { x: 0.5 * W, y: 0.52 * H, w: 0.62 * W, h: 0.2 * H }
  const pen = L.ap ? { x: 0.88 * W, y: 0.5 * H } : { x: 0.5 * W, y: 0.86 * H }
  const ar = a * tramo(t, T.repo + 0.5, T.repo + 1.0)
  // repositorio
  ctx.save()
  ctx.globalAlpha = ar
  ctx.fillStyle = 'rgba(15,23,42,0.85)'
  ctx.strokeStyle = 'rgba(148,163,184,0.35)'
  ctx.beginPath()
  ctx.roundRect(repo.x - repo.w / 2, repo.y - repo.h / 2, repo.w, repo.h, 12)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
  const tt = L.m < 420 ? 11 : 13
  texto(ctx, 'Repositorio público de NOAA', repo.x, repo.y - repo.h / 2 - 12, { tam: tt, color: '#f8fafc', al: 'center', peso: 600, a: ar })
  texto(ctx, 'un archivo cada 20 s', repo.x, repo.y + repo.h / 2 + tt + 8, { tam: tt - 1, color: '#94a3b8', al: 'center', a: ar })
  // archivos que llegan y se apilan
  const cols = L.ap ? 8 : 14
  const filas = L.ap ? 10 : 4
  const paso = Math.min((repo.w - 24) / cols, (repo.h - 24) / filas)
  const cada = 0.11
  const t0 = T.repo + 0.9
  const recogidas = [T.repo + 2.4]
  const n = Math.max(0, Math.floor((t - t0) / cada))
  // los que se llevó la última recogida ya no están en el estante
  const desdeRecogida = t >= recogidas[0] ? Math.min(Math.floor((recogidas[0] - t0) / cada), cols * filas) : 0
  for (let i = 0; i < Math.min(n, 400); i++) {
    const nacido = t0 + i * cada
    const viaje = clamp01((t - nacido) / 0.55)
    if (i < desdeRecogida) continue
    const pos = i - desdeRecogida
    const slot = pos % (cols * filas)
    const destino = [repo.x - repo.w / 2 + 12 + paso * ((slot % cols) + 0.5), repo.y - repo.h / 2 + 12 + paso * (Math.floor(slot / cols) + 0.5)]
    const origen = [v.cx + (L.ap ? v.r : 0), v.cy + (L.ap ? 0 : v.r)]
    const e = suave(viaje)
    const x = lerp(origen[0], destino[0], e)
    const y = lerp(origen[1], destino[1], e) - Math.sin(Math.PI * e) * (L.ap ? 30 : 0)
    archivo(ctx, x, y, paso / 22, ar, false)
  }
  // Penon: el anillo de los 10 minutos y la recogida
  const ap = a * tramo(t, T.repo + 0.8, T.repo + 1.3)
  if (ap > 0) {
    const rr = L.m < 420 ? 22 : 30
    ctx.save()
    ctx.globalAlpha = ap
    ctx.fillStyle = 'rgba(16,185,129,0.12)'
    ctx.strokeStyle = 'rgba(16,185,129,0.8)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(pen.x, pen.y, rr, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    // el ciclo: se llena y recoge
    const ciclo = ((t - (T.repo + 0.6)) % 1.8) / 1.8
    ctx.strokeStyle = '#34d399'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(pen.x, pen.y, rr + 6, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp01(ciclo))
    ctx.stroke()
    ctx.restore()
    texto(ctx, 'Penon', pen.x, pen.y + 4, { tam: tt, color: '#ecfdf5', al: 'center', peso: 700, fam: SANS, a: ap })
    texto(ctx, 'busca cada 10 min', L.ap ? pen.x : pen.x + rr + 14, L.ap ? pen.y + rr + 26 : pen.y + 4, { tam: tt - 1, color: '#6ee7b7', al: L.ap ? 'center' : 'left', a: ap })
    // recogida: lo apilado viaja a Penon
    for (const r of recogidas) {
      const k = clamp01((t - r) / 0.6)
      if (k <= 0 || k >= 1) continue
      const nn = Math.min(Math.floor((r - t0) / cada), cols * filas)
      for (let i = 0; i < nn; i++) {
        const slot = i
        const x0 = repo.x - repo.w / 2 + 12 + paso * ((slot % cols) + 0.5)
        const y0 = repo.y - repo.h / 2 + 12 + paso * (Math.floor(slot / cols) + 0.5)
        const e = suave(clamp01(k * 1.3 - (i / nn) * 0.3))
        archivo(ctx, lerp(x0, pen.x, e), lerp(y0, pen.y, e), (paso / 22) * (1 - e * 0.6), ap * (1 - e * 0.8), true)
      }
    }
  }
}

function escenaRange(ctx, W, H, t, L) {
  // 14,5–19: la anatomía de un archivo y lo que Penon lee por HTTP Range
  const a = tramo(t, T.range + 0.2, T.range + 0.7) * (1 - tramo(t, T.recorte - 0.3, T.recorte + 0.1))
  if (a <= 0) return
  const chico = L.m < 420
  const x0 = W * 0.07
  const w = W * 0.86
  const y = H * (L.ap ? 0.44 : 0.4)
  const h = Math.max(40, H * 0.1)
  const sube = L.ap ? 0 : 38
  texto(ctx, 'Un archivo del GLM', x0, y - h / 2 - (chico ? 64 : 78) - sube, { tam: chico ? 13 : 16, color: '#f8fafc', fam: SANS, peso: 700, a })
  texto(ctx, '~330 KB · 20 segundos de destellos de medio planeta', x0, y - h / 2 - (chico ? 46 : 56) - sube, { tam: chico ? 10.5 : 12, color: '#94a3b8', a })
  const arma = tramo(t, T.range + 0.3, T.range + 1.2)
  const pide = tramo(t, T.range + 1.4, T.range + 2.2)
  const sale = tramo(t, T.range + 2.4, T.range + 3.3)
  const etiquetas = []
  const yl = H * (L.ap ? 0.8 : 0.78)
  const anchoLeido = w * (12 / 330)
  let acum = W / 2 - anchoLeido / 2
  BLOQUES.forEach((b, i) => {
    if (b.x > arma) return
    const bx = x0 + b.x * w
    const bw = Math.max(b.nombre ? 3 : 1, b.w * w - 1)
    if (b.nombre) {
      const destino = acum
      acum += b.w * w
      ctx.save()
      ctx.globalAlpha = a
      ctx.fillStyle = `rgba(248,250,252,${0.3 + 0.7 * pide})`
      ctx.shadowColor = 'rgba(248,250,252,0.9)'
      ctx.shadowBlur = 12 * pide
      ctx.fillRect(lerp(bx, destino, sale), lerp(y, yl, sale) - h / 2, Math.max(bw, b.w * w), h)
      ctx.restore()
      etiquetas.push([bx + bw / 2, b.nombre])
    } else {
      ctx.fillStyle = `rgba(51,65,85,${a * (0.95 - 0.6 * sale) * (i % 2 ? 0.85 : 1)})`
      ctx.fillRect(bx, y - h / 2, bw, h)
    }
  })
  // las cuatro variables que pide, con su nombre real
  etiquetas.forEach(([x, nombre], i) => {
    const aa = a * pide * (1 - sale)
    if (aa <= 0) return
    const fila = L.ap ? i % 2 : i
    const ly = y - h / 2 - 12 - fila * (chico ? 14 : 17)
    ctx.save()
    ctx.globalAlpha = aa
    ctx.strokeStyle = 'rgba(248,250,252,0.5)'
    ctx.beginPath()
    ctx.moveTo(x, y - h / 2 - 2)
    ctx.lineTo(x, ly + 3)
    ctx.stroke()
    ctx.restore()
    texto(ctx, nombre, x, ly, { tam: chico ? 10 : 11.5, color: '#f8fafc', al: i === 3 ? 'right' : i === 0 ? 'left' : 'center', a: aa })
  })
  texto(ctx, 'HTTP Range: pide solo esos bytes', x0, y + h / 2 + (chico ? 20 : 24), { tam: chico ? 11 : 12.5, color: '#e2e8f0', a: a * pide * (1 - sale) })
  // lo que llega a Penon
  if (sale > 0) {
    const al = tramo(t, T.range + 3.0, T.range + 3.4)
    texto(ctx, '~12 KB', W / 2 + anchoLeido / 2 + 12, yl + 8, { tam: chico ? 20 : 26, color: '#f8fafc', fam: SANS, peso: 800, a: a * al })
    texto(ctx, 'llegan a Penon', W / 2 - anchoLeido / 2 - 12, yl + 5, { tam: chico ? 11 : 13, color: '#6ee7b7', al: 'right', a: a * al })
  }
  const cmp = tramo(t, T.range + 3.2, T.range + 3.8)
  texto(ctx, 'Sin HTTP Range serían 2 GB por día', W / 2, H * (L.ap ? 0.93 : 0.92), { tam: chico ? 11 : 13, color: '#94a3b8', al: 'center', a: a * cmp })
}

function escenaRecorte(ctx, W, H, t, L) {
  // 19–22,5: todo lo que vio el GLM; queda lo que cae en la provincia
  const a = tramo(t, T.recorte, T.recorte + 0.5) * (1 - tramo(t, T.sol - 0.1, T.sol + 0.4))
  if (a <= 0) return
  const v = L.disco
  const z = tramo(t, T.recorte + 1.7, T.recorte + 3.2)
  const pc = proyectar(-68.4, -53.9, v)
  const pa = proyectar(-71.5, -54, v)
  const pb = proyectar(-65.2, -54, v)
  const Z = (W * (L.ap ? 0.62 : 0.8)) / Math.max(10, Math.abs(pb[0] - pa[0]))
  const zk = lerp(1, Z, z)
  ctx.save()
  ctx.translate(lerp(pc[0], W / 2, z), lerp(pc[1], H / 2, z))
  ctx.scale(zk, zk)
  ctx.translate(-pc[0], -pc[1])
  globo(ctx, v, a, 1 - clamp01(z * 4))
  // todos los destellos que vio, quietos; afuera del recuadro se van
  const recorta = tramo(t, T.recorte + 0.7, T.recorte + 1.5)
  for (const d of DESTELLOS) {
    if (d.t0 > T.recorte) continue
    const p = proyectar(d.lon, d.lat, v)
    if (!p) continue
    const dentro = d.lon >= BBOX.o && d.lon <= BBOX.e && d.lat >= BBOX.s && d.lat <= BBOX.n
    const aa = a * (dentro ? 1 : 1 - recorta) * 0.7
    if (aa <= 0) continue
    ctx.fillStyle = dentro ? `rgba(34,211,238,${a})` : `rgba(34,211,238,${aa})`
    ctx.beginPath()
    ctx.arc(p[0], p[1], ((dentro ? 3.2 : 1.4) * (1 + z * 0.5)) / zk, 0, Math.PI * 2)
    ctx.fill()
  }
  // la isla, al acercarse
  if (z > 0) {
    ctx.save()
    ctx.globalAlpha = a * z
    ctx.lineWidth = 1 / zk
    for (const pol of ISLA_TODA) {
      ctx.fillStyle = pol.ch ? '#0d1628' : '#16233d'
      ctx.strokeStyle = pol.ch ? '#334155' : '#94a3b8'
      ctx.beginPath()
      pol.p.forEach(([lon, lat], i) => {
        const p = proyectar(lon, lat, v)
        if (!p) return
        if (i) ctx.lineTo(p[0], p[1])
        else ctx.moveTo(p[0], p[1])
      })
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }
    ctx.restore()
    for (const d of DESTELLOS) {
      if (!d.tdf) continue
      const p = proyectar(d.lon, d.lat, v)
      ctx.save()
      ctx.globalAlpha = a
      ctx.fillStyle = CIAN
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5 / zk
      ctx.beginPath()
      ctx.arc(p[0], p[1], 6 / zk, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
  }
  ctx.save()
  ctx.globalAlpha = a * tramo(t, T.recorte + 0.3, T.recorte + 0.8)
  ctx.strokeStyle = '#f8fafc'
  ctx.lineWidth = 1.2 / zk
  ctx.setLineDash([5 / zk, 4 / zk])
  contornoBbox(ctx, v)
  ctx.stroke()
  ctx.restore()
  ctx.restore()
  const chico = L.m < 420
  const aFuera = a * recorta * (1 - z)
  if (aFuera > 0 && pc) pildora(ctx, '99,99 % cae en otras latitudes: se descarta', W / 2, chico ? 28 : 34, { tam: chico ? 10.5 : 12.5, al: 'center', a: aFuera })
  texto(ctx, 'La provincia: unos pocos rayos por temporada', W / 2, H - (chico ? 18 : 26), { tam: chico ? 11 : 13, color: '#f8fafc', al: 'center', a: a * tramo(t, T.recorte + 2.8, T.recorte + 3.3) })
}

function escenaSol(ctx, W, H, t, L, reloj) {
  // 22,5–29,5: noche del 23/09/2026. El Sol pasa detrás de la Tierra vista desde GOES-19.
  const a = tramo(t, T.sol + 0.1, T.sol + 0.6) * (1 - tramo(t, T.mapa - 0.4, T.mapa + 0.2))
  if (a <= 0) return
  const chico = L.m < 420
  const v = L.sol
  const utc = Math.max(230, Math.min(352, 238 + (t - (T.sol + 0.5)) * 25))
  const dentroVentana = VENTANAS.some(([x, y]) => utc >= x && utc <= y)
  // la banda de intrusión alrededor del disco
  ctx.save()
  ctx.globalAlpha = a * 0.9
  ctx.fillStyle = 'rgba(251,191,36,0.07)'
  ctx.beginPath()
  ctx.arc(v.cx, v.cy, v.r * BANDA[1], 0, Math.PI * 2)
  ctx.arc(v.cx, v.cy, v.r * BANDA[0], 0, Math.PI * 2, true)
  ctx.fill()
  ctx.strokeStyle = 'rgba(251,191,36,0.35)'
  ctx.setLineDash([3, 4])
  ctx.beginPath()
  ctx.arc(v.cx, v.cy, v.r * BANDA[1], 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
  texto(ctx, 'si el Sol pasa por acá, entra al GLM', v.cx, v.cy - v.r * BANDA[1] - 8, { tam: chico ? 10.5 : 12, color: '#fcd34d', al: 'center', a: a * 0.9 })
  // el Sol (detrás del disco: se dibuja antes y la Tierra lo tapa)
  const sx = v.cx + ((utc - MEDIO_ECLIPSE) * SOL_GRADO_MIN * v.r) / RADIO_ANG
  // a 0,334 radios del centro: con esa cuerda y 0,2385°/min el recorrido reproduce las dos ventanas
  // y el eclipse que calcula Penon para esa noche
  const sy = v.cy + v.r * 0.334
  const brillo = dentroVentana ? 1 : 0.55
  const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, v.r * (0.35 + 0.35 * brillo))
  halo.addColorStop(0, `rgba(255,247,214,${0.9 * a})`)
  halo.addColorStop(0.15, `rgba(253,224,71,${0.45 * a * brillo})`)
  halo.addColorStop(1, 'rgba(253,224,71,0)')
  ctx.fillStyle = halo
  ctx.beginPath()
  ctx.arc(sx, sy, v.r * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = `rgba(255,251,235,${a})`
  ctx.beginPath()
  ctx.arc(sx, sy, Math.max(3, v.r * 0.035), 0, Math.PI * 2)
  ctx.fill()
  globo(ctx, v, a)
  // encandilamiento: el borde del disco se lava de luz mientras dura la ventana
  if (dentroVentana) {
    const g = ctx.createRadialGradient(sx, sy, v.r * 0.1, sx, sy, v.r * 1.1)
    g.addColorStop(0, `rgba(255,251,235,${0.35 * a})`)
    g.addColorStop(1, 'rgba(255,251,235,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(v.cx, v.cy, v.r, 0, Math.PI * 2)
    ctx.fill()
  }
  // la ráfaga de rayos falsos sobre TdF
  const tacha = tramo(t, T.ventana + 1.6, T.ventana + 2.2)
  const pt = proyectar(TDF[0], TDF[1], v)
  for (const f of FALSOS) {
    if (utc < f.min) continue
    const p = proyectar(f.lon, f.lat, v)
    if (!p) continue
    const edad = utc - f.min
    ctx.fillStyle = `rgba(248,113,113,${a * (1 - tacha) * (edad < 1.5 ? 1 : 0.8)})`
    ctx.beginPath()
    ctx.arc(p[0], p[1], edad < 1.5 ? 3 : 2, 0, Math.PI * 2)
    ctx.fill()
  }
  // un anillo que late sobre la ráfaga mientras dura
  if (pt && dentroVentana) {
    ctx.save()
    ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(reloj * 9))
    ctx.strokeStyle = FALSO
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(pt[0], pt[1], v.r * 0.14, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }
  const nFalsos = FALSOS.filter((f) => utc >= f.min).length
  if (nFalsos > 0 && pt) {
    const lx = L.ap ? pt[0] + v.r * 0.55 : pt[0] + v.r * 0.3
    const ly = pt[1] + v.r * 0.32
    const aa = a * (1 - tacha)
    texto(ctx, 'rayos falsos sobre TdF', lx, ly, { tam: chico ? 10.5 : 12, color: FALSO, peso: 600, a: aa })
    texto(ctx, '80 a 280 por ráfaga', lx, ly + (chico ? 14 : 16), { tam: chico ? 10 : 11, color: '#fca5a5', a: aa })
    if (tacha > 0) {
      ctx.save()
      ctx.globalAlpha = a * tacha
      ctx.strokeStyle = FALSO
      ctx.lineWidth = 2
      const r = v.r * 0.16
      ctx.beginPath()
      ctx.arc(pt[0], pt[1], r, 0, Math.PI * 2)
      ctx.moveTo(pt[0] - r * 0.7, pt[1] + r * 0.7)
      ctx.lineTo(pt[0] + r * 0.7, pt[1] - r * 0.7)
      ctx.stroke()
      ctx.restore()
      texto(ctx, 'descartados', pt[0] + v.r * 0.2, pt[1] - v.r * 0.18, { tam: chico ? 11 : 12.5, color: FALSO, peso: 700, a: a * tacha })
    }
  }
  // eclipse: el Sol detrás de la Tierra
  const enEclipse = utc > VENTANAS[0][1] && utc < VENTANAS[1][0]
  texto(ctx, enEclipse ? 'eclipse: el Sol queda detrás de la Tierra' : '', v.cx, v.cy + v.r * BANDA[1] + (chico ? 14 : 18), { tam: chico ? 10.5 : 12, color: '#94a3b8', al: 'center', a })
  // el reloj (en vertical cede su lugar al sello del mapa)
  const aReloj = a * (L.ap ? 1 : 1 - tramo(t, T.ventana + 2.0, T.ventana + 2.3))
  texto(ctx, `23/09/2026 · ${hhmm(utc)} UTC`, W - 14, 24, { tam: chico ? 12 : 14, color: dentroVentana ? '#fcd34d' : '#e2e8f0', al: 'right', a: aReloj })
  texto(ctx, 'vista desde GOES-19', W - 14, chico ? 40 : 44, { tam: chico ? 10 : 11, color: '#64748b', al: 'right', a: aReloj })

  // la línea de tiempo de la noche
  const ax0 = W * 0.08
  const ax1 = W * 0.92
  const ay = H * (L.ap ? 0.885 : 0.86)
  const X = (m) => ax0 + ((m - 230) / (352 - 230)) * (ax1 - ax0)
  ctx.save()
  ctx.globalAlpha = a
  ctx.strokeStyle = 'rgba(148,163,184,0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(ax0, ay)
  ctx.lineTo(ax1, ay)
  ctx.stroke()
  for (const m of [240, 270, 300, 330]) {
    ctx.beginPath()
    ctx.moveTo(X(m), ay - 3)
    ctx.lineTo(X(m), ay + 3)
    ctx.stroke()
  }
  // el GLM encandilado, a medida que pasa
  VENTANAS.forEach(([x, y]) => {
    if (utc < x) return
    ctx.fillStyle = 'rgba(251,191,36,0.85)'
    ctx.fillRect(X(x), ay - 5, X(Math.min(utc, y)) - X(x), 10)
  })
  ctx.restore()
  for (const m of [240, 270, 300, 330]) texto(ctx, hhmm(m), X(m), ay + (chico ? 17 : 19), { tam: chico ? 10 : 11, color: '#64748b', al: 'center', a })
  // lo que calcula Penon
  const calc = tramo(t, T.ventana + 0.2, T.ventana + 0.9)
  if (calc > 0) {
    VENTANAS.forEach(([x, y], i) => {
      texto(ctx, `${hhmm(x)}–${hhmm(y)}`, i ? X(y) : X(x), ay - 12, { tam: chico ? 10 : 11, color: '#fcd34d', al: i ? 'right' : 'left', a: a * calc })
    })
    ctx.save()
    ctx.globalAlpha = a * calc
    ctx.strokeStyle = '#f8fafc'
    ctx.lineWidth = 1.2
    const by = ay - (chico ? 30 : 34)
    ctx.beginPath()
    ctx.moveTo(X(VENTANAS[0][0]), by + 6)
    ctx.lineTo(X(VENTANAS[0][0]), by)
    ctx.lineTo(X(VENTANAS[1][1]), by)
    ctx.lineTo(X(VENTANAS[1][1]), by + 6)
    ctx.stroke()
    ctx.restore()
    texto(ctx, `Penon: sin dato de ${hhmm(VENTANAS[0][0])} a ${hhmm(VENTANAS[1][1])} UTC`, (X(VENTANAS[0][0]) + X(VENTANAS[1][1])) / 2, ay - (chico ? 36 : 41), {
      tam: chico ? 10.5 : 12,
      color: '#f8fafc',
      al: 'center',
      peso: 600,
      a: a * calc,
    })
  }
  // el sello del mapa, como lo muestra Penon (hora de Ushuaia)
  const sello = tramo(t, T.ventana + 2.2, T.ventana + 2.7)
  if (sello > 0) {
    const sxl = L.ap ? W - 14 : W / 2
    const syl = L.ap ? 76 : 22
    pildora(ctx, '⚡ Rayos · 0 en 24 h · sin dato 1:06–2:40', sxl, syl, { tam: chico ? 11 : 13, al: L.ap ? 'right' : 'center', a: a * sello, color: '#f8fafc', borde: 'rgba(248,250,252,0.5)' })
    texto(ctx, 'así lo dice el mapa (hora de Ushuaia)', sxl, syl + (chico ? 21 : 28), { tam: chico ? 10 : 11, color: '#94a3b8', al: L.ap ? 'right' : 'center', a: a * sello })
  }
  void reloj
}

/** Pinta el instante t de la película (capítulos 1 y 2). */
export function dibujar(ctx, W, H, t, reloj) {
  const L = disposicion(W, H)
  ctx.clearRect(0, 0, W, H)
  const aEstrellas = 1 - tramo(t, T.mapa - 0.4, T.mapa + 0.2) * 0.6
  estrellas(ctx, W, H, reloj, aEstrellas)
  if (t < T.repo + 0.5) escenaOrbita(ctx, W, H, t, L, reloj)
  if (t >= T.repo && t < T.range + 0.5) escenaRepo(ctx, W, H, t, L)
  if (t >= T.range && t < T.recorte + 0.2) escenaRange(ctx, W, H, t, L)
  if (t >= T.recorte - 0.1 && t < T.sol + 0.5) escenaRecorte(ctx, W, H, t, L)
  if (t >= T.sol && t < T.mapa + 0.3) escenaSol(ctx, W, H, t, L, reloj)
}

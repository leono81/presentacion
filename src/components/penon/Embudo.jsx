import { useEffect, useRef, useState } from 'react'
import datos from './embudo.json'
import isla from './isla.json'
import './embudo.css'

/*
 * El embudo: «datos globales → inteligencia local», literal. Los focos reales que NASA FIRMS
 * registró en el planeta en 24 h (VIIRS NOAA-21) se encienden con el paso del satélite, caen en
 * espiral sobre Tierra del Fuego y se abre la isla, donde Penon les suma lo local: las zonas de
 * peligro de la Provincia, las estaciones del SMN y el bosque nativo. Corre una vez cada vez que
 * entra en pantalla y queda quieto en el cuadro final. Datos: datos/embudo.py en la pieza
 * penon/presentaciones/2026-11-fwi-memoria-del-monte (repo assets).
 */

const FIN = 5.1
const REDUCIDO = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// ---------- el mundo ----------
const L0 = -25 // meridiano del borde izquierdo: América queda a la derecha, al lado de la isla
const SPAN = datos.latN - datos.latS
const ASPECTO_MUNDO = 360 / SPAN
const mx = (lon) => ((((lon - L0) % 360) + 360) % 360) / 360
const my = (lat) => (datos.latN - lat) / SPAN
const TDF = [mx(-67.7), my(-54.0)]

const FOCOS = datos.focos.split(';').map((s) => {
  const [i, j, n] = s.split(',').map(Number)
  return { lon: -180 + (i + 0.5) * datos.pasoF, lat: datos.latN - (j + 0.5) * datos.pasoF, n }
})
const TIERRA = []
datos.tierra.forEach((fila, j) => {
  ;[...fila].forEach((h, k) => {
    const v = parseInt(h, 16)
    for (let b = 0; b < 4; b++) {
      if (v & (8 >> b)) TIERRA.push([-180 + (k * 4 + b + 0.5) * datos.pasoT, datos.latN - (j + 0.5) * datos.pasoT])
    }
  })
})

// PRNG con semilla: el dibujo es siempre el mismo
function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// partículas: salen de los focos, ponderadas por cuántos hay en cada celda
function sortearParticulas(cuantas) {
  const r = mulberry32(2022)
  const acum = []
  let s = 0
  for (const f of FOCOS) acum.push((s += Math.sqrt(f.n)))
  const out = []
  for (let k = 0; k < cuantas; k++) {
    const u = r() * s
    let lo = 0
    let hi = acum.length - 1
    while (lo < hi) {
      const m = (lo + hi) >> 1
      if (acum[m] < u) lo = m + 1
      else hi = m
    }
    const f = FOCOS[lo]
    out.push({
      x: mx(f.lon + (r() - 0.5) * datos.pasoF),
      y: my(f.lat + (r() - 0.5) * datos.pasoF),
      t0: 0.8 + r() * 0.75,
      dur: 1.05 + r() * 0.3,
      giro: 0.12 + r() * 0.22,
    })
  }
  return out
}
const PARTICULAS = { mucho: sortearParticulas(1500), poco: sortearParticulas(700) }

// ---------- la isla ----------
const { capas, zonasD } = isla
const IVB = { x: -150, y: -10, w: 560, h: 315 }
const ASPECTO_ISLA = IVB.w / IVB.h
const ESTACIONES = [
  { k: 'rg', x: 144.2, y: 151.1, nombre: 'SMN Río Grande' },
  { k: 'us', x: 104.4, y: 264, nombre: 'SMN Ushuaia', izq: true },
]
const TOLHUIN = { x: 177, y: 231.3 }
const ZONAS = [
  { k: 'norte', nombre: 'Norte', x: 150, y: 80, t0: 3.3 },
  { k: 'centro', nombre: 'Centro', x: 122, y: 214, t0: 3.45 },
  { k: 'sur', nombre: 'Sur', x: 236, y: 266, t0: 3.6 },
]
const T_ZONAS = 3.3
const T_SMN = 3.95
const T_BOSQUE = 4.45

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
const suave = (v) => v * v * (3 - 2 * v)
const tramo = (t, a, b) => suave(clamp((t - a) / (b - a)))
const fmt = (n) => n.toLocaleString('es-AR')
const FECHAS = (() => {
  const d = datos.fechas.map((f) => f.split('-'))
  return d.length === 2 && d[0][1] === d[1][1] ? `${+d[0][2]} y ${+d[1][2]}/${d[0][1]}/${d[0][0]}` : datos.fechas.join(' · ')
})()

/** Dónde va cada cosa según el ancho. En pantallas angostas, el mundo arriba y la isla abajo. */
function armar(W) {
  if (W >= 760) {
    const cab = 50
    const mw = Math.round(W * 0.552)
    const mh = Math.round(mw / ASPECTO_MUNDO)
    const ih = mh
    const iw = Math.round(ih * ASPECTO_ISLA)
    return { W, H: cab + mh + 6, vertical: false, mundo: { x: 0, y: cab, w: mw, h: mh }, isla: { x: W - iw, y: cab, w: iw, h: ih } }
  }
  const cab = 44
  const mh = Math.round(W / ASPECTO_MUNDO)
  const iy = cab + mh + 34
  const ih = Math.round(W / ASPECTO_ISLA)
  return { W, H: iy + ih + 58, vertical: true, mundo: { x: 0, y: cab, w: W, h: mh }, isla: { x: 0, y: iy, w: W, h: ih } }
}
const enIsla = (L, x, y) => {
  const s = L.isla.w / IVB.w
  return [L.isla.x + (x - IVB.x) * s, L.isla.y + (y - IVB.y) * s]
}

/** Capas fijas (tierra del mundo y focos) en lienzos aparte, a la resolución de la pantalla. */
function preparar(L, dpr) {
  const hacer = (fn) => {
    const c = document.createElement('canvas')
    c.width = Math.ceil(L.mundo.w * dpr)
    c.height = Math.ceil(L.mundo.h * dpr)
    const g = c.getContext('2d')
    g.scale(dpr, dpr)
    fn(g)
    return c
  }
  const k = L.mundo.w / 680
  const tierra = hacer((g) => {
    g.fillStyle = '#64748b'
    g.beginPath()
    const r = Math.max(0.55, 0.95 * k)
    for (const [lon, lat] of TIERRA) {
      const x = mx(lon) * L.mundo.w
      const y = my(lat) * L.mundo.h
      g.moveTo(x + r, y)
      g.arc(x, y, r, 0, Math.PI * 2)
    }
    g.fill()
  })
  const focos = hacer((g) => {
    for (const f of FOCOS) {
      const x = mx(f.lon) * L.mundo.w
      const y = my(f.lat) * L.mundo.h
      const q = Math.min(1, Math.log10(f.n + 1) / 2.6)
      if (q > 0.7) {
        g.fillStyle = 'rgba(249,115,22,0.16)'
        g.beginPath()
        g.arc(x, y, (1.6 + q * 1.6) * k, 0, Math.PI * 2)
        g.fill()
      }
      g.fillStyle = q > 0.6 ? '#fed7aa' : q > 0.3 ? '#fb923c' : '#ea580c'
      g.globalAlpha = 0.55 + q * 0.45
      g.beginPath()
      g.arc(x, y, Math.max(0.55, (0.45 + q * 0.75) * k), 0, Math.PI * 2)
      g.fill()
      g.globalAlpha = 1
    }
  })
  return {
    tierra,
    focos,
    rutas: {
      tierra: new Path2D(capas.tierra),
      chile: new Path2D(capas.chileIsla),
      lagos: new Path2D(capas.lagos),
      bosque: new Path2D(capas.bosque),
      zonas: ZONAS.map((z) => new Path2D(zonasD[z.k])),
    },
    particulas: L.vertical ? PARTICULAS.poco : PARTICULAS.mucho,
  }
}

function dibujar(ctx, L, pre, t) {
  const { mundo: M, isla: I } = L
  ctx.clearRect(0, 0, L.W, L.H)

  // 1. el mundo en puntos y el barrido del satélite
  ctx.globalAlpha = 0.5 * tramo(t, 0, 0.35)
  ctx.drawImage(pre.tierra, M.x, M.y, M.w, M.h)
  const barrido = clamp(t / 0.9)
  const sx = M.x + M.w * barrido
  const apagado = 1 - 0.5 * tramo(t, 0.95, 2.3)
  if (barrido > 0) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(M.x, M.y - 4, sx - M.x, M.h + 8)
    ctx.clip()
    ctx.globalAlpha = apagado
    ctx.drawImage(pre.focos, M.x, M.y, M.w, M.h)
    ctx.restore()
  }
  if (t < 1.05) {
    const a = 1 - tramo(t, 0.85, 1.05)
    const grad = ctx.createLinearGradient(sx - 46, 0, sx, 0)
    grad.addColorStop(0, 'rgba(249,115,22,0)')
    grad.addColorStop(1, `rgba(249,115,22,${0.16 * a})`)
    ctx.globalAlpha = 1
    ctx.fillStyle = grad
    ctx.fillRect(sx - 46, M.y, 46, M.h)
    ctx.fillStyle = `rgba(254,215,170,${0.55 * a})`
    ctx.fillRect(sx - 0.5, M.y, 1, M.h)
  }

  // 2. el embudo: los focos caen en espiral sobre Tierra del Fuego
  const px = M.x + TDF[0] * M.w
  const py = M.y + TDF[1] * M.h
  if (t > 0.8 && t < 3) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(M.x, M.y - 2, M.w + 4, M.h + 6)
    ctx.clip()
    ctx.globalCompositeOperation = 'lighter'
    const pos = (p, s) => {
      const dx = M.x + p.x * M.w - px
      const dy = M.y + p.y * M.h - py
      const r0 = Math.hypot(dx, dy)
      const e = Math.pow(s, 1.35)
      const r = r0 * (1 - e)
      const th = Math.atan2(dy, dx) + p.giro * Math.sin(Math.PI * s) * Math.min(1, r0 / 180)
      return [px + Math.cos(th) * r, py + Math.sin(th) * r]
    }
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgba(251,146,60,0.32)'
    ctx.beginPath()
    const cabezas = []
    for (const p of pre.particulas) {
      const s = (t - p.t0) / p.dur
      if (s <= 0 || s >= 1) continue
      const [x1, y1] = pos(p, s)
      const [x0, y0] = pos(p, Math.max(0, s - 0.13))
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      cabezas.push(x1, y1)
    }
    ctx.stroke()
    ctx.fillStyle = 'rgba(254,215,170,0.85)'
    for (let i = 0; i < cabezas.length; i += 2) ctx.fillRect(cabezas[i] - 0.8, cabezas[i + 1] - 0.8, 1.6, 1.6)
    ctx.restore()
  }

  // 3. llega todo: pulso en TdF y la lupa que abre la isla
  if (t > 2.2) {
    ctx.globalAlpha = 1
    for (const d of [0, 0.35]) {
      const s = clamp((t - 2.3 - d) / 0.9)
      if (s > 0 && s < 1) {
        ctx.strokeStyle = `rgba(253,186,116,${(1 - s) * 0.8})`
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.arc(px, py, 3 + s * 24, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
    const brillo = tramo(t, 2.2, 2.6)
    const halo = ctx.createRadialGradient(px, py, 0, px, py, 12)
    halo.addColorStop(0, `rgba(251,146,60,${0.55 * brillo})`)
    halo.addColorStop(1, 'rgba(251,146,60,0)')
    ctx.fillStyle = halo
    ctx.fillRect(px - 12, py - 12, 24, 24)
    ctx.fillStyle = `rgba(255,237,213,${brillo})`
    ctx.beginPath()
    ctx.arc(px, py, 2.2, 0, Math.PI * 2)
    ctx.fill()

    const lupa = tramo(t, 2.5, 3.15)
    if (lupa > 0) {
      const qw = 9
      const qh = 7
      ctx.strokeStyle = `rgba(203,213,225,${0.55 * clamp(lupa * 3)})`
      ctx.lineWidth = 1
      ctx.strokeRect(px - qw, py - qh, qw * 2, qh * 2)
      // de las esquinas del recuadro chico a las del grande
      const pares = L.vertical
        ? [[[px - qw, py + qh], [I.x, I.y]], [[px + qw, py + qh], [I.x + I.w, I.y]]]
        : [[[px + qw, py - qh], [I.x, I.y]], [[px + qw, py + qh], [I.x, I.y + I.h]]]
      ctx.strokeStyle = 'rgba(148,163,184,0.38)'
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      for (const [[a, b], [c, d]] of pares) {
        ctx.moveTo(a, b)
        ctx.lineTo(a + (c - a) * lupa, b + (d - b) * lupa)
      }
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  // 4. la isla, y lo local encima
  const base = tramo(t, 2.95, 3.4)
  if (base > 0) {
    ctx.globalAlpha = base
    ctx.fillStyle = 'rgba(5,11,24,0.85)'
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(I.x + 0.5, I.y + 0.5, I.w - 1, I.h - 1, 12)
    ctx.fill()
    ctx.stroke()

    const s = I.w / IVB.w
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(I.x, I.y, I.w, I.h, 12)
    ctx.clip()
    ctx.translate(I.x - IVB.x * s, I.y - IVB.y * s)
    ctx.scale(s, s)
    const R = pre.rutas
    ctx.lineWidth = 0.7 / s
    ctx.fillStyle = '#0b1324'
    ctx.strokeStyle = '#334155'
    ctx.fill(R.chile)
    ctx.stroke(R.chile)
    ctx.fillStyle = '#111c30'
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 0.9 / s
    ctx.fill(R.tierra)
    ctx.stroke(R.tierra)

    // bosque nativo
    const bosque = tramo(t, T_BOSQUE, T_BOSQUE + 0.5)
    if (bosque > 0) {
      ctx.globalAlpha = base * bosque
      ctx.fillStyle = 'rgba(34,197,94,0.26)'
      ctx.fill(R.bosque)
    }
    ctx.globalAlpha = base
    ctx.fillStyle = '#050b18'
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 0.5 / s
    ctx.fill(R.lagos)
    ctx.stroke(R.lagos)

    // zonas de peligro de la Provincia
    ZONAS.forEach((z, i) => {
      const a = tramo(t, z.t0, z.t0 + 0.4)
      if (a <= 0) return
      ctx.globalAlpha = base * a
      ctx.fillStyle = 'rgba(16,185,129,0.06)'
      ctx.fill(R.zonas[i])
      ctx.strokeStyle = 'rgba(16,185,129,0.9)'
      ctx.lineWidth = 1.2 / s
      ctx.setLineDash([4 / s, 3 / s])
      ctx.stroke(R.zonas[i])
      ctx.setLineDash([])
    })
    ctx.restore()

    // estaciones del SMN (Tolhuin no tiene: la observación la carga la brigada)
    ESTACIONES.forEach((e, i) => {
      const a = tramo(t, T_SMN + i * 0.12, T_SMN + 0.3 + i * 0.12)
      if (a <= 0) return
      const [x, y] = enIsla(L, e.x, e.y)
      const ping = clamp((t - T_SMN - i * 0.12) / 0.8)
      if (ping < 1) {
        ctx.globalAlpha = 1 - ping
        ctx.strokeStyle = '#f8fafc'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(x, y, 4 + ping * 14, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = a
      ctx.fillStyle = '#f8fafc'
      ctx.strokeStyle = '#10B981'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(x, y, 3.6, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
    })
    const ta = tramo(t, T_SMN + 0.3, T_SMN + 0.6)
    if (ta > 0) {
      const [x, y] = enIsla(L, TOLHUIN.x, TOLHUIN.y)
      ctx.globalAlpha = ta
      ctx.strokeStyle = '#cbd5e1'
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.arc(x, y, 3.2, 0, Math.PI * 2)
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
}

export default function Embudo() {
  const cajaRef = useRef(null)
  const lienzoRef = useRef(null)
  const cuentaRef = useRef(null)
  const tRef = useRef(REDUCIDO ? FIN : 0)
  const [L, setL] = useState(null)

  useEffect(() => {
    const caja = cajaRef.current
    const ro = new ResizeObserver(([e]) => {
      const w = Math.round(e.contentRect.width)
      setL((prev) => (prev && prev.W === w ? prev : armar(w)))
    })
    ro.observe(caja)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!L) return
    const caja = cajaRef.current
    const cv = lienzoRef.current
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    cv.width = Math.round(L.W * dpr)
    cv.height = Math.round(L.H * dpr)
    const ctx = cv.getContext('2d')
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const pre = preparar(L, dpr)
    const rotulos = [...caja.querySelectorAll('[data-t0]')].map((el) => [el, +el.dataset.t0])

    const pintar = (t) => {
      dibujar(ctx, L, pre, t)
      for (const [el, t0] of rotulos) el.style.opacity = tramo(t, t0, t0 + 0.35)
      if (cuentaRef.current) cuentaRef.current.textContent = fmt(Math.round(datos.total * suave(clamp(t / 0.9))))
    }
    pintar(tRef.current)
    if (REDUCIDO) return

    let raf = 0
    let antes = 0
    const tick = (ahora) => {
      const dt = antes ? Math.min(0.05, (ahora - antes) / 1000) : 0
      antes = ahora
      tRef.current = Math.min(FIN, tRef.current + dt)
      pintar(tRef.current)
      if (tRef.current < FIN) raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        cancelAnimationFrame(raf)
        if (e.isIntersecting) {
          // cada vez que entra en pantalla, desde el principio (si ya terminó)
          if (tRef.current >= FIN) tRef.current = 0
          antes = 0
          raf = requestAnimationFrame(tick)
        }
      },
      { threshold: 0.45 },
    )
    io.observe(caja)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [L])

  const pos = (x, y) => {
    const [a, b] = enIsla(L, x, y)
    return { left: a, top: b }
  }

  return (
    <div ref={cajaRef} className="em-caja" style={{ height: L ? L.H : undefined }}>
      <canvas
        ref={lienzoRef}
        className="em-lienzo"
        role="img"
        aria-label={`Animación: los ${fmt(datos.total)} focos que NASA FIRMS registró en el planeta en 24 horas caen sobre Tierra del Fuego, donde Penon les suma las zonas de peligro de la Provincia, las estaciones del SMN y el bosque nativo.`}
      />
      {L && (
        <>
          {/* el mundo */}
          <div className="em-cab" style={{ left: L.mundo.x, top: 0 }}>
            <div className="em-ceja" style={{ color: '#38BDF8' }}>Datos globales</div>
            <div className="em-linea">
              NASA FIRMS · <b ref={cuentaRef} className="em-num">{fmt(REDUCIDO ? datos.total : 0)}</b> focos en el planeta en 24 h
            </div>
          </div>
          <div className="em-fuente" style={{ left: L.mundo.x + 2, top: L.mundo.y + L.mundo.h - 14 }}>
            VIIRS NOAA-21 · {FECHAS}
          </div>

          {/* la isla */}
          <div
            className="em-cab"
            style={L.vertical ? { left: 0, top: L.isla.y + L.isla.h + 12 } : { left: L.isla.x, top: 0 }}
            data-t0="2.95"
          >
            <div className="em-ceja" style={{ color: '#10B981' }}>Inteligencia local · Tierra del Fuego</div>
            <div className="em-leyenda">
              <span data-t0={T_ZONAS}>
                <i className="em-ico-zona" />
                Zonas de peligro
              </span>
              <span data-t0={T_SMN}>
                <i className="em-ico-smn" />
                Estaciones SMN
              </span>
              <span data-t0={T_BOSQUE}>
                <i className="em-ico-bosque" />
                Bosque nativo
              </span>
            </div>
          </div>
          {ZONAS.map((z) => (
            <div key={z.k} className="em-zona" style={pos(z.x, z.y)} data-t0={z.t0 + 0.1}>
              {z.nombre}
            </div>
          ))}
          {ESTACIONES.map((e, i) => (
            <div key={e.k} className={e.izq ? 'em-punto em-izq' : 'em-punto'} style={pos(e.x, e.y)} data-t0={T_SMN + 0.1 + i * 0.12}>
              {e.nombre}
            </div>
          ))}
          <div className="em-punto em-tenue" style={pos(TOLHUIN.x, TOLHUIN.y)} data-t0={T_SMN + 0.4}>
            {L.vertical ? 'Tolhuin · brigada' : 'Tolhuin · carga la brigada'}
          </div>
        </>
      )}
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Thermometer, Droplets, Wind, CloudRain, RotateCcw, Flame } from 'lucide-react'
import datos from './memoria.json'
import './memoria.css'

/*
 * La memoria del monte: cómo se calcula el FWI, con los 53 días reales de Río Grande del 15/10 al
 * 6/12/2022 (planilla FWI de la zona norte, Gobierno de Tierra del Fuego, Manejo del Fuego; el tramo
 * lo copia assets/penon/presentaciones/2026-11-fwi-memoria-del-monte/datos/memoria.py, sin recalcular).
 * Un corte del suelo con tres capas, una por código de humedad, que se mojan y se secan a su ritmo;
 * de las capas salen ISI y BUI, y de los dos, el FWI con la escala oficial de la zona Norte.
 * Va en vivo: canvas para el suelo y los flujos, HTML para todo el texto.
 */

const D = datos.dias.map(([fecha, temp, hr, viento, lluvia, ffmc, dmc, dc, isi, bui, fwi, clase]) => ({
  fecha, temp, hr, viento, lluvia, ffmc, dmc, dc, isi, bui, fwi, clase,
}))
const N = D.length
const REDUCIDO = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const fechaLarga = (f) => `${+f.slice(3)} ${MESES[+f.slice(0, 2) - 1]} 2022`
const fechaCorta = (f) => `${+f.slice(3)}/${+f.slice(0, 2)}`
const n1 = (v) => v.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const iDe = (f) => D.findIndex((d) => d.fecha === f)

// Escala oficial de peligro de la Provincia para la zona Norte (penonInsight services/api/app/zones.py).
// La clase de cada día viene calculada en el JSON con la regla de Penon: round() de Python sobre el
// valor completo y cortes enteros inclusive.
const ESCALA = [
  { nombre: 'Bajo', rango: '0–3', color: '#22c55e' },
  { nombre: 'Moderado', rango: '4–10', color: '#3b82f6' },
  { nombre: 'Alto', rango: '11–20', color: '#eab308' },
  { nombre: 'Muy alto', rango: '21–35', color: '#f97316' },
  { nombre: 'Extremo', rango: '36 o más', color: '#ef4444' },
]
// ---------- el reloj: cuánto dura cada día en pantalla ----------
const BASE = 0.42
const LARGO = { '10-15': 1.5, '10-22': 1.7, '10-23': 2.9, '10-24': 1.2, '10-25': 1.2, '10-26': 1.0, '11-24': 1.2, '11-25': 1.4, '12-06': 4.6 }
const DUR = D.map((d) => LARGO[d.fecha] ?? BASE)
const T0 = DUR.map((_, i) => DUR.slice(0, i).reduce((a, x) => a + x, 0))
const TOTAL = T0[N - 1] + DUR[N - 1]
const diaEn = (t) => {
  let i = N - 1
  while (i > 0 && T0[i] > t) i--
  return i
}

// ---------- los momentos que cuentan la historia (todo sale de los datos) ----------
const dV = D[iDe('10-22')]
const dL = D[iDe('10-23')]
const dA = D[iDe('10-22')] // el día antes de la lluvia
const d24 = D[iDe('10-24')]
const d25 = D[iDe('10-25')]
const pA = D[iDe('11-24')]
const pB = D[iDe('11-25')]
const dF = D[N - 1]
// Condor (25/11): activo por detección satelital, GOES-16, ~18 UTC. La fecha de inicio no es oficial: no va.
const INCENDIO = 'Ese día, en la zona Centro, el incendio Corazón de la Isla ya estaba activo: lo detectó el satélite GOES-16 cerca de las 18 UTC.'

const MOMENTOS = [
  {
    fecha: fechaCorta(dV.fecha),
    titulo: `Viento de ${dV.viento} km/h`,
    texto: `Sobre hojarasca seca (FFMC ${n1(dV.ffmc)}), el viento dispara la propagación: ISI ${n1(dV.isi)}. FWI ${n1(dV.fwi)}, ${ESCALA[dV.clase].nombre.toLowerCase()}.`,
    foco: [iDe('10-22'), iDe('10-22')],
    bucle: [iDe('10-20'), iDe('10-23')],
    resalta: ['viento', 'isi'],
    notas: {},
  },
  {
    fecha: fechaCorta(dL.fecha),
    titulo: `Llueven ${n1(dL.lluvia)} mm`,
    texto: `La hojarasca se moja (FFMC ${n1(dA.ffmc)} → ${n1(dL.ffmc)}) y el FWI cae a ${n1(dL.fwi)}. La capa profunda ni se entera: DC ${n1(dA.dc)} → ${n1(dL.dc)}.`,
    foco: [iDe('10-23'), iDe('10-23')],
    bucle: [iDe('10-22'), iDe('10-24')],
    resalta: ['lluvia', 'fwi'],
    notas: { ffmc: `se moja · venía de ${n1(dA.ffmc)}`, dc: `ni se entera · venía de ${n1(dA.dc)}` },
  },
  {
    fecha: `${fechaCorta(d24.fecha)}–${fechaCorta(D[iDe('10-26')].fecha)}`,
    titulo: 'La superficie se seca',
    texto: `En dos días la hojarasca vuelve a estar seca (FFMC ${n1(d24.ffmc)} y ${n1(d25.ffmc)}) y el FWI sube una clase por día: alto, muy alto, extremo. Una lluvia no apaga la sequía de un mes.`,
    foco: [iDe('10-24'), iDe('10-26')],
    bucle: [iDe('10-23'), iDe('10-27')],
    resalta: ['fwi'],
    notas: { ffmc: 'ya se secó' },
  },
  {
    fecha: `${fechaCorta(pA.fecha)}–${fechaCorta(pB.fecha)}`,
    titulo: 'El pico',
    texto: `FWI ${n1(pA.fwi)} y ${n1(pB.fwi)}, lo más alto del período. Desde el 15/10 el DC no bajó ni un día: ${n1(D[0].dc)} → ${n1(pB.dc)}.`,
    foco: [iDe('11-24'), iDe('11-25')],
    bucle: [iDe('11-21'), iDe('11-26')],
    resalta: ['fwi', 'bui'],
    notas: { dc: `+${n1(pB.dc - D[0].dc)} desde el 15/10` },
  },
  {
    fecha: fechaCorta(dF.fecha),
    titulo: '6 de diciembre',
    texto: `FWI ${n1(dF.fwi)} en Río Grande, ${ESCALA[dF.clase].nombre.toLowerCase()}. ${INCENDIO}`,
    foco: [N - 1, N - 1],
    bucle: [iDe('12-03'), N],
    resalta: ['fwi'],
    notas: {},
  },
]
const momentoDe = (i) => MOMENTOS.findIndex((m) => i >= m.foco[0] && i <= m.foco[1])
const tramoDe = (m) => [T0[m.bucle[0]], m.bucle[1] >= N ? TOTAL : T0[m.bucle[1]]]

// ---------- dibujo ----------
// proporciones del corte, compartidas con los rótulos en HTML
const CIELO = 0.34
const C1 = 0.12
const C2 = 0.21

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const suave = (v) => v * v * (3 - 2 * v)
const mezcla = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k)
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`
// húmedo → seco: azul, pizarra, ámbar oscuro, ámbar, rojo
const RAMPA = [
  [0, [37, 99, 235]],
  [0.4, [82, 96, 120]],
  [0.62, [180, 83, 9]],
  [0.82, [245, 158, 11]],
  [1, [220, 38, 38]],
]
function rampa(v) {
  for (let i = 1; i < RAMPA.length; i++) {
    if (v <= RAMPA[i][0]) {
      const [a, ca] = RAMPA[i - 1]
      const [b, cb] = RAMPA[i]
      return mezcla(ca, cb, (v - a) / (b - a))
    }
  }
  return RAMPA[RAMPA.length - 1][1]
}
// qué tan seca está cada capa, en su propio rango (0 húmedo, 1 seco)
const SECO = {
  ffmc: (v) => clamp01((v - 70) / 22),
  dmc: (v) => clamp01(v / 110),
  dc: (v) => clamp01(v / 800),
}
const FONDO = [11, 18, 32]
const PASTO_VERDE = [74, 124, 62]
const PASTO_SECO = [205, 168, 96]

function azar(semilla) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Arma la escena para un tamaño dado y devuelve la función que dibuja un cuadro. */
function armar(g) {
  const { W, H, dpr, s } = g
  const esc = s.h / 440
  const ySup = s.y + s.h * CIELO
  const y1 = ySup + s.h * C1
  const y2 = y1 + s.h * C2
  const yFin = s.y + s.h
  const cieloH = ySup - s.y
  const L1 = y1 - ySup
  const L2 = y2 - y1
  const L3 = yFin - y2
  const onda = (k, amp) => (x) => amp * esc * (Math.sin(x * 0.019 + k * 1.7) * 0.6 + Math.sin(x * 0.053 + k * 2.9) * 0.4)
  const o0 = onda(0, 3.2)
  const o1 = onda(1, 2.6)
  const o2 = onda(2, 3.6)
  const b0 = (x) => ySup + o0(x)
  const b1 = (x) => y1 + o1(x)
  const b2 = (x) => y2 + o2(x)
  const xs = []
  for (let x = s.x; x <= s.x + s.w + 4; x += 4) xs.push(Math.min(x, s.x + s.w))

  const banda = (arriba, abajo) => {
    const p = new Path2D()
    xs.forEach((x, i) => (i ? p.lineTo(x, arriba(x)) : p.moveTo(x, arriba(x))))
    for (let i = xs.length - 1; i >= 0; i--) p.lineTo(xs[i], abajo(xs[i]))
    p.closePath()
    return p
  }
  const cieloP = banda(() => s.y, b0)
  const capaP = [banda(b0, b1), banda(b1, b2), banda(b2, () => yFin)]
  const sueloP = banda(b0, () => yFin)
  const linea = (f) => {
    const p = new Path2D()
    xs.forEach((x, i) => (i ? p.lineTo(x, f(x)) : p.moveTo(x, f(x))))
    return p
  }
  const bordes = [linea(b0), linea(b1), linea(b2)]

  // textura fija del suelo: se pinta una vez, clara y oscura, sobre el color del día
  const tex = document.createElement('canvas')
  tex.width = Math.round(W * dpr)
  tex.height = Math.round(H * dpr)
  const tx = tex.getContext('2d')
  tx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const r = azar(7)
  const enCapa = (x, arriba, abajo, m = 1.5) => arriba(x) + m + r() * Math.max(0, abajo(x) - arriba(x) - 2 * m)
  // hojarasca: hojitas
  for (let k = 0; k < (s.w * L1) / 70; k++) {
    const x = s.x + r() * s.w
    const y = enCapa(x, b0, b1)
    const rx = (2.6 + r() * 3.6) * esc
    const ry = (0.9 + r() * 1.3) * esc
    const a = (r() - 0.5) * 1.2
    tx.fillStyle = 'rgba(0,0,0,0.28)'
    tx.beginPath()
    tx.ellipse(x + 0.8, y + 0.9, rx, ry, a, 0, Math.PI * 2)
    tx.fill()
    tx.fillStyle = `rgba(255,240,220,${0.1 + r() * 0.16})`
    tx.beginPath()
    tx.ellipse(x, y, rx, ry, a, 0, Math.PI * 2)
    tx.fill()
  }
  // capa orgánica: fibras y raicillas
  tx.lineCap = 'round'
  for (let k = 0; k < (s.w * L2) / 120; k++) {
    const x = s.x + r() * s.w
    const y = enCapa(x, b1, b2)
    const l = (4 + r() * 10) * esc
    const a = (r() - 0.5) * 2.4
    tx.strokeStyle = `rgba(255,235,210,${0.06 + r() * 0.12})`
    tx.lineWidth = 0.8 + r() * 0.6
    tx.beginPath()
    tx.moveTo(x, y)
    tx.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 3, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 3, x + Math.cos(a) * l, y + Math.sin(a) * l)
    tx.stroke()
  }
  for (let k = 0; k < (s.w * L2) / 260; k++) {
    const x = s.x + r() * s.w
    tx.fillStyle = 'rgba(0,0,0,0.22)'
    tx.beginPath()
    tx.arc(x, enCapa(x, b1, b2), (0.6 + r()) * esc, 0, Math.PI * 2)
    tx.fill()
  }
  // raíces que bajan desde el pasto
  for (let k = 0; k < 9; k++) {
    let x = s.x + (0.05 + r() * 0.9) * s.w
    let y = b0(x) + 2
    const fin = y2 + L3 * (0.2 + r() * 0.5)
    tx.strokeStyle = 'rgba(255,230,200,0.10)'
    tx.lineWidth = 1.1 * esc
    tx.beginPath()
    tx.moveTo(x, y)
    while (y < fin) {
      x += (r() - 0.5) * 7 * esc
      y += (5 + r() * 6) * esc
      tx.lineTo(x, y)
    }
    tx.stroke()
  }
  // suelo profundo: granos y piedras
  for (let k = 0; k < (s.w * L3) / 55; k++) {
    const x = s.x + r() * s.w
    const y = enCapa(x, b2, () => yFin, 1)
    tx.fillStyle = r() < 0.5 ? `rgba(255,255,255,${0.04 + r() * 0.08})` : `rgba(0,0,0,${0.15 + r() * 0.2})`
    tx.fillRect(x, y, (0.8 + r() * 1.2) * esc, (0.8 + r() * 1.2) * esc)
  }
  for (let k = 0; k < (s.w * L3) / 2600; k++) {
    const x = s.x + r() * s.w
    const y = enCapa(x, b2, () => yFin, 8)
    const rx = (3 + r() * 6) * esc
    const ry = rx * (0.5 + r() * 0.3)
    tx.fillStyle = 'rgba(0,0,0,0.30)'
    tx.beginPath()
    tx.ellipse(x, y, rx, ry, (r() - 0.5) * 0.6, 0, Math.PI * 2)
    tx.fill()
    tx.strokeStyle = 'rgba(255,255,255,0.10)'
    tx.lineWidth = 1
    tx.beginPath()
    tx.ellipse(x, y, rx, ry, (r() - 0.5) * 0.6, Math.PI * 1.1, Math.PI * 1.7)
    tx.stroke()
  }

  // grietas: se abren a medida que sube el código de su capa
  const grieta = (x, y, pasos, bajada, umbral) => {
    const p = [[x, y]]
    const ramas = []
    for (let k = 0; k < pasos; k++) {
      x += (r() - 0.5) * 9 * esc
      y += (4 + r() * bajada) * esc
      p.push([x, y])
      if (r() < 0.25) {
        const q = [[x, y]]
        let bx = x
        let by = y
        const dir = r() < 0.5 ? -1 : 1
        for (let j = 0; j < 3; j++) {
          bx += dir * (3 + r() * 5) * esc
          by += (2 + r() * 4) * esc
          q.push([bx, by])
        }
        ramas.push({ q, en: k / pasos })
      }
    }
    return { p, ramas, umbral }
  }
  const grietasDC = []
  for (let k = 0; k < 18; k++) {
    const x = s.x + (0.03 + ((k * 0.618 + r() * 0.2) % 0.94)) * s.w
    grietasDC.push(grieta(x, b2(x) + 2 + r() * L3 * 0.35, 5 + Math.floor(r() * 5), 7, 420 + (k / 17) * 292))
  }
  grietasDC.sort((a, b) => a.umbral - b.umbral)
  const grietasDMC = []
  for (let k = 0; k < 8; k++) {
    const x = s.x + (0.08 + ((k * 0.382 + r() * 0.15) % 0.86)) * s.w
    grietasDMC.push(grieta(x, b1(x) + 2 + r() * L2 * 0.3, 3 + Math.floor(r() * 3), 4, 34 + (k / 7) * 66))
  }

  // pasto, árboles, lluvia, viento, vapor
  const pasto = Array.from({ length: Math.round(s.w / 5.5) }, () => {
    const x = s.x + r() * s.w
    return { x, y: b0(x) + 1.5, h: (7 + r() * 15) * esc, f: r() * 6.28, luz: 0.75 + r() * 0.45, ladeo: (r() - 0.5) * 0.25 }
  })
  const arboles = Array.from({ length: 7 }, (_, k) => {
    const x = s.x + (0.6 + (k / 6) * 0.37 + (r() - 0.5) * 0.04) * s.w
    const alto = cieloH * (0.34 + r() * 0.26)
    return { x, y: b0(x) + 2, alto, ancho: alto * (0.42 + r() * 0.2), f: r() * 6.28 }
  })
  const gotas = Array.from({ length: 70 }, () => ({ x: r(), u: r(), v: 0.8 + r() * 0.5, l: 6 + r() * 8 }))
  const rachas = Array.from({ length: 28 }, () => ({ y: 0.1 + r() * 0.8, u: r(), v: 0.7 + r() * 0.6, l: 0.6 + r() * 0.8 }))
  const vapores = Array.from({ length: 12 }, () => ({ x: r(), u: r(), f: r() * 6.28 }))

  // flujos hacia ISI, BUI y FWI (solo con las columnas al costado)
  const der = s.x + s.w
  const bez = (a, b) => {
    const dx = (b[0] - a[0]) * 0.5
    const c1 = [a[0] + dx, a[1]]
    const c2 = [b[0] - dx, b[1]]
    const en = (u) => {
      const m = 1 - u
      return [m * m * m * a[0] + 3 * m * m * u * c1[0] + 3 * m * u * u * c2[0] + u * u * u * b[0], m * m * m * a[1] + 3 * m * m * u * c1[1] + 3 * m * u * u * c2[1] + u * u * u * b[1]]
    }
    let largo = 0
    let ant = a
    for (let k = 1; k <= 20; k++) {
      const q = en(k / 20)
      largo += Math.hypot(q[0] - ant[0], q[1] - ant[1])
      ant = q
    }
    const p = new Path2D()
    p.moveTo(...a)
    p.bezierCurveTo(...c1, ...c2, ...b)
    return { en, largo, p }
  }
  const cy = (b) => b.y + b.h / 2
  const flujos = g.apilado
    ? []
    : [
        { de: 'viento', ...bez([der, s.y + cieloH * 0.62], [g.isi.x, cy(g.isi) - 10]) },
        { de: 'ffmc', ...bez([der, (ySup + y1) / 2], [g.isi.x, cy(g.isi) + 10]) },
        { de: 'dmc', ...bez([der, (y1 + y2) / 2], [g.bui.x, cy(g.bui) - 10]) },
        { de: 'dc', ...bez([der, (y2 + yFin) / 2], [g.bui.x, cy(g.bui) + 10]) },
        { de: 'isi', ...bez([g.isi.x + g.isi.w, cy(g.isi)], [g.num.x - 10, cy(g.num) - 8]) },
        { de: 'bui', ...bez([g.bui.x + g.bui.w, cy(g.bui)], [g.num.x - 10, cy(g.num) + 8]) },
      ]

  const profundidad = (mm) => (mm <= 0.5 ? 3 * esc : mm <= 1.5 ? L1 : mm <= 2.8 ? L1 + L2 * 0.45 : L1 + L2 + L3 * 0.4)

  function dibujar(ctx, e, reloj) {
    const { v } = e
    const vientoK = clamp01(v.viento / 63)
    const sF = SECO.ffmc(v.ffmc)
    const colores = [rampa(sF), rampa(SECO.dmc(v.dmc)), rampa(SECO.dc(v.dc))]
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    // cielo: más tibio en los días calurosos y secos, gris cuando llueve
    const cg = ctx.createLinearGradient(0, s.y, 0, ySup)
    cg.addColorStop(0, '#060c18')
    cg.addColorStop(1, '#0d1729')
    ctx.fillStyle = cg
    ctx.fill(cieloP)
    ctx.save()
    ctx.clip(cieloP)
    const calor = clamp01((v.temp - 8) / 12) * (1 - v.hr / 100)
    if (calor > 0.01) {
      const rg = ctx.createRadialGradient(s.x + s.w * 0.72, ySup, 0, s.x + s.w * 0.72, ySup, s.w * 0.6)
      rg.addColorStop(0, `rgba(245,158,11,${0.22 * calor})`)
      rg.addColorStop(1, 'rgba(245,158,11,0)')
      ctx.fillStyle = rg
      ctx.fillRect(s.x, s.y, s.w, cieloH)
    }
    if (e.lluviaK > 0) {
      const ng = ctx.createLinearGradient(0, s.y, 0, s.y + cieloH * 0.7)
      ng.addColorStop(0, `rgba(71,85,105,${0.55 * e.lluviaK})`)
      ng.addColorStop(1, 'rgba(71,85,105,0)')
      ctx.fillStyle = ng
      ctx.fillRect(s.x, s.y, s.w, cieloH)
    }
    // árboles del monte, al fondo
    for (const a of arboles) {
      const mov = Math.sin(reloj * 1.2 + a.f) * (0.4 + 2.4 * vientoK) * esc + vientoK * 2 * esc
      ctx.fillStyle = '#0f1a2d'
      ctx.fillRect(a.x - 1.2 * esc, a.y - a.alto * 0.55, 2.4 * esc, a.alto * 0.55)
      for (let k = 0; k < 3; k++) {
        const yk = a.y - a.alto * (0.45 + k * 0.2)
        const wk = a.ancho * (1 - k * 0.22)
        ctx.beginPath()
        ctx.ellipse(a.x + mov * (0.6 + k * 0.4), yk, wk / 2, a.alto * 0.13, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    // viento: rachas que cruzan el cielo
    const nr = Math.round(3 + 25 * vientoK)
    ctx.lineCap = 'round'
    ctx.lineWidth = 1
    for (let k = 0; k < nr; k++) {
      const q = rachas[k]
      const u = (q.u + reloj * (0.1 + 0.5 * vientoK) * q.v) % 1
      const x = s.x - 80 + u * (s.w + 160)
      const y = s.y + cieloH * q.y
      const l = (16 + 46 * vientoK) * q.l * esc
      const gr = ctx.createLinearGradient(x, 0, x + l, 0)
      gr.addColorStop(0, 'rgba(203,213,225,0)')
      gr.addColorStop(1, `rgba(203,213,225,${0.12 + 0.3 * vientoK})`)
      ctx.strokeStyle = gr
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + l, y)
      ctx.stroke()
    }
    // lluvia
    if (e.lluviaK > 0) {
      const ng = Math.round((14 + 50 * Math.sqrt(Math.min(e.mm, 2) / 2)) * Math.min(1, s.w / 600))
      ctx.strokeStyle = `rgba(147,197,253,${0.6 * e.lluviaK})`
      ctx.lineWidth = 1.1
      for (let k = 0; k < ng; k++) {
        const q = gotas[k]
        const u = (q.u + reloj * 1.3 * q.v) % 1
        const y = s.y - 10 + u * (cieloH + 14)
        const x = s.x + q.x * s.w * 1.1 + vientoK * 0.3 * (y - s.y)
        const l = q.l * esc
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x - vientoK * 0.3 * l, y - l)
        ctx.stroke()
      }
    }
    ctx.restore()

    // las tres capas
    for (let k = 0; k < 3; k++) {
      ctx.fillStyle = rgba(mezcla(FONDO, colores[k], 0.6))
      ctx.fill(capaP[k])
    }
    ctx.save()
    ctx.clip(sueloP)
    ctx.drawImage(tex, 0, 0, W, H)
    // brillo de humedad sobre la hojarasca mojada
    const brillo = 1 - sF
    if (brillo > 0.35) {
      ctx.fillStyle = `rgba(147,197,253,${0.1 * (brillo - 0.35)})`
      ctx.fill(capaP[0])
    }
    // grietas
    const trazar = (gk, val, rango) => {
      const k = clamp01((val - gk.umbral) / rango)
      if (k <= 0) return
      const n = gk.p.length - 1
      const hasta = k * n
      ctx.beginPath()
      ctx.moveTo(...gk.p[0])
      for (let j = 1; j <= Math.ceil(hasta); j++) {
        const [ax, ay] = gk.p[j - 1]
        const [bx, by] = gk.p[j]
        const m = Math.min(1, hasta - (j - 1))
        ctx.lineTo(ax + (bx - ax) * m, ay + (by - ay) * m)
      }
      for (const rm of gk.ramas) {
        if (rm.en * n > hasta - 0.5) continue
        ctx.moveTo(...rm.q[0])
        rm.q.slice(1).forEach((q) => ctx.lineTo(...q))
      }
      ctx.stroke()
    }
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'rgba(8,4,2,0.8)'
    ctx.lineWidth = 1.7 * esc
    grietasDC.forEach((gk) => trazar(gk, v.dc, 30))
    ctx.lineWidth = 1.2 * esc
    grietasDMC.forEach((gk) => trazar(gk, v.dmc, 6))
    // bordes entre capas
    ctx.lineWidth = 1.4
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'
    bordes.slice(1).forEach((b) => ctx.stroke(b))
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.save()
    ctx.translate(0, 1.4)
    bordes.slice(1).forEach((b) => ctx.stroke(b))
    ctx.restore()

    // hasta dónde llega la lluvia: la hojarasca siempre, la capa orgánica con más de 1,5 mm, la
    // profunda recién con más de 2,8 mm (los umbrales del sistema FWI, Van Wagner 1987)
    const fr = e.frente
    if (fr && fr.alfa > 0.01) {
      const prof = profundidad(fr.mm) * fr.k
      const wg = ctx.createLinearGradient(0, ySup, 0, ySup + prof + 4)
      wg.addColorStop(0, `rgba(96,165,250,${0.5 * fr.alfa})`)
      wg.addColorStop(1, `rgba(96,165,250,${0.14 * fr.alfa})`)
      ctx.fillStyle = wg
      ctx.fill(banda(b0, (x) => b0(x) + prof))
      if (prof > 6) {
        ctx.setLineDash([5, 4])
        ctx.strokeStyle = `rgba(147,197,253,${0.9 * fr.alfa})`
        ctx.lineWidth = 1.3
        ctx.stroke(linea((x) => b0(x) + prof))
        ctx.setLineDash([])
      }
    }
    ctx.restore()

    // pasto: verde si la hojarasca está húmeda, pajizo si está seca; se dobla con el viento
    const cp = mezcla(PASTO_VERDE, PASTO_SECO, sF)
    ctx.lineWidth = 1.15 * esc
    for (const p of pasto) {
      const ang = p.ladeo + vientoK * 0.6 + Math.sin(reloj * (1.6 + vientoK * 2) + p.f) * (0.04 + 0.12 * vientoK)
      const tx2 = p.x + Math.sin(ang) * p.h
      const ty2 = p.y - Math.cos(ang) * p.h
      ctx.strokeStyle = rgba(cp.map((c) => c * p.luz), 0.85)
      ctx.beginPath()
      ctx.moveTo(p.x, p.y)
      ctx.quadraticCurveTo(p.x + Math.sin(ang) * p.h * 0.2, p.y - p.h * 0.6, tx2, ty2)
      ctx.stroke()
    }
    // borde del corte, a la derecha
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    ctx.fillRect(der - 1, ySup, 1, yFin - ySup)

    // vapor: la superficie que se seca después de mojarse
    if (e.secado > 0.02) {
      ctx.lineWidth = 1.2
      for (const q of vapores) {
        const u = (q.u + reloj * 0.35) % 1
        const x0 = s.x + q.x * s.w
        const y = ySup - u * cieloH * 0.55
        ctx.strokeStyle = `rgba(226,232,240,${0.22 * e.secado * Math.sin(Math.PI * u)})`
        ctx.beginPath()
        ctx.moveTo(x0 + Math.sin(q.f + u * 6) * 4, y)
        ctx.quadraticCurveTo(x0 + Math.sin(q.f + u * 6 + 1) * 6, y - 8, x0 + Math.sin(q.f + u * 6 + 2) * 4, y - 16)
        ctx.stroke()
      }
    }

    // flujos: cuánto aporta cada capa a ISI y BUI, y los dos al FWI
    if (flujos.length) {
      const fuerza = {
        viento: vientoK,
        ffmc: sF,
        dmc: SECO.dmc(v.dmc),
        dc: SECO.dc(v.dc),
        isi: clamp01(v.isi / 100),
        bui: clamp01(v.bui / 160),
      }
      const claro = (c) => mezcla(c, [255, 255, 255], 0.25)
      const colorDe = {
        viento: [203, 213, 225],
        ffmc: claro(colores[0]),
        dmc: claro(colores[1]),
        dc: claro(colores[2]),
        isi: e.colorFwi,
        bui: e.colorFwi,
      }
      for (const fl of flujos) {
        const f = fuerza[fl.de]
        ctx.strokeStyle = 'rgba(148,163,184,0.13)'
        ctx.lineWidth = 1
        ctx.stroke(fl.p)
        const P = 34
        const vel = ((60 + 110 * f) / fl.largo) * (REDUCIDO ? 0 : 1)
        ctx.fillStyle = rgba(colorDe[fl.de])
        for (let k = 0; k < P; k++) {
          if (k / P > 0.1 + 0.9 * f) continue
          const u = (((k * 0.618034) % 1) + reloj * vel) % 1
          const [x, y] = fl.en(u)
          ctx.globalAlpha = 0.9 * Math.sin(Math.PI * u)
          ctx.beginPath()
          ctx.arc(x, y, 1.2 + 1.1 * f, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
    }
  }
  return { dibujar }
}

/** El estado visual en el instante t: valores interpolados entre ayer y hoy, lluvia y secado. */
function estado(t, vuelta) {
  const i = diaEn(t)
  const f = clamp01((t - T0[i]) / DUR[i])
  const a = D[i]
  const p = i ? D[i - 1] : vuelta ? D[N - 1] : D[0]
  const k = suave(clamp01(f / 0.45))
  const v = {}
  for (const c of ['ffmc', 'dmc', 'dc', 'isi', 'bui', 'fwi', 'viento', 'hr', 'temp']) v[c] = p[c] + (a[c] - p[c]) * k
  let frente = null
  if (a.lluvia > 0) frente = { mm: a.lluvia, k: suave(clamp01((f - 0.08) / 0.55)), alfa: 1 }
  else if (i && D[i - 1].lluvia > 0) frente = { mm: D[i - 1].lluvia, k: 1, alfa: 1 - suave(clamp01(f / 0.6)) }
  const lluviaK = a.lluvia > 0 ? Math.min(clamp01(f / 0.1), clamp01((1 - f) / 0.12)) : 0
  const colorFwi = hexARgb(ESCALA[a.clase].color)
  return { i, v, frente, lluviaK, mm: a.lluvia, secado: clamp01((a.ffmc - p.ffmc) / 10), colorFwi }
}
function hexARgb(h) {
  return [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16))
}

export default function Memoria() {
  const raiz = useRef(null)
  const escenario = useRef(null)
  const lienzo = useRef(null)
  const sueloRef = useRef(null)
  const isiRef = useRef(null)
  const buiRef = useRef(null)
  const fwiRef = useRef(null)
  const numRef = useRef(null)
  const barrasRef = useRef(null)
  const tRef = useRef(REDUCIDO ? TOTAL - 0.01 : 0)
  const pausaRef = useRef(null) // por qué está quieto: 'escenario' | 'linea' | 'teclado'
  const tramoRef = useRef(null) // [desde, hasta] mientras el mouse está sobre un momento
  const vueltaRef = useRef(false)
  const pedirRef = useRef(() => {})
  const [dia, setDia] = useState(REDUCIDO ? N - 1 : 0)
  const [aviso, setAviso] = useState(null) // null | 'pausa' | índice del momento que se repite

  useEffect(() => {
    const cv = lienzo.current
    const esc = escenario.current
    const ctx = cv.getContext('2d')
    let escena = null
    let raf = 0
    let antes = performance.now()
    let reloj = 0
    let visible = false
    let ultimo = -1

    const medir = () => {
      const r = esc.getBoundingClientRect()
      if (!r.width) return
      const rel = (el) => {
        const b = el.getBoundingClientRect()
        return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height }
      }
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = Math.round(r.width * dpr)
      cv.height = Math.round(r.height * dpr)
      const s = rel(sueloRef.current)
      const fwi = rel(fwiRef.current)
      escena = armar({ W: r.width, H: r.height, dpr, s, isi: rel(isiRef.current), bui: rel(buiRef.current), num: rel(numRef.current), apilado: fwi.y >= s.y + s.h - 1 })
    }

    const cuadro = (ahora) => {
      const dt = Math.min(0.1, (ahora - antes) / 1000)
      antes = ahora
      if (!REDUCIDO) reloj += dt
      let t = tRef.current
      if (!REDUCIDO && !pausaRef.current) {
        t += dt
        const tramo = tramoRef.current
        if (tramo && (t >= tramo[1] || t < tramo[0] - 0.05)) t = tramo[0]
        if (t >= TOTAL) {
          t = 0
          vueltaRef.current = true
        }
        tRef.current = t
      }
      const e = estado(t, vueltaRef.current)
      if (e.i !== ultimo) {
        ultimo = e.i
        setDia(e.i)
      }
      if (escena) escena.dibujar(ctx, e, reloj)
      if (!REDUCIDO && visible) raf = requestAnimationFrame(cuadro)
    }
    const arrancar = () => {
      cancelAnimationFrame(raf)
      antes = performance.now()
      raf = requestAnimationFrame(cuadro)
    }
    pedirRef.current = () => {
      if (REDUCIDO || !visible) arrancar()
    }

    medir()
    arrancar()
    const ro = new ResizeObserver(() => {
      medir()
      if (REDUCIDO || !visible) arrancar()
    })
    ro.observe(esc)
    // corre mientras se ve; al salir del todo vuelve al 15/10 para que la próxima vez empiece de cero
    const io = new IntersectionObserver(
      ([en]) => {
        const antesVisible = visible
        visible = en.intersectionRatio >= 0.25
        if (visible && !antesVisible) arrancar()
        if (!en.isIntersecting && !REDUCIDO) {
          tRef.current = 0
          vueltaRef.current = false
        }
      },
      { threshold: [0, 0.25] },
    )
    io.observe(esc)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  // ---------- control para presentar ----------
  const irA = (t) => {
    tRef.current = t
    pedirRef.current()
  }
  const pausar = () => {
    if (REDUCIDO || tramoRef.current) return
    pausaRef.current = 'escenario'
    setAviso('pausa')
  }
  const seguir = () => {
    pausaRef.current = null
    setAviso(null)
  }
  const entrarMomento = (k) => {
    const m = MOMENTOS[k]
    pausaRef.current = null
    if (REDUCIDO) {
      irA(T0[m.foco[1]] + DUR[m.foco[1]] - 0.01)
      return
    }
    tramoRef.current = tramoDe(m)
    irA(tramoRef.current[0])
    setAviso(k)
  }
  const salirMomento = () => {
    tramoRef.current = null
    seguir()
  }
  const diaDelPuntero = (e) => {
    const b = barrasRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(N - 1, Math.floor(((e.clientX - b.left) / b.width) * N)))
  }
  const verDia = (j, por = 'linea') => {
    tramoRef.current = null
    pausaRef.current = por
    setAviso('pausa')
    irA(T0[j] + DUR[j] * 0.75)
  }
  const teclaLinea = (e) => {
    const paso = { ArrowLeft: -1, ArrowRight: 1, ArrowDown: -1, ArrowUp: 1 }[e.key]
    if (paso) {
      e.preventDefault()
      verDia(Math.max(0, Math.min(N - 1, dia + paso)), 'teclado')
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      verDia(e.key === 'Home' ? 0 : N - 1, 'teclado')
    } else if (e.key === 'Escape') seguir()
  }

  const d = D[dia]
  const mom = momentoDe(dia)
  const activo = typeof aviso === 'number' ? aviso : mom
  const resalta = new Set(mom >= 0 ? MOMENTOS[mom].resalta : [])
  const notas = mom >= 0 ? MOMENTOS[mom].notas : {}
  const clase = ESCALA[d.clase]
  const capas = [
    { k: 'ffmc', sigla: 'FFMC', nombre: 'Hojarasca y pasto fino', ritmo: 'Se moja y se seca en horas', top: CIELO + C1 / 2 },
    { k: 'dmc', sigla: 'DMC', nombre: 'Capa orgánica suelta · 5 a 10 cm', ritmo: 'Tarda semanas', top: CIELO + C1 + C2 * 0.3 },
    { k: 'dc', sigla: 'DC', nombre: 'Suelo profundo compacto · 10 a 20 cm', ritmo: 'Tarda meses: la sequía se acumula', top: CIELO + C1 + C2 + (1 - CIELO - C1 - C2) * 0.3 },
  ]
  const lluvia23 = d.fecha === '10-23'

  return (
    <div ref={raiz} className="mm">
      <header className="mm-cabeza" onMouseEnter={pausar} onMouseLeave={seguir}>
        <div className="mm-cejilla">Índice de peligro FWI · cómo se calcula</div>
        <h3 className="mm-titulo">
          La memoria <span>del monte</span>
        </h3>
        <p className="mm-bajada">
          El FWI junta temperatura, humedad, viento y lluvia en un solo número de peligro. Pero no mira solo el día: lleva la
          cuenta de cómo se viene secando el monte, capa por capa. La hojarasca responde en horas; el suelo profundo, en meses.
        </p>
      </header>

      <div ref={escenario} className="mm-escenario" onMouseEnter={pausar} onMouseLeave={seguir}>
        <canvas ref={lienzo} className="mm-lienzo" aria-hidden="true" />

        <div ref={sueloRef} className="mm-suelo">
          <div className="mm-clima">
            <div className="mm-fecha" aria-live="off">
              {fechaLarga(d.fecha)}
            </div>
            <div className="mm-lugar">Río Grande · zona Norte · datos reales</div>
            <ul className="mm-chips" aria-label="Clima del día">
              <li>
                <Thermometer aria-hidden="true" />
                {n1(d.temp)} °C
              </li>
              <li>
                <Droplets aria-hidden="true" />
                {d.hr} %
              </li>
              <li data-on={resalta.has('viento') || undefined}>
                <Wind aria-hidden="true" />
                {d.viento} km/h
              </li>
              <li data-on={resalta.has('lluvia') || undefined} data-lluvia={d.lluvia > 0 || undefined}>
                <CloudRain aria-hidden="true" />
                {d.lluvia > 0 ? `${n1(d.lluvia)} mm` : 'sin lluvia'}
              </li>
            </ul>
          </div>

          {capas.map((c) => (
            <div key={c.k} className="mm-capa" style={{ top: `${c.top * 100}%` }}>
              <div className="mm-capa-nombre">
                <b>{c.nombre}</b>
                <span>{c.ritmo}</span>
              </div>
              <div className="mm-capa-valor" data-on={notas[c.k] ? '' : undefined}>
                <b>
                  {c.sigla} <span>{n1(d[c.k])}</span>
                </b>
                {notas[c.k] && <i>{notas[c.k]}</i>}
              </div>
            </div>
          ))}

          {lluvia23 && (
            <div className="mm-frente" style={{ top: `${(CIELO + C1 + C2 * 0.45) * 100}%` }}>
              Los {n1(d.lluvia)} mm llegan hasta acá · al DC le hace falta más de 2,8 mm
            </div>
          )}

          <div className="mm-leyenda" aria-hidden="true">
            húmedo <i /> seco
          </div>
        </div>

        {/* el cierre: engancha con la sección de brigadistas, que es en esa zona */}
        {dia === N - 1 && (
          <div className="mm-incendio">
            <Flame aria-hidden="true" />
            <span>
              Ese día, en la zona Centro, ya estaba activo el incendio Corazón de la Isla
              <small>detección satelital GOES-16, cerca de las 18 UTC</small>
            </span>
          </div>
        )}

        <div className="mm-indices">
          <div ref={isiRef} className="mm-caja" data-on={resalta.has('isi') || undefined}>
            <div className="mm-caja-tope">
              <b>ISI</b>
              <span>{n1(d.isi)}</span>
            </div>
            <div className="mm-caja-que">Qué tan rápido correría el fuego</div>
            <div className="mm-medidor">
              <i style={{ width: `${Math.min(100, d.isi)}%` }} />
            </div>
            <div className="mm-caja-de">sale de la hojarasca y el viento</div>
          </div>
          <div ref={buiRef} className="mm-caja" data-on={resalta.has('bui') || undefined}>
            <div className="mm-caja-tope">
              <b>BUI</b>
              <span>{n1(d.bui)}</span>
            </div>
            <div className="mm-caja-que">Cuánto combustible hay para quemar</div>
            <div className="mm-medidor">
              <i style={{ width: `${Math.min(100, (d.bui / 160) * 100)}%` }} />
            </div>
            <div className="mm-caja-de">sale de las dos capas de abajo</div>
          </div>
        </div>

        <div ref={fwiRef} className="mm-fwi" data-on={resalta.has('fwi') || undefined} style={{ '--mm-clase': clase.color }}>
          <div className="mm-fwi-rotulo">FWI · índice de peligro</div>
          <div ref={numRef} className="mm-fwi-num">
            {n1(d.fwi)}
          </div>
          <div className="mm-fwi-clase">{clase.nombre}</div>
          <ol className="mm-escala" aria-label={`Escala oficial de la zona Norte: FWI ${n1(d.fwi)}, ${clase.nombre}`}>
            {ESCALA.map((c, k) => ({ c, k }))
              .reverse()
              .map(({ c, k }) => (
                <li key={c.nombre} data-actual={k === d.clase || undefined} style={{ '--mm-c': c.color }}>
                  <i />
                  <span>{c.nombre}</span>
                  <small>{c.rango}</small>
                </li>
              ))}
          </ol>
          <div className="mm-fwi-nota">Sale de combinar ISI y BUI. Escala oficial de la Provincia, zona Norte.</div>
        </div>

        <div className="mm-pausa" data-visible={aviso !== null ? '' : undefined}>
          {typeof aviso === 'number' ? (
            <>
              <RotateCcw aria-hidden="true" />
              Repite · {MOMENTOS[aviso].titulo}
            </>
          ) : (
            <>
              <i />
              En pausa
            </>
          )}
        </div>
      </div>

      {/* la temporada entera: FWI por día con su clase, la lluvia y el DC que no para de subir */}
      <div
        className="mm-linea"
        role="slider"
        tabIndex={0}
        aria-label="Día de la temporada (flechas para recorrer)"
        aria-valuemin={1}
        aria-valuemax={N}
        aria-valuenow={dia + 1}
        aria-valuetext={`${fechaLarga(d.fecha)}: FWI ${n1(d.fwi)}, ${clase.nombre}`}
        onPointerMove={(e) => verDia(diaDelPuntero(e))}
        onPointerDown={(e) => verDia(diaDelPuntero(e))}
        onPointerLeave={seguir}
        onKeyDown={teclaLinea}
        onBlur={() => pausaRef.current === 'teclado' && seguir()}
      >
        <div className="mm-linea-rotulos">
          <span>FWI de cada día · pasá el mouse para recorrer la temporada</span>
          <span className="mm-linea-dc-rotulo">DC, capa profunda</span>
        </div>
        <div ref={barrasRef} className="mm-barras">
          {D.map((x, k) => (
            <span key={x.fecha} data-actual={k === dia || undefined} data-pasado={k < dia || undefined}>
              {x.lluvia > 0 && <u style={{ '--mm-mm': Math.sqrt(x.lluvia / 2) }} />}
              <i style={{ height: `${6 + (x.fwi / 130) * 94}%`, background: ESCALA[x.clase].color }} />
            </span>
          ))}
          <svg className="mm-dc" viewBox={`0 0 ${N} 100`} preserveAspectRatio="none" aria-hidden="true">
            <polyline points={D.map((x, k) => `${k + 0.5},${100 - ((x.dc - 450) / 300) * 100}`).join(' ')} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
        <div className="mm-fechas" aria-hidden="true">
          {['10-15', '11-01', '11-15', '12-01', '12-06'].map((f) => (
            <span key={f} data-apretada={f === '12-01' || undefined} style={{ left: `${((iDe(f) + 0.5) / N) * 100}%` }}>
              {fechaCorta(f)}
            </span>
          ))}
        </div>
      </div>

      <ol className="mm-momentos">
        {MOMENTOS.map((m, k) => (
          <li
            key={m.titulo}
            tabIndex={0}
            data-activo={activo === k || undefined}
            onMouseEnter={() => entrarMomento(k)}
            onMouseLeave={salirMomento}
            onFocus={() => entrarMomento(k)}
            onBlur={salirMomento}
            onClick={() => {
              entrarMomento(k)
              // en el celular la escena queda arriba, fuera de pantalla: la traigo
              const r = escenario.current.getBoundingClientRect()
              if (r.bottom < 80 || r.top > innerHeight * 0.6) escenario.current.scrollIntoView({ behavior: REDUCIDO ? 'auto' : 'smooth', block: 'start' })
            }}
          >
            <span className="mm-momento-fecha">{m.fecha}</span>
            <b>{m.titulo}</b>
            <p>{m.texto}</p>
          </li>
        ))}
      </ol>

      <footer className="mm-pie">
        <p>
          El FWI es el estándar del Servicio Forestal de Canadá (1970; Van Wagner, 1987). Lo usan la Unión Europea (EFFIS),
          Argentina y más de 30 países.
        </p>
        <p className="mm-fuente">
          Datos: Planilla FWI de Río Grande (zona norte), 2022 — Gobierno de Tierra del Fuego, Manejo del Fuego. Índices del
          sistema canadiense FWI. Temperatura, humedad, viento y lluvia son observaciones; los códigos e índices los calcula la
          planilla. El incendio Corazón de la Isla fue en la zona Centro: este FWI es el de Río Grande, no el de esa zona.
        </p>
      </footer>
    </div>
  )
}

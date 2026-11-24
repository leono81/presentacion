import { useEffect, useState } from 'react'
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*>; el config no tiene jsx-uses-vars
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Zap } from 'lucide-react'
import isla from './isla.json'

/*
 * Rayos: de dónde salen, cómo se procesan y cómo se muestran. A la izquierda los tres pasos; a la
 * derecha la isla de noche, con una demostración que corre sola al entrar y se repite: caen rayos,
 * se recorta lo que cae fuera de la provincia, se descarta una ráfaga falsa por intrusión solar y
 * lo que queda se ve como en Penon. Datos de services/api/app/glm_client.py, intrusion_solar.py y
 * apps/web/src/components/LightningLayer.tsx (penonInsight). Los rayos del dibujo son ilustrativos.
 */

const LOOP = 16 // s por vuelta
const REDUCIDO = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const FASES = [0, 4.5, 9.5] // inicio de cada paso

const pasos = [
  {
    titulo: 'De dónde salen',
    texto:
      'El GLM, el detector de rayos del satélite GOES-19, ve América entera desde 35.786 km. NOAA publica sus mediciones en un repositorio público y Penon las busca cada 10 minutos.',
  },
  {
    titulo: 'Cómo se procesan',
    texto:
      'De cada archivo se lee solo lo necesario y se queda lo que cae en la provincia. En temporada de eclipses, de madrugada, el Sol entra en el sensor y genera ráfagas de rayos falsos. Penon calcula esas ventanas con las tablas oficiales de NOAA y en esos minutos el mapa dice «sin dato», no «sin rayos».',
  },
  {
    titulo: 'Cómo se muestran',
    texto:
      'En cian, para no confundirlos con un foco. Quedan 24 horas en el mapa y se van atenuando sin apagarse, porque un fuego iniciado por un rayo puede arder latente de 24 a 72 horas. El borde lleva el peligro del día de su zona; si es Alto o más, sale el aviso.',
  },
]

// ---------- la isla en planta ----------
const { proy, capas, zonasD } = isla
const enPlanta = (lon, lat) => [(lon - proy.LON0) * proy.KX, (proy.LAT0 - lat) * proy.KY]
const pts = [...(capas.tierra + capas.chileIsla).matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => [+m[1], +m[2]])
const VB = (() => {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const x = Math.min(...xs) - 30
  const y = Math.min(...ys) - 30
  return { x, y, w: Math.max(...xs) - x + 30, h: Math.max(...ys) - y + 30 }
})()

// los rayos del dibujo. real: cae en la provincia y queda; fuera: cae en el mar o en Chile y se
// recorta; falso: la ráfaga por intrusión solar. at: segundo de la vuelta en que cae.
const REALES = [
  { lon: -67.95, lat: -53.98, at: 0.6, edad: 'hace 5 min', horas: 0.1 },
  { lon: -67.35, lat: -54.42, at: 1.5, edad: 'hace 6 h', horas: 6 },
  { lon: -66.85, lat: -54.68, at: 2.3, edad: 'hace 20 h', horas: 20 },
  { lon: -68.25, lat: -54.6, at: 3.1, edad: 'hace 2 h', horas: 2 },
]
const FUERA = [
  { lon: -66.2, lat: -53.25, at: 1.0 },
  { lon: -69.45, lat: -53.85, at: 1.9 },
  { lon: -65.55, lat: -54.15, at: 2.7 },
  { lon: -67.4, lat: -55.15, at: 3.4 },
]
// la ráfaga: un racimo apretado, todo en el mismo minuto
const RAFAGA_C = [-67.75, -53.45]
const FALSOS = Array.from({ length: 11 }, (_, i) => {
  const a = i * 2.39996
  const r = 0.035 + 0.022 * Math.sqrt(i)
  return { lon: RAFAGA_C[0] + Math.cos(a) * r * 1.6, lat: RAFAGA_C[1] + Math.sin(a) * r, at: 3.6 + i * 0.05 }
})
const [rcx, rcy] = enPlanta(...RAFAGA_C)

const CIAN = '#22d3ee'
const CIAN_VIEJO = '#0e7490'
const PELIGRO = '#F97316' // Muy alto

const bolt = (x, y) => `M${x + 1.5} ${y - 22}l-5 12h4.5l-3.5 10l9-13h-5l4-9z`

/** Un rayo: el destello al caer y el punto que queda. */
function Rayo({ t, r, tipo }) {
  const [x, y] = enPlanta(r.lon, r.lat)
  const a = r.at
  const destello = useTransform(t, [a - 0.01, a, a + 0.12, a + 0.45], [0, 1, 1, 0])
  // el punto: aparece al caer; lo de fuera se va al recortar; lo falso, al descartar
  const fin = tipo === 'real' ? LOOP - 0.4 : tipo === 'fuera' ? FASES[1] + 0.9 : FASES[1] + 3.4
  const o = useTransform(t, [a, a + 0.1, fin - 0.5, fin], [0, 1, 1, tipo === 'real' ? 1 : 0])
  // ya en el paso 3, lo real toma el estilo del mapa: más chico y apagado según la antigüedad
  const enMapa = tipo === 'real' ? Math.max(0.35, 0.9 - r.horas / 30) : 1
  const relleno = useTransform(t, [FASES[2], FASES[2] + 0.6], [1, enMapa])
  const radio = useTransform(t, [FASES[2], FASES[2] + 0.6], [tipo === 'falso' ? 2.6 : 4.5, r.horas < 1 ? 5 : 4])
  const color = tipo === 'falso' ? '#f87171' : r.horas >= 1 ? CIAN_VIEJO : CIAN
  const halo = useTransform(destello, (v) => v * 0.25)
  return (
    <g>
      <motion.path d={bolt(x, y)} fill="#e0f7ff" style={{ opacity: destello }} />
      <motion.circle cx={x} cy={y} r={14} fill={CIAN} style={{ opacity: halo }} />
      <motion.g style={{ opacity: o }}>
        <motion.circle cx={x} cy={y} r={radio} fill={color} style={{ fillOpacity: relleno }} stroke={tipo === 'real' && r.borde ? PELIGRO : 'rgba(255,255,255,0.7)'} strokeWidth={tipo === 'real' && r.borde ? 2 : 0.6} />
      </motion.g>
    </g>
  )
}

/** Rótulo de antigüedad de un rayo real (paso 3). */
function Edad({ t, r, i }) {
  const [x, y] = enPlanta(r.lon, r.lat)
  const o = useTransform(t, [FASES[2] + 0.5 + i * 0.25, FASES[2] + 0.9 + i * 0.25, LOOP - 0.5, LOOP - 0.1], [0, 1, 1, 0])
  return (
    <motion.text x={x + 9} y={y + 3.5} style={{ opacity: o }} className="font-mono" fontSize="10" fill="#cbd5e1">
      {r.edad}
    </motion.text>
  )
}

export default function Rayos() {
  const [ref, inView] = useInView({ threshold: 0.35 })
  // con movimiento reducido queda quieto en el paso 3, armado
  const t = useMotionValue(REDUCIDO ? LOOP - 1 : 0)
  const [fase, setFase] = useState(REDUCIDO ? 2 : 0)

  // reloj propio: corre solo mientras está en pantalla
  useEffect(() => {
    if (REDUCIDO || !inView) return
    let raf = 0
    let antes = performance.now()
    const tick = (ahora) => {
      const v = (t.get() + (ahora - antes) / 1000) % LOOP
      antes = ahora
      t.set(v)
      const f = v >= FASES[2] ? 2 : v >= FASES[1] ? 1 : 0
      setFase((p) => (p === f ? p : f))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, t])

  // capas del paso 2: el recorte (la provincia resaltada) y la ráfaga falsa marcada
  const recorte = useTransform(t, [FASES[1], FASES[1] + 0.5, FASES[2] - 0.3, FASES[2]], [0, 1, 1, 0])
  const rafagaO = useTransform(t, [FASES[1] + 1.2, FASES[1] + 1.6, FASES[1] + 3.4, FASES[1] + 3.9], [0, 1, 1, 0])
  const tachado = useTransform(t, [FASES[1] + 2.2, FASES[1] + 2.7], [0, 1])
  // paso 3: la zona con peligro y el aviso
  const zonaO = useTransform(t, [FASES[2] + 1.6, FASES[2] + 2.2, LOOP - 0.5, LOOP], [0, 1, 1, 0])
  const avisoO = useTransform(t, [FASES[2] + 2.4, FASES[2] + 2.9, LOOP - 0.5, LOOP], [0, 1, 1, 0])
  const avisoY = useTransform(t, [FASES[2] + 2.4, FASES[2] + 2.9], [12, 0])
  // el reloj del satélite: una lectura cada 10 minutos
  const hora = useTransform(t, (v) => {
    const min = 4 * 60 + 2 + Math.floor((v / LOOP) * 60)
    const redondo = Math.floor(min / 10) * 10
    return `${String(Math.floor(redondo / 60)).padStart(2, '0')}:${String(redondo % 60).padStart(2, '0')} UTC`
  })

  const reales = REALES.map((r, i) => ({ ...r, borde: i === 0 }))

  return (
    <div ref={ref} className="mt-24 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-14 items-center">
      <div>
        <div className="font-mono text-[10px] text-slate-text/60 tracking-[0.25em] uppercase mb-4">Capa de rayos · GOES-19</div>
        <h3 className="font-display font-800 text-3xl lg:text-4xl tracking-tight text-white-text mb-4">
          Rayos, <span className="text-cyan-400">medidos desde el espacio</span>
        </h3>
        <p className="text-slate-text text-[15px] leading-relaxed mb-8 max-w-[52ch]">
          No es un pronóstico de tormentas: son las descargas que el satélite realmente registró, sobre la isla y con su hora.
        </p>
        <ol className="flex flex-col gap-3">
          {pasos.map((p, i) => (
            <li
              key={p.titulo}
              className={`relative pl-12 pr-4 py-4 rounded-xl border transition-colors duration-500 ${
                fase === i ? 'bg-cyan-400/[0.05] border-cyan-400/25' : 'bg-transparent border-white/[0.04]'
              }`}
            >
              <span
                className={`absolute left-4 top-4 font-mono text-xs tabular-nums transition-colors duration-500 ${fase === i ? 'text-cyan-300' : 'text-slate-text/40'}`}
              >
                0{i + 1}
              </span>
              <h4 className={`font-display font-700 text-base mb-1 transition-colors duration-500 ${fase === i ? 'text-white-text' : 'text-white-text/60'}`}>{p.titulo}</h4>
              <p className={`text-[13px] leading-relaxed transition-colors duration-500 ${fase === i ? 'text-slate-text' : 'text-slate-text/50'}`}>{p.texto}</p>
              {fase === i && (
                <motion.span
                  key={`barra-${i}`}
                  className="absolute left-0 bottom-0 h-px bg-cyan-400/60"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: (i < 2 ? FASES[i + 1] - FASES[i] : LOOP - FASES[2]) * 0.97, ease: 'linear' }}
                />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="relative rounded-2xl border border-white/[0.06] bg-[#050b18] overflow-hidden">
        {/* rótulos tipo instrumento */}
        <div className="absolute top-4 left-5 z-10 font-mono text-[10px] tracking-[0.2em] text-slate-text/70 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          GLM · GOES-19
        </div>
        <motion.div className="absolute top-4 right-5 z-10 font-mono text-[10px] tracking-[0.2em] text-slate-text/70 tabular-nums">{hora}</motion.div>

        <svg viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`} className="block w-full h-auto" role="img" aria-label="Tierra del Fuego de noche: caen rayos, se descartan los falsos y quedan los reales, como se ven en Penon">
          <defs>
            <pattern id="ry-grilla" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#1e293b" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="url(#ry-grilla)" opacity="0.5" />
          <path d={capas.chileIsla} fill="#0b1324" stroke="#334155" strokeWidth="0.6" />
          <path d={capas.tierra} fill="#111c30" stroke="#64748b" strokeWidth="0.9" />
          <path d={capas.lagos} fill="#050b18" stroke="#334155" strokeWidth="0.4" />

          {/* paso 2: el recorte a la provincia */}
          <motion.path d={capas.contorno} fill="#22d3ee" fillOpacity="0.05" stroke="#22d3ee" strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="4 3" style={{ opacity: recorte }} />

          {/* paso 3: la zona del rayo, con su peligro del día */}
          <motion.path d={zonasD.norte} fill={PELIGRO} fillOpacity="0.08" stroke={PELIGRO} strokeWidth="1.2" style={{ opacity: zonaO }} />

          {FUERA.map((r, i) => (
            <Rayo key={`f${i}`} t={t} r={{ ...r, horas: 0 }} tipo="fuera" />
          ))}
          {FALSOS.map((r, i) => (
            <Rayo key={`x${i}`} t={t} r={{ ...r, horas: 0 }} tipo="falso" />
          ))}
          {reales.map((r, i) => (
            <Rayo key={`r${i}`} t={t} r={r} tipo="real" />
          ))}
          {reales.map((r, i) => (
            <Edad key={`e${i}`} t={t} r={r} i={i} />
          ))}

          {/* paso 2: la ráfaga falsa, marcada y descartada */}
          <motion.g style={{ opacity: rafagaO }}>
            <rect x={rcx - 26} y={rcy - 16} width="52" height="32" rx="3" fill="none" stroke="#f87171" strokeWidth="1" strokeDasharray="3 2" />
            <motion.path d={`M${rcx - 26} ${rcy + 16}L${rcx + 26} ${rcy - 16}`} stroke="#f87171" strokeWidth="1.2" style={{ pathLength: tachado }} />
            <text x={rcx + 32} y={rcy - 4} className="font-mono" fontSize="10" fill="#fca5a5">
              04:10 UTC · intrusión solar
            </text>
            <motion.text x={rcx + 32} y={rcy + 9} className="font-mono" fontSize="10" fill="#f87171" style={{ opacity: tachado }}>
              descartados
            </motion.text>
          </motion.g>
        </svg>

        {/* paso 3: el aviso, en su franja abajo del mapa (no tapa nada) */}
        <div className="relative h-[64px] border-t border-white/[0.05] px-4 flex items-center">
          <span className="font-mono text-[9px] text-slate-text/40">Rayos ilustrativos</span>
          <motion.div
            style={{ opacity: avisoO, y: avisoY }}
            className="absolute inset-y-2 left-3 right-3 flex items-center gap-3 rounded-lg border border-orange-400/30 bg-[#140d08] px-4"
          >
            <Zap className="w-4 h-4 text-orange-400 shrink-0" />
            <div className="min-w-0">
              <div className="font-mono text-[10px] tracking-[0.18em] text-orange-300 uppercase truncate">Rayo en zona Norte · peligro Muy alto</div>
              <div className="text-[12px] text-slate-text truncate">Aviso en pantalla y por Telegram, uno por zona cada 3 horas.</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

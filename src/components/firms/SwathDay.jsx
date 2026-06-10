import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

/*
 * "Un día en 12 segundos": vista desde el polo sur, 14 medias órbitas
 * barren secuencialmente y dos contadores suman observaciones sobre el
 * ecuador y sobre Tierra del Fuego. La superposición a 54°S emerge sola
 * de la geometría (franja de ancho constante, órbitas que convergen).
 */

const CX = 170, CY = 170
const R_EQ = 150
const R_54 = 60 // colatitud 36° desde el polo sur
const DIAMS = 7 // 7 diámetros = 14 medias órbitas por día
const SWATH = 46 // 3.060 km a escala
const PASS_MS = 820
const PAUSE_MS = 3000

const TDF_ANGLE = -120 * (Math.PI / 180)
const EQ_ANGLE = -60 * (Math.PI / 180)

const TDF = { x: CX + R_54 * Math.cos(TDF_ANGLE), y: CY + R_54 * Math.sin(TDF_ANGLE) }
const EQ = { x: CX + R_EQ * Math.cos(EQ_ANGLE), y: CY + R_EQ * Math.sin(EQ_ANGLE) }

// ¿El diámetro k cubre el punto (r, α)? distancia perpendicular < SWATH/2
function covers(k, r, alphaRad) {
  const theta = (k * 180 / DIAMS) * (Math.PI / 180)
  return Math.abs(r * Math.sin(alphaRad - theta)) < SWATH / 2
}

const TDF_HITS = Array.from({ length: DIAMS }, (_, k) => covers(k, R_54, TDF_ANGLE))
const EQ_HITS = Array.from({ length: DIAMS }, (_, k) => covers(k, R_EQ, EQ_ANGLE))

function diamEndpoints(k) {
  const rad = (k * 180 / DIAMS) * (Math.PI / 180)
  return {
    x1: CX - R_EQ * Math.cos(rad), y1: CY - R_EQ * Math.sin(rad),
    x2: CX + R_EQ * Math.cos(rad), y2: CY + R_EQ * Math.sin(rad),
  }
}

export default function SwathDay() {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const [pass, setPass] = useState(-1) // -1 = sin empezar; 0..13 pasadas; 14 = pausa final

  // Si sale de vista, el loop se pausa donde está y retoma al volver
  useEffect(() => {
    if (!inView) return
    if (pass === -1) {
      const t = setTimeout(() => setPass(0), 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(
      () => setPass((p) => (p >= 14 ? 0 : p + 1)),
      pass >= 14 ? PAUSE_MS : PASS_MS
    )
    return () => clearTimeout(t)
  }, [pass, inView])

  const activeDiam = pass >= 0 && pass < 14 ? pass % DIAMS : -1
  const passedDiams = new Set()
  for (let p = 0; p < Math.min(pass + 1, 14); p++) passedDiams.add(p % DIAMS)

  // Conteo acumulado de observaciones
  let tdfCount = 0, eqCount = 0
  for (let p = 0; p <= Math.min(pass, 13); p++) {
    if (TDF_HITS[p % DIAMS]) tdfCount++
    if (EQ_HITS[p % DIAMS]) eqCount++
  }

  const tdfFlash = activeDiam >= 0 && TDF_HITS[activeDiam]
  const eqFlash = activeDiam >= 0 && EQ_HITS[activeDiam]

  // Hora del día simulada: 24 h / 14 pasadas
  const mins = pass >= 0 ? Math.min(pass + 1, 14) * (1440 / 14) : 0
  const hh = String(Math.floor(mins / 60) % 24).padStart(2, '0')
  const mm = String(Math.round(mins % 60)).padStart(2, '0')

  return (
    <div ref={ref} className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="font-mono text-[10px] text-slate-text/50 uppercase tracking-widest">Un día de pasadas · polo sur</span>
        <span className="font-mono text-[10px] text-white-text tabular-nums">{hh}:{mm} <span className="text-slate-text/40">/ 24 hs</span></span>
      </div>

      <svg viewBox="0 0 340 340" className="w-full h-auto">
        {/* Franjas ya pasadas */}
        {Array.from({ length: DIAMS }).map((_, k) => {
          if (!passedDiams.has(k) || k === activeDiam) return null
          const e = diamEndpoints(k)
          return <line key={`p${k}`} {...e} stroke="#38BDF8" strokeWidth={SWATH} opacity="0.07" />
        })}

        {/* Franja activa */}
        <AnimatePresence>
          {activeDiam >= 0 && (
            <motion.line
              key={`a${pass}`}
              {...diamEndpoints(activeDiam)}
              stroke="#38BDF8"
              strokeWidth={SWATH}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.32 }}
              exit={{ opacity: 0.07 }}
              transition={{ duration: 0.25 }}
            />
          )}
        </AnimatePresence>

        {/* Ecuador */}
        <circle cx={CX} cy={CY} r={R_EQ} fill="none" stroke="rgb(148 163 184)" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.35" />
        <text x={CX} y={CY - R_EQ + 14} textAnchor="middle" fontSize="7" fill="rgb(148 163 184)" opacity="0.6" fontFamily="monospace">ECUADOR</text>

        {/* Anillo 54°S */}
        <circle cx={CX} cy={CY} r={R_54} fill="none" stroke="rgb(16 185 129)" strokeWidth="1.2" opacity="0.7" />
        <circle cx={CX} cy={CY} r={R_54} fill="rgb(16 185 129)" opacity="0.05" />
        <text x={CX} y={CY + R_54 + 14} textAnchor="middle" fontSize="7" fontWeight="bold" fill="rgb(16 185 129)" opacity="0.9" fontFamily="monospace">54°S</text>

        {/* Polo sur */}
        <circle cx={CX} cy={CY} r="2" fill="white" opacity="0.5" />

        {/* Punto ecuatorial de referencia */}
        <motion.circle
          cx={EQ.x} cy={EQ.y} r="4"
          fill="rgb(148 163 184)"
          animate={eqFlash ? { r: [4, 7, 4], opacity: [1, 0.6, 1] } : { r: 4 }}
          transition={{ duration: 0.5 }}
        />
        <text x={EQ.x + 8} y={EQ.y + 3} fontSize="6.5" fill="rgb(148 163 184)" opacity="0.7" fontFamily="monospace">CIUDAD ECUATORIAL</text>

        {/* TdF */}
        <motion.circle
          cx={TDF.x} cy={TDF.y} r="5"
          fill="rgb(16 185 129)"
          animate={tdfFlash ? { r: [5, 9, 5], opacity: [1, 0.6, 1] } : { r: 5 }}
          transition={{ duration: 0.5 }}
        />
        <circle cx={TDF.x} cy={TDF.y} r="2" fill="white" opacity="0.6" />
        <text x={TDF.x - 8} y={TDF.y - 10} textAnchor="end" fontSize="7.5" fontWeight="bold" fill="rgb(16 185 129)" fontFamily="monospace">TIERRA DEL FUEGO</text>
      </svg>

      {/* Contadores en vivo */}
      <div className="mt-2 grid grid-cols-2 gap-2 text-center">
        <motion.div
          animate={eqFlash ? { scale: [1, 1.04, 1] } : {}}
          className="px-3 py-2.5 rounded-xl bg-surface-2/40 border border-white/5"
        >
          <div className="font-mono text-2xl font-bold text-slate-text tabular-nums">{eqCount}</div>
          <div className="font-mono text-[8px] text-slate-text/50 uppercase tracking-wider">obs. en el ecuador</div>
        </motion.div>
        <motion.div
          animate={tdfFlash ? { scale: [1, 1.04, 1] } : {}}
          className="px-3 py-2.5 rounded-xl bg-emerald-accent/8 border border-emerald-accent/25"
        >
          <div className="font-mono text-2xl font-bold text-emerald-accent tabular-nums">{tdfCount}</div>
          <div className="font-mono text-[8px] text-emerald-accent/60 uppercase tracking-wider">obs. sobre TdF</div>
        </motion.div>
      </div>

      <p className="font-mono text-[8px] text-slate-text/30 text-center mt-2 leading-relaxed">
        Modelo geométrico a escala de un sensor (14 medias órbitas, franja de 3.060 km).
        En latitudes muy altas la NASA reporta hasta 8 obs/día por sensor — y la constelación tiene 5.
      </p>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

/*
 * El algoritmo contextual VIIRS corriendo en loop, como un debugger visual.
 * Umbrales reales del User Guide C2 (325 K día / 295 K noche, ventana
 * contextual de vecinos, filtros de agua/glint/AMAS). Valores de la
 * simulación ilustrativos.
 */

const COLS = 9
const ROWS = 7
const CAND = { c: 4, r: 3 }

// Terreno determinístico: lago a la izquierda, un par de nubes arriba a la derecha
const WATER = new Set(['0-2', '0-3', '0-4', '1-3', '1-4', '0-5'])
const CLOUD = new Set(['6-1', '7-1', '7-2'])

const PHASES = [
  { dur: 1400, label: 'ESCANEO' },
  { dur: 1600, label: 'CANDIDATO' },
  { dur: 1800, label: 'CONTEXTO' },
  { dur: 1800, label: 'FILTROS' },
  { dur: 2600, label: 'RESULTADO' },
]

const LOG_LINES = [
  ['scan línea 1247 · banda I-4 (3,74 µm)'],
  ['px[4,3] BT4 = 347 K  >  325 K', '→ candidato a fuego'],
  ['ventana 5×5 · 21 vecinos válidos', 'fondo: μ = 289 K · MAD = 4,1 K', 'ΔBT > μ + 3,5·δ  ✓'],
  ['agua excluida (6 px)  ✓', 'nube excluida (3 px)  ✓', 'glint 38° > 15°  ✓ · AMAS flag  ✓'],
  ['CONFIRMADO · confianza nominal', 'FRP = 84 MW', '→ publicado en API FIRMS'],
]

function cellKey(c, r) { return `${c}-${r}` }

function isNeighbor(c, r) {
  return Math.abs(c - CAND.c) <= 2 && Math.abs(r - CAND.r) <= 2 && !(c === CAND.c && r === CAND.r)
}

export default function AlgoLive() {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const [phase, setPhase] = useState(0)
  const [scanCol, setScanCol] = useState(-1)

  // Loop de fases
  useEffect(() => {
    if (!inView) return
    const t = setTimeout(() => setPhase((p) => (p + 1) % PHASES.length), PHASES[phase].dur)
    return () => clearTimeout(t)
  }, [phase, inView])

  // Barrido de columnas durante la fase 0
  useEffect(() => {
    if (!inView || phase !== 0) return
    let col = -1
    const id = setInterval(() => {
      col += 1
      setScanCol(col < COLS ? col : -1)
    }, PHASES[0].dur / (COLS + 1))
    return () => { clearInterval(id); setScanCol(-1) }
  }, [phase, inView])

  const visibleLog = LOG_LINES.slice(0, phase + 1).flat()

  return (
    <div ref={ref} className="w-full max-w-sm mx-auto">
      {/* Fase actual */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-slate-text/50 uppercase tracking-widest">Algoritmo contextual · VIIRS C2</span>
        <span className="font-mono text-[9px] font-bold text-sky-accent">{PHASES[phase].label}</span>
      </div>

      {/* Grilla de píxeles */}
      <div className="hud-frame rounded-xl bg-void/60 border border-white/[0.06] p-3 mb-3">
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {Array.from({ length: ROWS }).flatMap((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const key = cellKey(c, r)
              const isWater = WATER.has(key)
              const isCloud = CLOUD.has(key)
              const isCand = c === CAND.c && r === CAND.r
              const isNeigh = isNeighbor(c, r)

              let cls = 'bg-emerald-accent/10' // tierra
              if (isWater) cls = 'bg-sky-accent/15'
              if (isCloud) cls = 'bg-white/15'

              // Estados por fase
              let ring = ''
              let dim = false
              if (phase >= 1 && isCand) cls = 'bg-red-500/80'
              if (phase === 2 && isNeigh && !isWater && !isCloud) ring = 'ring-1 ring-sky-accent/60'
              if (phase >= 3 && (isWater || isCloud)) dim = true

              return (
                <motion.div
                  key={key}
                  className={`relative aspect-square rounded-[2px] ${cls} ${ring}`}
                  animate={
                    isCand && phase >= 4
                      ? { opacity: [1, 0.5, 1], scale: [1, 1.15, 1] }
                      : isCand && phase >= 1
                        ? { opacity: [0.8, 1, 0.8] }
                        : { opacity: dim ? 0.25 : (scanCol === c ? 1 : 0.75), scale: 1 }
                  }
                  transition={isCand ? { repeat: Infinity, duration: 1.2 } : { duration: 0.3 }}
                >
                  {dim && (
                    <span className="absolute inset-0 flex items-center justify-center text-[7px] text-white/40">✕</span>
                  )}
                </motion.div>
              )
            })
          )}
        </div>

        {/* Badge resultado */}
        <div className="h-7 mt-2.5 flex items-center justify-center">
          {phase >= 4 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 telemetry-blink" />
              <span className="font-mono text-[9px] font-bold text-red-400">DETECCIÓN · NOMINAL · FRP 84 MW</span>
            </motion.div>
          ) : (
            <span className="font-mono text-[8px] text-slate-text/30">
              {phase === 0 ? 'barriendo franja…' : phase === 1 ? 'umbral superado' : phase === 2 ? 'comparando contra el fondo' : 'descartando falsos positivos'}
            </span>
          )}
        </div>
      </div>

      {/* Terminal de misión */}
      <div className="rounded-xl bg-[#050a14] border border-white/[0.06] p-3 font-mono text-[9.5px] leading-relaxed min-h-[118px]">
        <div className="flex items-center gap-1.5 mb-2 opacity-40">
          <span className="w-2 h-2 rounded-full bg-red-500/60" />
          <span className="w-2 h-2 rounded-full bg-amber-500/60" />
          <span className="w-2 h-2 rounded-full bg-emerald-accent/60" />
          <span className="text-[8px] text-slate-text ml-2">vnp14img · proceso de detección</span>
        </div>
        {visibleLog.map((line, i) => (
          <motion.div
            key={`${phase}-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            className={
              line.startsWith('CONFIRMADO') ? 'text-emerald-accent font-bold'
                : line.startsWith('→') ? 'text-amber-400'
                : 'text-slate-text/70'
            }
          >
            <span className="text-slate-text/30 mr-1.5">›</span>{line}
          </motion.div>
        ))}
        <span className="inline-block w-1.5 h-3 bg-emerald-accent/70 telemetry-blink align-middle ml-0.5" />
      </div>

      <p className="font-mono text-[8px] text-slate-text/30 text-center mt-2">
        Umbrales reales del algoritmo VIIRS C2 (NASA) · valores de la simulación ilustrativos
      </p>
    </div>
  )
}

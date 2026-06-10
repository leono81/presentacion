import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

/*
 * Comparador VIIRS 375 m vs MODIS 1 km sobre el crop real de Worldview
 * (incendio 2022, 10-dic). El crop cubre ~41 km de ancho → 1 km ≈ 2,43 %
 * del ancho, 375 m ≈ 0,91 %. Las grillas están a escala real.
 */

const KM_W = 2.43 // 1 km en % del ancho
const KM_H = 3.75 // 1 km en % del alto
const V_W = KM_W * 0.375
const V_H = KM_H * 0.375

// Clusters de detecciones reales visibles en la imagen (centros en %)
const CLUSTERS = [
  { cx: 31.7, cy: 53.8, viirs: 12, modis: 2 },
  { cx: 59.6, cy: 63.7, viirs: 4, modis: 1 },
  { cx: 65.7, cy: 70.6, viirs: 16, modis: 4 },
]

// Offsets determinísticos para las celditas VIIRS alrededor de cada centro
const V_OFFSETS = [
  [0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [2, 0],
  [1, -1], [-1, 1], [2, 1], [-2, 0], [3, 0], [2, -1], [-2, 1], [3, 1],
]
const M_OFFSETS = [[0, 0], [1, 0], [0, 1], [-1, 0]]

const snap = (v, cell) => Math.floor(v / cell) * cell

function viirsCells() {
  const cells = []
  CLUSTERS.forEach((c) => {
    for (let i = 0; i < c.viirs; i++) {
      const [dx, dy] = V_OFFSETS[i % V_OFFSETS.length]
      cells.push({
        left: snap(c.cx, V_W) + dx * V_W,
        top: snap(c.cy, V_H) + dy * V_H,
      })
    }
  })
  return cells
}

function modisCells() {
  const cells = []
  CLUSTERS.forEach((c) => {
    for (let i = 0; i < c.modis; i++) {
      const [dx, dy] = M_OFFSETS[i % M_OFFSETS.length]
      cells.push({
        left: snap(c.cx, KM_W) + dx * KM_W,
        top: snap(c.cy, KM_H) + dy * KM_H,
      })
    }
  })
  return cells
}

const V_CELLS = viirsCells()
const M_CELLS = modisCells()

export default function SensorCompare() {
  const boxRef = useRef(null)
  const [x, setX] = useState(50) // posición del divisor en %
  const draggingRef = useRef(false)

  const updateFromEvent = useCallback((e) => {
    const rect = boxRef.current.getBoundingClientRect()
    const pct = ((e.clientX - rect.left) / rect.width) * 100
    setX(Math.min(97, Math.max(3, pct)))
  }, [])

  const onPointerDown = (e) => {
    draggingRef.current = true
    boxRef.current.setPointerCapture(e.pointerId)
    updateFromEvent(e)
  }
  const onPointerMove = (e) => { if (draggingRef.current) updateFromEvent(e) }
  const onPointerUp = () => { draggingRef.current = false }

  return (
    <div className="w-full max-w-md mx-auto select-none">
      <div className="flex justify-between mb-2">
        <span className="font-mono text-[10px] font-bold text-violet-accent">◂ VIIRS · 375 m</span>
        <span className="font-mono text-[10px] font-bold text-sky-accent">MODIS · 1 km ▸</span>
      </div>

      <div
        ref={boxRef}
        className="relative aspect-[1232/800] rounded-xl overflow-hidden border border-white/10 cursor-ew-resize touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Base: lado MODIS (derecha) */}
        <img
          src="/media/firms-zoom-2022.jpg"
          alt="Zoom satelital del incendio 2022 en Corazón de la Isla con detecciones térmicas"
          className="absolute inset-0 w-full h-full object-cover"
          draggable="false"
        />
        {/* Grilla MODIS 1 km */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              repeating-linear-gradient(to right, rgba(56,189,248,0.22) 0 1px, transparent 1px ${KM_W}%),
              repeating-linear-gradient(to bottom, rgba(56,189,248,0.22) 0 1px, transparent 1px ${KM_H}%)
            `,
          }}
        />
        {/* Celdas MODIS detectoras */}
        {M_CELLS.map((c, i) => (
          <motion.div
            key={`m${i}`}
            className="absolute border border-sky-accent/70 bg-sky-accent/15"
            style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${KM_W}%`, height: `${KM_H}%` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2, delay: i * 0.15 }}
          />
        ))}

        {/* Capa VIIRS (izquierda), recortada por el divisor */}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
          <img
            src="/media/firms-zoom-2022.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            draggable="false"
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(to right, rgba(139,92,246,0.20) 0 1px, transparent 1px ${V_W}%),
                repeating-linear-gradient(to bottom, rgba(139,92,246,0.20) 0 1px, transparent 1px ${V_H}%)
              `,
            }}
          />
          {V_CELLS.map((c, i) => (
            <motion.div
              key={`v${i}`}
              className="absolute border border-red-400/80 bg-red-500/25"
              style={{ left: `${c.left}%`, top: `${c.top}%`, width: `${V_W}%`, height: `${V_H}%` }}
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.06 }}
            />
          ))}
        </div>

        {/* Divisor */}
        <div className="absolute top-0 bottom-0 w-px bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.5)]" style={{ left: `${x}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-void/90 border border-white/40 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white/80 text-[10px] font-mono">⇄</span>
          </div>
        </div>

        {/* Contadores por lado */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-void/80 backdrop-blur-sm border border-violet-accent/30 pointer-events-none">
          <span className="font-mono text-[9px] text-violet-accent font-bold">{V_CELLS.length} píxeles detectan</span>
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-void/80 backdrop-blur-sm border border-sky-accent/30 pointer-events-none">
          <span className="font-mono text-[9px] text-sky-accent font-bold">{M_CELLS.length} píxeles detectan</span>
        </div>
      </div>

      <p className="font-mono text-[8px] text-slate-text/40 text-center mt-2 leading-relaxed">
        Imagen real VIIRS ampliada · incendio 2022, Corazón de la Isla · grillas a escala (1 km ≈ 30 px).
        Celdas MODIS ilustrativas según resolución del sensor. Arrastrá el divisor.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="px-3 py-2 rounded-xl bg-violet-accent/8 border border-violet-accent/20">
          <div className="font-mono text-sm font-bold text-violet-accent">375 m</div>
          <div className="font-mono text-[8px] text-violet-accent/60 uppercase tracking-wider">ubica el frente de avance</div>
        </div>
        <div className="px-3 py-2 rounded-xl bg-surface-2/40 border border-white/5">
          <div className="font-mono text-sm font-bold text-sky-accent">1 km</div>
          <div className="font-mono text-[8px] text-slate-text/50 uppercase tracking-wider">confirma que hay fuego</div>
        </div>
      </div>
    </div>
  )
}

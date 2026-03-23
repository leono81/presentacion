import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionTag from '../ui/SectionTag'
import { fadeInUp } from '../../lib/animations'
import { useInView } from 'react-intersection-observer'

const steps = [
  {
    id: 0,
    tag: '01 — LOS SATÉLITES',
    title: 'Ojos en órbita',
    body: '5 satélites polares — Terra, Aqua, Suomi NPP, NOAA-20, NOAA-21 — más los geoestacionarios GOES 16/18 orbitan la Tierra sin pausa.',
    detail: 'Tierra del Fuego, por su latitud extrema (54°S), recibe más de 10 pasadas diarias. Las órbitas polares se superponen en los extremos del planeta.',
  },
  {
    id: 1,
    tag: '02 — LOS SENSORES',
    title: 'Miden calor, no toman fotos',
    body: 'VIIRS (375m por píxel) y MODIS (1km por píxel) miden radiación infrarroja. Pueden identificar un foco de calor desde 20m².',
    detail: 'Funcionan de día, de noche, a través de humo. No necesitan luz solar — detectan energía térmica.',
  },
  {
    id: 2,
    tag: '03 — EL ALGORITMO',
    title: 'Detección contextual',
    body: 'El algoritmo de NASA compara cada píxel con sus vecinos. Filtra reflejos de agua, nubes y brillo solar. Clasifica cada detección por nivel de confianza.',
    detail: 'Usa bandas de infrarrojo medio y onda larga para distinguir llamas abiertas de combustión latente bajo superficie.',
  },
]

const stats = [
  { value: '375m', label: 'Resolución VIIRS', color: 'text-sky-accent' },
  { value: '+10/día', label: 'Pasadas sobre TdF', color: 'text-amber-400' },
  { value: '10 min', label: 'Frecuencia GOES', color: 'text-violet-accent' },
  { value: '5+2', label: 'Satélites activos', color: 'text-emerald-accent' },
]

// Step 1: Satellite visualization
function SatelliteVis() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full max-w-md aspect-square">
        {/* Orbit rings */}
        <div className="absolute inset-8 rounded-full border border-dashed border-sky-accent/20" />
        <div className="absolute inset-16 rounded-full border border-sky-accent/10" />

        {/* Earth / TdF center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-accent/10 to-sky-accent/5 border border-emerald-accent/20 flex flex-col items-center justify-center">
            <span className="font-mono text-[11px] text-emerald-accent/80 font-bold tracking-wide">TIERRA DEL</span>
            <span className="font-mono text-[11px] text-emerald-accent/80 font-bold tracking-wide">FUEGO</span>
            <span className="font-mono text-[9px] text-slate-text/50 mt-1">54°S · 68°O</span>
          </div>
        </div>

        {/* Satellites orbiting */}
        {[
          { name: 'VIIRS', angle: -30, dist: 'top-2 left-1/4', color: 'sky-accent' },
          { name: 'MODIS', angle: 45, dist: 'top-8 right-4', color: 'violet-accent' },
          { name: 'GOES', angle: 180, dist: 'bottom-12 right-8', color: 'amber-400' },
        ].map((sat) => (
          <motion.div
            key={sat.name}
            className={`absolute ${sat.dist}`}
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: sat.angle / 100 }}
          >
            <div className={`px-3 py-1.5 rounded-lg bg-${sat.color}/10 border border-${sat.color}/30`}>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full bg-${sat.color}`} />
                <span className={`font-mono text-xs font-bold text-${sat.color}`}>{sat.name}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Polar advantage callout */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="px-4 py-2 rounded-full bg-sky-accent/10 border border-sky-accent/20">
            <span className="font-mono text-xs text-sky-accent">+10 pasadas/día en latitud polar</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 2: IR Sensor visualization
function SensorVis() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        {/* Satellite at top */}
        <div className="flex justify-center mb-6">
          <div className="px-4 py-2 rounded-lg bg-sky-accent/10 border border-sky-accent/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-accent" />
            <span className="font-mono text-sm font-bold text-sky-accent">VIIRS</span>
            <span className="font-mono text-xs text-slate-text/60">375m/px</span>
          </div>
        </div>

        {/* IR beam */}
        <div className="relative mx-auto w-0 h-0 border-l-[80px] border-r-[80px] border-t-[120px] border-l-transparent border-r-transparent border-t-amber-500/15">
          {/* Scan lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 h-px bg-amber-400/40"
              style={{
                top: `${20 + i * 20}%`,
                width: `${30 + i * 14}%`,
              }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
            />
          ))}
        </div>

        {/* Ground / terrain strip */}
        <div className="relative mx-auto w-64 h-20 rounded-xl bg-surface-2/50 border border-white/5 overflow-hidden mt-2">
          {/* Terrain pixels */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-px p-1">
            {Array.from({ length: 32 }).map((_, i) => {
              const isHot = [10, 11, 18, 19].includes(i)
              const isWarm = [9, 12, 17, 20].includes(i)
              return (
                <motion.div
                  key={i}
                  className={`rounded-sm ${
                    isHot
                      ? 'bg-red-500/60'
                      : isWarm
                        ? 'bg-amber-500/30'
                        : 'bg-emerald-accent/5'
                  }`}
                  animate={isHot ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={isHot ? { repeat: Infinity, duration: 1.5, delay: i * 0.1 } : {}}
                />
              )
            })}
          </div>
          <div className="absolute bottom-1 left-2 right-2 flex justify-between">
            <span className="font-mono text-[8px] text-emerald-accent/40">frío</span>
            <span className="font-mono text-[8px] text-amber-400/40">tibio</span>
            <span className="font-mono text-[8px] text-red-400/60">caliente</span>
          </div>
        </div>

        {/* Labels */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-500/60" />
            <span className="font-mono text-xs text-slate-text">Foco térmico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-accent/10" />
            <span className="font-mono text-xs text-slate-text">Terreno normal</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 3: Algorithm visualization
function AlgoVis() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full max-w-md">
        {/* Raw detections */}
        <div className="text-center mb-4">
          <span className="font-mono text-xs text-slate-text/60 uppercase tracking-wider">Algoritmo contextual de NASA</span>
        </div>

        {/* Pipeline flow */}
        <div className="space-y-4">
          {/* Input */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex gap-1.5 flex-shrink-0">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i <= 3 ? 'bg-red-500' : 'bg-amber-500/40'}`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, delay: i * 0.15 }}
                />
              ))}
            </div>
            <span className="font-mono text-sm text-amber-400">7 detecciones crudas</span>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-slate-text/30 font-mono text-lg"
            >↓</motion.div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-3 gap-2">
            {['Agua', 'Nubes', 'Brillo solar'].map((f) => (
              <div key={f} className="p-2 rounded-lg bg-surface-2/50 border border-white/5 text-center">
                <span className="font-mono text-[10px] text-slate-text/60 uppercase tracking-wide">{f}</span>
                <div className="text-slate-text/30 text-xs mt-1">filtrado ✓</div>
              </div>
            ))}
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
              className="text-slate-text/30 font-mono text-lg"
            >↓</motion.div>
          </div>

          {/* Output — classified */}
          <div className="p-4 rounded-xl bg-emerald-accent/5 border border-emerald-accent/20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-emerald-accent">Resultado clasificado</span>
            </div>
            <div className="space-y-2">
              {[
                { conf: 'Alta', color: 'bg-red-500', label: '2 focos', textColor: 'text-red-400' },
                { conf: 'Nominal', color: 'bg-amber-500', label: '1 foco', textColor: 'text-amber-400' },
                { conf: 'Baja', color: 'bg-slate-text/30', label: '4 descartados', textColor: 'text-slate-text/60' },
              ].map((r) => (
                <div key={r.conf} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                  <span className={`font-mono text-xs font-bold ${r.textColor}`}>{r.conf}</span>
                  <span className="font-mono text-xs text-slate-text/40 ml-auto">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Steps 2 and 3 fade in ON TOP of step 1 via z-index stacking.
// Step 1 is ALWAYS visible as the base layer — no scroll dependency.
const overlayRanges = [
  // step 1 (sensors): fades in at 30-38%, stays until 62%
  [0.30, 0.38],
  // step 2 (algorithm): fades in at 62-70%, stays forever
  [0.62, 0.70],
]

function StepTextBase({ step }) {
  // Step 1 — always visible, no scroll dependency
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-center">
      <span className="font-mono text-xs text-amber-400/70 tracking-widest mb-3">{step.tag}</span>
      <h3 className="font-display font-800 text-2xl md:text-3xl text-white-text mb-4">{step.title}</h3>
      <p className="text-slate-text text-base leading-relaxed mb-3">{step.body}</p>
      <p className="text-slate-text/60 text-sm leading-relaxed">{step.detail}</p>
    </div>
  )
}

function StepTextOverlay({ step, progress, rangeIndex }) {
  const [start, mid] = overlayRanges[rangeIndex]
  // bg snaps fully opaque BEFORE content starts — kills ghosting
  const bgOpacity = useTransform(progress, [start - 0.03, start - 0.01], [0, 1])
  const contentOpacity = useTransform(progress, [start, mid], [0, 1])
  const y = useTransform(progress, [start, mid], [20, 0])

  return (
    <div className={`absolute inset-0 ${rangeIndex === 0 ? 'z-20' : 'z-30'}`}>
      {/* Opaque background that covers content below — uses its own opacity */}
      <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0 bg-void" />
      {/* Content fades in smoothly */}
      <motion.div style={{ opacity: contentOpacity, y }} className="relative flex flex-col justify-center h-full">
        <span className="font-mono text-xs text-amber-400/70 tracking-widest mb-3">{step.tag}</span>
        <h3 className="font-display font-800 text-2xl md:text-3xl text-white-text mb-4">{step.title}</h3>
        <p className="text-slate-text text-base leading-relaxed mb-3">{step.body}</p>
        <p className="text-slate-text/60 text-sm leading-relaxed">{step.detail}</p>
      </motion.div>
    </div>
  )
}

function StepDot({ progress, start, mid }) {
  const opacity = useTransform(progress, [start, mid, mid + 0.1], [0.2, 1, 0.4])
  const scale = useTransform(progress, [start, mid, mid + 0.1], [0.6, 1.2, 0.8])

  return (
    <motion.div
      style={{ opacity, scale }}
      className="w-2 h-2 rounded-full bg-white"
    />
  )
}

export default function Firms() {
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const stickyRef = useRef(null)

  const { scrollYProgress } = useScroll({
    target: stickyRef,
    offset: ['start start', 'end end'],
  })

  // Diagram opacities — 3 steps
  // Vis1 always visible, vis2/vis3 overlay on top
  const vis2 = useTransform(scrollYProgress, [0.28, 0.36], [0, 1])
  const vis3 = useTransform(scrollYProgress, [0.60, 0.68], [0, 1])

  const progressWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <section className="relative bg-void">
      {/* Header — outside sticky, anchor target */}
      <div id="firms" className="max-w-7xl mx-auto px-6 pt-24 md:pt-32 pb-8 scroll-mt-16" ref={headerRef}>
        <div className="text-center">
          <SectionTag>Cómo Funciona FIRMS</SectionTag>
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate={headerInView ? 'visible' : 'hidden'}
            className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6"
          >
            Del <span className="text-sky-accent">espacio</span> a la detección
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate={headerInView ? 'visible' : 'hidden'}
            className="text-slate-text text-lg max-w-2xl mx-auto"
          >
            NASA FIRMS es el sistema que usan las agencias de protección ambiental de
            Estados Unidos, Brasil y Australia para detectar incendios activos en todo el planeta.
          </motion.p>
        </div>
      </div>

      {/* Scroll-driven sticky — starts AFTER header */}
      <div ref={stickyRef} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen pt-16 overflow-hidden">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-px bg-white/5">
            <motion.div
              style={{ width: progressWidth }}
              className="h-full bg-gradient-to-r from-sky-accent via-amber-400 to-emerald-accent"
            />
          </div>

          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              {/* Left: text — step 1 is base, steps 2&3 overlay on top */}
              <div className="relative min-h-[280px]">
                <StepTextBase step={steps[0]} />
                <StepTextOverlay step={steps[1]} progress={scrollYProgress} rangeIndex={0} />
                <StepTextOverlay step={steps[2]} progress={scrollYProgress} rangeIndex={1} />
              </div>

              {/* Right: vis — step 1 is base, steps 2&3 overlay with bg */}
              <div className="relative min-h-[400px]">
                {/* Base layer: always visible */}
                <div className="absolute inset-0 z-10">
                  <SatelliteVis />
                </div>
                {/* Overlay layers — separate bg from content to avoid ghosting */}
                <div className="absolute inset-0 z-20">
                  <motion.div style={{ opacity: useTransform(scrollYProgress, [0.25, 0.27], [0, 1]) }} className="absolute inset-0 bg-void" />
                  <motion.div style={{ opacity: vis2 }} className="relative h-full">
                    <SensorVis />
                  </motion.div>
                </div>
                <div className="absolute inset-0 z-30">
                  <motion.div style={{ opacity: useTransform(scrollYProgress, [0.57, 0.59], [0, 1]) }} className="absolute inset-0 bg-void" />
                  <motion.div style={{ opacity: vis3 }} className="relative h-full">
                    <AlgoVis />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* Step dots */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
            {[0, 0.30, 0.62].map((start, i) => (
              <StepDot key={i} progress={scrollYProgress} start={start} mid={start + 0.08} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-6 rounded-xl bg-surface/50 border border-white/5 text-center">
              <div className={`font-mono text-2xl font-bold ${s.color} mb-2`}>{s.value}</div>
              <div className="text-xs text-slate-text uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-text/40 font-mono mt-8">
          Fuente: NASA FIRMS / NASA Earthdata
        </p>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionTag from '../ui/SectionTag'
import { fadeInUp } from '../../lib/animations'
import { useInView } from 'react-intersection-observer'

const steps = [
  {
    id: 0,
    tag: '01',
    label: 'LOS SATÉLITES',
    title: 'Ojos en órbita polar',
    body: '5 satélites polares — Terra, Aqua, Suomi NPP, NOAA-20, NOAA-21 — orbitan de polo a polo mientras la Tierra gira debajo. Los geoestacionarios GOES 16/18, fijos sobre América, completan la vigilancia cada 10 minutos.',
    detail: 'Tierra del Fuego (54°S) recibe más de 10 pasadas diarias: las órbitas convergen en latitudes extremas y las franjas de observación se superponen.',
  },
  {
    id: 1,
    tag: '02',
    label: 'LOS SENSORES',
    title: 'Miden calor, no toman fotos',
    body: 'VIIRS (375m/píxel) y MODIS (1km/píxel) miden radiación infrarroja en bandas de onda media y larga. No necesitan luz solar — detectan energía térmica de día, de noche, y a través de humo.',
    detail: 'VIIRS detecta focos desde 20m² con mínima distorsión en los bordes. MODIS tiene mayor cobertura pero sus píxeles se deforman hasta 5km en los extremos de la franja.',
  },
  {
    id: 2,
    tag: '03',
    label: 'EL ALGORITMO',
    title: 'Filtrado contextual',
    body: 'Cada píxel se compara contra sus vecinos. Se filtran reflejos de agua, nubes, brillo solar y superficies calientes no relacionadas con fuego. Las detecciones se clasifican por nivel de confianza.',
    detail: 'Un punto en el mapa no significa que todo el píxel esté en llamas — indica que dentro de ese área hay calor suficiente para activar la detección.',
  },
]

const stats = [
  { value: '375m', label: 'Resolución VIIRS', sub: 'por píxel', color: 'text-sky-accent' },
  { value: '+10', label: 'Pasadas diarias', sub: 'sobre TdF', color: 'text-amber-400' },
  { value: '10 min', label: 'Frecuencia GOES', sub: 'geoestacionario', color: 'text-violet-accent' },
  { value: '< 3hs', label: 'Latencia NRT', sub: 'satélite → API', color: 'text-emerald-accent' },
]

// --- Text block: scrolls naturally, triggers vis change ---
function StepBlock({ step, onInView }) {
  const [ref] = useInView({
    threshold: 0.5,
    onChange: (inView) => { if (inView) onInView(step.id) },
  })

  return (
    <div ref={ref} className="min-h-[70vh] flex items-center">
      <div className="py-12">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-accent/10 border border-sky-accent/20 flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-sky-accent">{step.tag}</span>
          </div>
          <span className="font-mono text-xs text-slate-text/50 uppercase tracking-widest">{step.label}</span>
        </div>
        <h3 className="font-display font-800 text-3xl md:text-4xl text-white-text mb-5 leading-tight">{step.title}</h3>
        <p className="text-slate-text text-lg leading-relaxed mb-4">{step.body}</p>
        <p className="text-slate-text/50 text-sm leading-relaxed border-l-2 border-sky-accent/20 pl-4">{step.detail}</p>
      </div>
    </div>
  )
}

// --- Visualizations ---

function SatelliteVis() {
  return (
    <div className="relative w-full max-w-xs mx-auto aspect-square">
      <div className="absolute inset-4 rounded-full border border-dashed border-sky-accent/15 animate-[spin_60s_linear_infinite]" />
      <div className="absolute inset-12 rounded-full border border-sky-accent/10" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-accent/10 to-sky-accent/5 border border-emerald-accent/20 flex flex-col items-center justify-center">
          <span className="font-mono text-[9px] text-emerald-accent/80 font-bold tracking-wide">TIERRA DEL</span>
          <span className="font-mono text-[9px] text-emerald-accent/80 font-bold tracking-wide">FUEGO</span>
          <span className="font-mono text-[7px] text-slate-text/50 mt-1">54°S · 68°O</span>
        </div>
      </div>

      {[
        { name: 'VIIRS', sub: '375m', pos: 'top-2 left-[18%]', color: 'sky-accent' },
        { name: 'MODIS', sub: '1km', pos: 'top-8 right-2', color: 'violet-accent' },
        { name: 'GOES', sub: '10min', pos: 'bottom-12 right-4', color: 'amber-400' },
      ].map((sat, i) => (
        <motion.div
          key={sat.name}
          className={`absolute ${sat.pos}`}
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3, delay: i * 0.7 }}
        >
          <div className={`px-2.5 py-1.5 rounded-lg bg-${sat.color}/10 border border-${sat.color}/30`}>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full bg-${sat.color}`} />
              <span className={`font-mono text-[11px] font-bold text-${sat.color}`}>{sat.name}</span>
              <span className="font-mono text-[9px] text-slate-text/40">{sat.sub}</span>
            </div>
          </div>
        </motion.div>
      ))}

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
        {[
          { x1: 30, y1: 15, x2: 50, y2: 42, c: 'rgb(56 189 248)', d: 0 },
          { x1: 80, y1: 20, x2: 52, y2: 42, c: 'rgb(139 92 246)', d: 0.7 },
          { x1: 78, y1: 70, x2: 55, y2: 55, c: 'rgb(251 191 36)', d: 1.4 },
        ].map((l, i) => (
          <motion.line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.c} strokeWidth="0.3" strokeDasharray="2 2"
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ repeat: Infinity, duration: 2, delay: l.d }}
          />
        ))}
      </svg>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <div className="px-3 py-1.5 rounded-full bg-sky-accent/10 border border-sky-accent/20">
          <span className="font-mono text-[10px] text-sky-accent">órbitas convergen en los polos</span>
        </div>
      </div>
    </div>
  )
}

function SensorVis() {
  return (
    <div className="w-full max-w-sm mx-auto space-y-5">
      <div className="flex justify-center">
        <div className="px-4 py-2 rounded-lg bg-sky-accent/10 border border-sky-accent/30 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-accent" />
          <span className="font-mono text-sm font-bold text-sky-accent">Infrarrojo térmico</span>
        </div>
      </div>

      <div className="relative mx-auto w-0 h-0 border-l-[60px] border-r-[60px] border-t-[80px] border-l-transparent border-r-transparent border-t-amber-500/10">
        {[0, 1, 2].map((i) => (
          <motion.div key={i}
            className="absolute left-1/2 -translate-x-1/2 h-px bg-amber-400/30"
            style={{ top: `${25 + i * 25}%`, width: `${30 + i * 18}%` }}
            animate={{ opacity: [0.15, 0.6, 0.15] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-sky-accent/5 border border-sky-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-accent" />
            <span className="font-mono text-xs font-bold text-sky-accent">VIIRS</span>
          </div>
          <div className="grid grid-cols-4 grid-rows-4 gap-px mb-2">
            {Array.from({ length: 16 }).map((_, i) => {
              const isHot = [5, 6, 9, 10].includes(i)
              return (
                <motion.div key={i}
                  className={`w-full aspect-square rounded-[2px] ${isHot ? 'bg-red-500/60' : 'bg-sky-accent/10'}`}
                  animate={isHot ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={isHot ? { repeat: Infinity, duration: 1.5 } : {}}
                />
              )
            })}
          </div>
          <div className="font-mono text-[10px] text-sky-accent/70 text-center">375m / píxel</div>
          <div className="font-mono text-[9px] text-slate-text/40 text-center mt-0.5">detecta desde 20m²</div>
        </div>

        <div className="p-3 rounded-xl bg-violet-accent/5 border border-violet-accent/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-accent" />
            <span className="font-mono text-xs font-bold text-violet-accent">MODIS</span>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-px mb-2">
            {Array.from({ length: 4 }).map((_, i) => {
              const isHot = i === 3
              return (
                <motion.div key={i}
                  className={`w-full aspect-square rounded-[2px] ${isHot ? 'bg-red-500/60' : 'bg-violet-accent/10'}`}
                  animate={isHot ? { opacity: [0.5, 1, 0.5] } : {}}
                  transition={isHot ? { repeat: Infinity, duration: 1.5 } : {}}
                />
              )
            })}
          </div>
          <div className="font-mono text-[10px] text-violet-accent/70 text-center">1km / píxel</div>
          <div className="font-mono text-[9px] text-slate-text/40 text-center mt-0.5">mayor cobertura</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {['De día', 'De noche', 'A través de humo'].map((cap) => (
          <div key={cap} className="px-2.5 py-1 rounded-full bg-emerald-accent/5 border border-emerald-accent/15">
            <span className="font-mono text-[10px] text-emerald-accent/70">{cap}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlgoVis() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-center mb-4">
        <span className="font-mono text-[10px] text-slate-text/50 uppercase tracking-widest">Algoritmo contextual</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <div className="flex gap-1 flex-shrink-0">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <motion.div key={i}
                className={`w-2.5 h-2.5 rounded-full ${i <= 3 ? 'bg-red-500' : 'bg-amber-500/40'}`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.15 }}
              />
            ))}
          </div>
          <span className="font-mono text-xs text-amber-400">7 detecciones crudas</span>
        </div>

        <div className="flex justify-center">
          <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-slate-text/20 font-mono text-sm">↓</motion.div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[{ name: 'Agua', icon: '💧' }, { name: 'Nubes', icon: '☁️' }, { name: 'Brillo', icon: '☀️' }].map((f) => (
            <div key={f.name} className="p-2 rounded-lg bg-surface-2/50 border border-white/5 text-center">
              <div className="text-sm mb-0.5">{f.icon}</div>
              <span className="font-mono text-[9px] text-slate-text/50 uppercase tracking-wide">{f.name}</span>
              <div className="text-emerald-accent/50 text-[9px] mt-0.5">filtrado ✓</div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <motion.div animate={{ y: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
            className="text-slate-text/20 font-mono text-sm">↓</motion.div>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-accent/5 border border-emerald-accent/20">
          <span className="font-mono text-xs text-emerald-accent mb-2.5 block">Clasificación por confianza</span>
          <div className="space-y-2">
            {[
              { conf: 'Alta', color: 'bg-red-500', label: '2 focos confirmados', textColor: 'text-red-400' },
              { conf: 'Nominal', color: 'bg-amber-500', label: '1 foco probable', textColor: 'text-amber-400' },
              { conf: 'Baja', color: 'bg-slate-text/20', label: '4 descartados', textColor: 'text-slate-text/50' },
            ].map((r) => (
              <div key={r.conf} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${r.color}`} />
                <span className={`font-mono text-[11px] font-bold ${r.textColor}`}>{r.conf}</span>
                <span className="font-mono text-[10px] text-slate-text/40 ml-auto">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const visComponents = [SatelliteVis, SensorVis, AlgoVis]

// --- Sticky visualization panel ---
function StickyVis({ activeStep }) {
  return (
    <div className="flex items-center justify-center h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {visComponents[activeStep]()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// --- Step indicator dots ---
function StepDots({ activeStep }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            i === activeStep ? 'bg-white scale-125' : 'bg-white/30 scale-100'
          }`} />
          <span className={`font-mono text-[9px] transition-colors duration-300 hidden lg:block ${
            i === activeStep ? 'text-white/70' : 'text-white/20'
          }`}>{step.label}</span>
        </div>
      ))}
    </div>
  )
}

export default function Firms() {
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section id="firms" className="relative bg-void scroll-mt-16">
      {/* Sticky section header — stays visible throughout the entire section */}
      <div className="sticky top-14 z-30 bg-void/95 backdrop-blur-md border-b border-white/5" ref={headerRef}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <SectionTag>Cómo Funciona FIRMS</SectionTag>
              <h2 className="font-display font-800 text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                Del <span className="text-sky-accent">espacio</span> a la detección
              </h2>
              <p className="text-slate-text text-sm mt-2 max-w-lg">
                NASA FIRMS detecta incendios activos en todo el planeta.
                Así llega la señal desde el satélite hasta tu pantalla.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4 pb-1">
              {steps.map((step, i) => (
                <span
                  key={i}
                  className={`font-mono text-[10px] uppercase tracking-wider transition-colors duration-300 ${
                    i === activeStep ? 'text-white' : 'text-white/25'
                  }`}
                >
                  {step.tag} {step.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollytelling: text scrolls, vis is sticky */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 relative">
          {/* Left: text blocks scroll naturally */}
          <div>
            {steps.map((step) => (
              <StepBlock key={step.id} step={step} onInView={setActiveStep} />
            ))}
          </div>

          {/* Right: visualization sticks in place (below sticky title) */}
          <div className="hidden md:block">
            <div className="sticky top-52 h-[calc(100vh-14rem)]">
              <StickyVis activeStep={activeStep} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-16 mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-5 rounded-xl bg-surface/50 border border-white/5 text-center">
              <div className={`font-mono text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
              <div className="text-xs text-white-text/80 font-medium">{s.label}</div>
              <div className="text-[10px] text-slate-text/50 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-text/30 font-mono mt-6">
          Fuente: NASA FIRMS / NASA Earthdata · LANCE NRT
        </p>
      </div>
    </section>
  )
}

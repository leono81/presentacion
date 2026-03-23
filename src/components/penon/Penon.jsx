import { motion } from 'framer-motion'
import { useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { fadeInUp, staggerContainer } from '../../lib/animations'
import SectionTag from '../ui/SectionTag'
import FwiDiagram from './FwiDiagram'
import TdfOutline from './TdfOutline'
import { Satellite, Factory, Fuel, Wind, Gauge, Shield } from 'lucide-react'

const heroFeatures = [
  {
    icon: Factory,
    title: 'Filtro Industrial',
    desc: 'Polígonos de parques industriales de Río Grande. Detecciones dentro se descartan automáticamente.',
    tag: 'Exclusivo',
    color: 'text-yellow-500',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
    tagBg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
  },
  {
    icon: Fuel,
    title: 'Filtro Petrolero',
    desc: 'Zonas de gas y petróleo del norte de la isla mapeadas y filtradas del análisis.',
    tag: 'Exclusivo',
    color: 'text-orange-500',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
    tagBg: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
  },
]

const supportFeatures = [
  { icon: Satellite, title: 'NASA FIRMS', desc: 'VIIRS + MODIS, el estándar global.', color: 'text-sky-accent' },
  { icon: Wind, title: 'Viento Real', desc: 'Velocidad y dirección sobre el mapa.', color: 'text-sky-accent' },
  { icon: Gauge, title: 'Índice FWI', desc: 'Estándar canadiense de riesgo.', color: 'text-emerald-accent' },
  { icon: Shield, title: 'Confianza', desc: 'Alta / Nominal / Baja por detección.', color: 'text-violet-accent' },
]

export default function Penon() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="penon" className="relative py-24 md:py-32 bg-surface overflow-hidden">
      {/* Subtle aurora top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-accent/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <SectionTag>Penon Monitor</SectionTag>
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4"
          >
            Inteligencia <span className="text-emerald-accent">local</span>
            <br />
            sobre datos <span className="text-sky-accent">globales</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-slate-text text-base max-w-2xl mx-auto"
          >
            FIRMS entrega datos crudos. Penon los convierte en inteligencia
            accionable eliminando el ruido.
          </motion.p>
        </div>

        {/* ── Before / After ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-20"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without Penon */}
            <div className="relative p-6 rounded-2xl bg-red-500/[0.03] border border-red-500/15 overflow-hidden group">
              <h3 className="font-display font-700 text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Sin Penon
              </h3>
              <div className="relative h-56 md:h-72 rounded-xl bg-void/60 border border-white/5 overflow-hidden mb-4">
                {/* TdF outline */}
                <TdfOutline className="absolute inset-0 w-full h-full text-slate-text p-4" />
                {/* Grid background */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }} />
                {/* 3 detections — all look the same, can't tell which is real */}
                {[
                  { x: 30, y: 28 },  // Falso: plataforma petrolera en el mar (Estrecho)
                  { x: 25, y: 62 },  // Real: incendio forestal centro de la isla
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2.5 h-2.5 rounded-full bg-red-500"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  />
                ))}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-red-400/70 bg-void/80 px-2 py-1 rounded">
                    2 detecciones — ¿cuál es real?
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-text leading-relaxed">
                Todas las detecciones mezcladas. Zonas industriales, petroleras y
                bosque nativo. <span className="text-red-400">Falsas alarmas que desvían recursos.</span>
              </p>
            </div>

            {/* With Penon */}
            <div className="relative p-6 rounded-2xl bg-emerald-accent/[0.03] border border-emerald-accent/15 overflow-hidden group">
              <h3 className="font-display font-700 text-lg mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-accent" />
                Con Penon
              </h3>
              <div className="relative h-56 md:h-72 rounded-xl bg-void/60 border border-white/5 overflow-hidden mb-4">
                {/* TdF outline */}
                <TdfOutline className="absolute inset-0 w-full h-full text-slate-text p-4" />
                {/* Grid background */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }} />

                {/* Petroleum zone — in the sea, Estrecho de Magallanes */}
                <div className="absolute flex items-center gap-2" style={{ left: '30%', top: '28%' }}>
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500/30 shrink-0" />
                  <div className="px-2 py-1 rounded border border-dashed border-orange-500/30 bg-orange-500/[0.05]">
                    <span className="text-[8px] text-orange-500/70 font-mono tracking-wider leading-none">PETROLERA</span>
                  </div>
                </div>

                {/* REAL DETECTION — forest fire, center of island */}
                <motion.div
                  className="absolute"
                  style={{ left: '25%', top: '62%' }}
                >
                  {/* Outer pulse ring */}
                  <motion.div
                    className="absolute -inset-5 rounded-full border border-red-500/30"
                    animate={{ scale: [1, 2.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  />
                  {/* Inner pulse ring */}
                  <motion.div
                    className="absolute -inset-3 rounded-full bg-red-500/15"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0.1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  {/* Core dot */}
                  <div className="relative w-4 h-4 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8),0_0_40px_rgba(239,68,68,0.4)]" />
                </motion.div>

                {/* Alert label */}
                <div className="absolute flex items-center gap-1.5" style={{ left: '30%', top: '60%' }}>
                  <div className="px-2 py-1 rounded bg-red-500/15 border border-red-500/30">
                    <span className="text-[8px] text-red-400 font-mono font-bold tracking-wider">INCENDIO FORESTAL</span>
                  </div>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-emerald-accent/80 bg-void/80 px-2 py-1 rounded">
                    1 detección real — acción inmediata
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-text leading-relaxed">
                Filtros inteligentes eliminan el ruido. Solo quedan focos reales en bosque.{' '}
                <span className="text-emerald-accent">Cero falsas alarmas.</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Highlighted filters ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-4 mb-16"
        >
          {heroFeatures.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className={`p-6 rounded-xl ${f.bg} border ${f.border} flex items-start gap-4 hover:border-opacity-40 transition-colors`}
            >
              <div className={`p-3 rounded-lg bg-void/40 ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-display font-700 text-base">{f.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-semibold tracking-wide ${f.tagBg}`}>
                    {f.tag}
                  </span>
                </div>
                <p className="text-sm text-slate-text leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Supporting features (compact row) ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-20"
        >
          {supportFeatures.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className="p-4 rounded-xl bg-surface-2/30 border border-white/5 text-center"
            >
              <f.icon className={`w-5 h-5 ${f.color} mx-auto mb-2`} />
              <h4 className="font-display font-700 text-sm mb-1">{f.title}</h4>
              <p className="text-xs text-slate-text leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── FWI Diagram ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <div className="text-center mb-8">
            <h3 className="font-display font-700 text-2xl text-white-text mb-2">
              Índice de Riesgo <span className="text-emerald-accent">FWI</span>
            </h3>
            <p className="text-slate-text text-sm max-w-xl mx-auto">
              Estándar canadiense usado por Canadá, Australia y la UE. Penon lo calcula
              automáticamente con datos meteorológicos en tiempo real.
            </p>
          </div>
          <FwiDiagram inView={inView} />
          <p className="text-center text-[10px] text-slate-text/40 font-mono mt-4">
            Fuente: Natural Resources Canada
          </p>
        </motion.div>
      </div>

      {/* Subtle aurora bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-accent/20 to-transparent" />
    </section>
  )
}

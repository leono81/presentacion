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
    desc: 'Polígonos de los parques industriales de Río Grande, Tolhuin y Ushuaia. Detecciones térmicas dentro de estas zonas se descartan automáticamente.',
    tag: 'Exclusivo',
    stat: '3 ciudades',
    statLabel: 'mapeadas',
    color: 'text-yellow-500',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
    tagBg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
  },
  {
    icon: Fuel,
    title: 'Filtro Petrolero',
    desc: 'Plataformas offshore y zonas de explotación de gas en el Estrecho de Magallanes. Señales térmicas de antorchas de gas eliminadas del análisis.',
    tag: 'Exclusivo',
    stat: 'Offshore',
    statLabel: 'filtrado',
    color: 'text-orange-500',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/5',
    tagBg: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
  },
]

const supportFeatures = [
  {
    icon: Satellite,
    title: 'NASA FIRMS',
    stat: '375m',
    statLabel: 'resolución VIIRS',
    desc: 'Sensores VIIRS + MODIS — el estándar global para detección de incendios activos.',
    color: 'text-sky-accent',
    border: 'border-sky-accent/10',
  },
  {
    icon: Wind,
    title: 'Viento en Tiempo Real',
    stat: 'Live',
    statLabel: 'Open-Meteo',
    desc: 'Velocidad y dirección del viento animada sobre el mapa. Clave para predecir propagación.',
    color: 'text-sky-accent',
    border: 'border-sky-accent/10',
  },
  {
    icon: Gauge,
    title: 'Índice FWI',
    stat: '6',
    statLabel: 'componentes',
    desc: 'Fire Weather Index canadiense. Riesgo calculado en tiempo real con datos meteorológicos.',
    color: 'text-emerald-accent',
    border: 'border-emerald-accent/10',
  },
  {
    icon: Shield,
    title: 'Niveles de Confianza',
    stat: '3',
    statLabel: 'niveles',
    desc: 'Alta / Nominal / Baja — cada detección clasificada para priorizar la respuesta.',
    color: 'text-violet-accent',
    border: 'border-violet-accent/10',
  },
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

        {/* ── Highlighted filters (Exclusivo) ── */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 gap-4 mb-12"
        >
          {heroFeatures.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className={`p-6 rounded-xl ${f.bg} border ${f.border} hover:border-opacity-40 transition-colors`}
            >
              <div className="flex items-start gap-4 mb-4">
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
              </div>
              <div className="flex items-baseline gap-2 pl-[52px]">
                <span className={`font-mono font-bold text-lg ${f.color}`}>{f.stat}</span>
                <span className="text-xs text-slate-text">{f.statLabel}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Supporting features (badges) ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-3 mb-20"
        >
          {supportFeatures.map((f) => (
            <div
              key={f.title}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-surface-2/30 border ${f.border} group relative`}
              title={f.desc}
            >
              <f.icon className={`w-4 h-4 ${f.color} shrink-0`} />
              <span className="font-display font-600 text-xs text-white-text">{f.title}</span>
              <span className="text-[10px] text-slate-text/60">—</span>
              <span className={`font-mono font-bold text-xs ${f.color}`}>{f.stat}</span>
              <span className="text-[10px] text-slate-text">{f.statLabel}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Weather Data Section (educational) ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-10"
        >
          <div className="text-center mb-10">
            <h3 className="font-display font-700 text-2xl text-white-text mb-3">
              Clima en <span className="text-sky-accent">tiempo real</span>
            </h3>
            <p className="text-slate-text text-sm max-w-2xl mx-auto">
              Penon consulta datos meteorológicos actualizados cada hora —
              temperatura, humedad, viento y precipitación — directamente desde la API de Open-Meteo.
              Estos datos alimentan dos funciones clave:
            </p>
          </div>

          {/* Two uses of weather data */}
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-4">
            {/* Use 1: Wind on map */}
            <div className="relative p-5 rounded-xl bg-surface-2/30 border border-sky-accent/10 overflow-hidden">
              <WindParticles />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Wind className="w-5 h-5 text-sky-accent" />
                  <span className="font-mono text-[10px] text-sky-accent/60 tracking-widest uppercase">Uso 1</span>
                </div>
                <h4 className="font-display font-700 text-base mb-2">Predecir avance del fuego</h4>
                <p className="text-xs text-slate-text leading-relaxed">
                  Velocidad y dirección del viento animadas sobre el mapa.
                  Permite anticipar hacia dónde se propagaría un incendio antes de que avance.
                </p>
              </div>
            </div>

            {/* Use 2: FWI calculation */}
            <div className="relative p-5 rounded-xl bg-surface-2/30 border border-emerald-accent/10 overflow-hidden">
              <FwiCardPulse />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="w-5 h-5 text-emerald-accent" />
                  <span className="font-mono text-[10px] text-emerald-accent/60 tracking-widest uppercase">Uso 2</span>
                </div>
                <h4 className="font-display font-700 text-base mb-2">Calcular riesgo de incendio</h4>
                <p className="text-xs text-slate-text leading-relaxed">
                  Los 4 datos meteorológicos alimentan el índice FWI, un estándar canadiense
                  usado por Canadá, Australia y la Unión Europea para medir peligro de incendio forestal.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-text/40 font-mono">
            Fuente meteorológica: Open-Meteo API — datos actualizados cada hora
          </p>
        </motion.div>

        {/* ── FWI Risk Panel ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="font-display font-700 text-2xl text-white-text mb-2">
              Índice de Riesgo <span className="text-emerald-accent">FWI</span>
            </h3>
            <p className="text-slate-text text-sm max-w-xl mx-auto">
              El Fire Weather Index combina temperatura, humedad, viento y lluvia
              en un solo número que indica qué tan peligrosas son las condiciones para un incendio.
            </p>
          </div>

          <FwiRiskPanel />
        </motion.div>

        {/* ── FWI: How it works (educational) ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* Intro: Global standard */}
          <div className="text-center mb-10">
            <h3 className="font-display font-700 text-xl text-white-text mb-3">
              ¿Cómo se calcula?
            </h3>
            <p className="text-slate-text text-sm max-w-2xl mx-auto mb-6">
              El FWI fue desarrollado en 1970 por el Canadian Forest Service (Natural Resources Canada)
              y hoy es el estándar más adoptado a nivel mundial para medir peligro de incendio forestal.
            </p>

            {/* Countries that use it */}
            <div className="max-w-3xl mx-auto mb-10">
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { flag: '🇨🇦', name: 'Canadá', note: 'origen' },
                  { flag: '🇪🇺', name: 'Unión Europea', note: 'EFFIS' },
                  { flag: '🇦🇺', name: 'Australia' },
                  { flag: '🇦🇷', name: 'Argentina', note: 'SNMF' },
                  { flag: '🇺🇸', name: 'EE.UU.' },
                  { flag: '🇨🇱', name: 'Chile' },
                  { flag: '🇿🇦', name: 'Sudáfrica' },
                  { flag: '🇬🇧', name: 'Reino Unido' },
                  { flag: '🇳🇿', name: 'Nueva Zelanda' },
                  { flag: '🇮🇩', name: 'Indonesia' },
                  { flag: '🇧🇷', name: 'Brasil' },
                  { flag: '🇲🇽', name: 'México' },
                ].map((c) => (
                  <span
                    key={c.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2/40 border border-white/[0.04] text-[11px]"
                  >
                    <span>{c.flag}</span>
                    <span className="text-slate-text">{c.name}</span>
                    {c.note && <span className="text-[9px] text-emerald-accent/60">({c.note})</span>}
                  </span>
                ))}
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-2/40 border border-white/[0.04] text-[11px] text-slate-text/50">
                  +30 países
                </span>
              </div>
              <p className="text-[10px] text-slate-text/40 font-mono mt-3">
                Recomendado por FAO y WMO como estándar global
              </p>
            </div>
          </div>

          {/* Formula cards */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4 mb-10">
            {/* Step 1: Moisture Codes */}
            <div className="p-5 rounded-xl bg-surface-2/30 border border-white/[0.04]">
              <span className="font-mono text-[10px] text-slate-text/50 tracking-widest uppercase">Paso 1</span>
              <h4 className="font-display font-700 text-sm mt-1 mb-3">Códigos de humedad</h4>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-sky-accent font-bold">FFMC</span>
                  <span className="text-slate-text/40">=</span>
                  <span className="text-slate-text">f(T, H, V, P)</span>
                </div>
                <p className="text-[10px] text-slate-text/50 pl-0">Superficie: hojarasca y ramas finas</p>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-accent font-bold">DMC</span>
                  <span className="text-slate-text/40">=</span>
                  <span className="text-slate-text">f(T, H, P)</span>
                </div>
                <p className="text-[10px] text-slate-text/50 pl-0">Media: materia orgánica 5-10cm</p>
                <div className="flex items-center gap-2">
                  <span className="text-violet-accent font-bold">DC</span>
                  <span className="text-slate-text/40">=</span>
                  <span className="text-slate-text">f(T, P)</span>
                </div>
                <p className="text-[10px] text-slate-text/50 pl-0">Profunda: sequía del suelo 10-20cm</p>
              </div>
            </div>

            {/* Step 2: Behavior Indices */}
            <div className="p-5 rounded-xl bg-surface-2/30 border border-white/[0.04]">
              <span className="font-mono text-[10px] text-slate-text/50 tracking-widest uppercase">Paso 2</span>
              <h4 className="font-display font-700 text-sm mt-1 mb-3">Índices de comportamiento</h4>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-sky-accent font-bold">ISI</span>
                  <span className="text-slate-text/40">=</span>
                  <span className="text-slate-text">f(FFMC, Viento)</span>
                </div>
                <p className="text-[10px] text-slate-text/50 pl-0">Velocidad esperada de propagación</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-emerald-accent font-bold">BUI</span>
                  <span className="text-slate-text/40">=</span>
                  <span className="text-slate-text">f(DMC, DC)</span>
                </div>
                <p className="text-[10px] text-slate-text/50 pl-0">Combustible total disponible</p>
              </div>
            </div>

            {/* Step 3: Final FWI */}
            <div className="p-5 rounded-xl bg-emerald-accent/[0.04] border border-emerald-accent/10">
              <span className="font-mono text-[10px] text-emerald-accent/50 tracking-widest uppercase">Resultado</span>
              <h4 className="font-display font-700 text-sm mt-1 mb-3">Índice final</h4>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-accent font-bold text-base">FWI</span>
                  <span className="text-slate-text/40">=</span>
                  <span className="text-slate-text">f(ISI, BUI)</span>
                </div>
                <p className="text-[10px] text-slate-text/50 pl-0">
                  Combina velocidad de propagación con
                  cantidad de combustible. Un solo número
                  que representa la intensidad potencial del fuego.
                </p>
              </div>
            </div>
          </div>

          {/* Diagram */}
          <FwiDiagram inView={inView} />
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="text-[10px] text-slate-text/40 font-mono">
              Modelo: Natural Resources Canada (Van Wagner, 1987)
            </span>
            <span className="text-[10px] text-slate-text/20">|</span>
            <span className="text-[10px] text-slate-text/40 font-mono">
              Datos meteorológicos: Open-Meteo API
            </span>
          </div>
        </motion.div>
      </div>

      {/* Subtle aurora bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-accent/20 to-transparent" />
    </section>
  )
}

/** Mini wind particle field for the Viento card */
function WindParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    y: 15 + (i % 4) * 22,
    delay: i * 0.3,
    duration: 2 + Math.random() * 1.5,
    opacity: 0.08 + Math.random() * 0.12,
    width: 20 + Math.random() * 30,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute h-px bg-gradient-to-r from-transparent via-sky-accent to-transparent rounded-full"
          style={{
            top: `${p.y}%`,
            width: `${p.width}%`,
            opacity: p.opacity,
          }}
          animate={{ left: ['-20%', '120%'] }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

/** FWI risk level bar for the Índice FWI card */
function FwiRiskBar() {
  const levels = [
    { color: '#22C55E', label: 'Bajo' },
    { color: '#84CC16', label: 'Mod.' },
    { color: '#EAB308', label: 'Alto' },
    { color: '#F97316', label: 'Muy alto' },
    { color: '#EF4444', label: 'Extremo' },
  ]

  return (
    <div className="absolute bottom-2 left-4 right-4 pointer-events-none">
      <div className="flex rounded-full overflow-hidden h-2">
        {levels.map((l) => (
          <div key={l.label} className="flex-1" style={{ backgroundColor: l.color, opacity: 0.7 }} />
        ))}
      </div>
      <div className="flex justify-between mt-1">
        {levels.map((l) => (
          <span key={l.label} className="text-[6px] text-slate-text/60 font-mono" style={{ color: `${l.color}99` }}>
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/** FWI instrumental risk panel — the protagonist */
function FwiRiskPanel() {
  const exampleFwi = 18.3
  const levels = [
    { min: 0, max: 5.2, label: 'Bajo', color: '#22C55E', desc: 'Riesgo mínimo de ignición' },
    { min: 5.2, max: 11.2, label: 'Moderado', color: '#84CC16', desc: 'Focos controlables' },
    { min: 11.2, max: 21.3, label: 'Alto', color: '#EAB308', desc: 'Propagación probable' },
    { min: 21.3, max: 38, label: 'Muy Alto', color: '#F97316', desc: 'Propagación rápida' },
    { min: 38, max: 60, label: 'Extremo', color: '#EF4444', desc: 'Fuera de control' },
  ]

  const activeLevel = levels.find((l) => exampleFwi >= l.min && exampleFwi <= l.max) || levels[2]
  const totalRange = 60
  const indicatorPos = Math.min((exampleFwi / totalRange) * 100, 100)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="rounded-2xl bg-surface-2/40 border border-white/[0.06] p-6 md:p-8">
        {/* Top: Value */}
        <div className="flex items-baseline gap-3 mb-8">
          <span
            className="font-mono font-bold text-5xl md:text-6xl"
            style={{
              color: activeLevel.color,
              textShadow: `0 0 30px ${activeLevel.color}44, 0 0 60px ${activeLevel.color}22`,
            }}
          >
            {exampleFwi}
          </span>
          <div className="flex flex-col">
            <span className="font-display font-700 text-lg" style={{ color: activeLevel.color }}>
              {activeLevel.label}
            </span>
            <span className="text-xs text-slate-text">{activeLevel.desc}</span>
          </div>
        </div>

        {/* Risk bar with indicator */}
        <div className="relative mb-6">
          {/* Indicator arrow */}
          <div
            className="absolute -top-6 z-10 flex flex-col items-center"
            style={{ left: `${indicatorPos}%`, transform: 'translateX(-50%)' }}
          >
            <span className="font-mono text-xs font-bold" style={{ color: activeLevel.color }}>
              {exampleFwi}
            </span>
            <svg width="12" height="8" viewBox="0 0 12 8" className="mt-0.5">
              <path d="M6 8L0 0h12z" fill={activeLevel.color} />
            </svg>
          </div>

          {/* Bar — thicker */}
          <div className="flex rounded-full overflow-hidden h-4">
            {levels.map((l) => (
              <div
                key={l.label}
                className="flex-1"
                style={{ backgroundColor: l.color, opacity: 0.8 }}
              />
            ))}
          </div>

          {/* Labels below bar */}
          <div className="flex mt-2.5">
            {levels.map((l) => (
              <div key={l.label} className="flex-1 text-center min-w-0">
                <span
                  className="text-[8px] sm:text-[10px] font-mono font-semibold block truncate"
                  style={{ color: exampleFwi >= l.min && exampleFwi <= l.max ? l.color : `${l.color}66` }}
                >
                  {l.label}
                </span>
                <span className="text-[7px] sm:text-[8px] text-slate-text/40 font-mono">
                  {l.min}–{l.max === 50 ? '50+' : l.max}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data sources */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-void/40 border border-white/[0.04]">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-accent" />
            <span className="text-[10px] text-slate-text font-mono">
              Meteorología: <span className="text-sky-accent">Open-Meteo API</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-void/40 border border-white/[0.04]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-accent" />
            <span className="text-[10px] text-slate-text font-mono">
              Modelo: <span className="text-emerald-accent">Canadian FWI System (NRCan)</span>
            </span>
          </div>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-text/30 font-mono mt-3">
        Dato simulado con fines ilustrativos
      </p>
    </div>
  )
}

/** Subtle pulse glow for the FWI card */
function FwiCardPulse() {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 30%, rgba(16,185,129,0.06) 0%, transparent 70%)' }}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    />
  )
}

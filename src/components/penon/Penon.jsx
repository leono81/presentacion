import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { fadeInUp } from '../../lib/animations'
import FwiDiagram from './FwiDiagram'
import Capas from './Capas'
import Rayos from './Rayos'
import { Wind, Gauge } from 'lucide-react'

export default function Penon() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="penon" className="relative py-24 md:py-32 bg-surface overflow-clip">
      {/* Subtle aurora top edge */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-accent/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
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
            FIRMS entrega datos crudos. Penon los cruza con lo que se sabe del territorio
            para que cada foco llegue con su contexto.
          </motion.p>
        </div>

        {/* ── Weather Data Section (educational) ── */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-10"
        >
          <div className="text-center mb-10">
            <h3 className="font-display font-700 text-2xl text-white-text mb-3">
              Viento y <span className="text-sky-accent">peligro de incendio</span>
            </h3>
            <p className="text-slate-text text-sm max-w-2xl mx-auto">
              Los avisos meteorológicos son los oficiales del Servicio Meteorológico Nacional, y el índice
              de peligro FWI se calcula con las observaciones del SMN en Río Grande y Ushuaia y con la carga
              de la brigada en Tolhuin. El viento y la temperatura del mapa vienen de un modelo (Open-Meteo),
              y el mapa lo rotula como modelo.
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
                  <span className="px-2 py-0.5 rounded-full border border-dashed border-ember/40 bg-ember/[0.06] font-mono text-[9px] text-ember tracking-widest uppercase">En desarrollo</span>
                </div>
                <h4 className="font-display font-700 text-base mb-2">Predecir avance del fuego</h4>
                <p className="text-xs text-slate-text leading-relaxed">
                  Hoy el viento ya se ve animado sobre el mapa, con su velocidad y dirección. Sobre esa base
                  estamos desarrollando la proyección de hacia dónde se propagaría un incendio.
                </p>
              </div>
            </div>

            {/* Use 2: FWI calculation */}
            <div className="relative p-5 rounded-xl bg-surface-2/30 border border-emerald-accent/10 overflow-hidden">
              <FwiCardPulse />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Gauge className="w-5 h-5 text-emerald-accent" />
                  <span className="px-2 py-0.5 rounded-full border border-emerald-accent/30 bg-emerald-accent/[0.06] font-mono text-[9px] text-emerald-accent tracking-widest uppercase">En producción</span>
                </div>
                <h4 className="font-display font-700 text-base mb-2">Calcular riesgo de incendio</h4>
                <p className="text-xs text-slate-text leading-relaxed">
                  El índice FWI se calcula en tres zonas de la provincia: con la observación de las 12:00 del SMN
                  en Río Grande y Ushuaia, y con la que carga la brigada en Tolhuin. Es el estándar canadiense que usan Canadá, Australia
                  y la Unión Europea para medir el peligro de incendio forestal.
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-[10px] text-slate-text/40 font-mono">
            Avisos y observaciones: SMN · Viento y temperatura: Open-Meteo (modelo)
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
              Observaciones: Servicio Meteorológico Nacional
            </span>
          </div>
        </motion.div>

        {/* ── Rayos: de dónde salen, cómo se procesan, cómo se muestran ── */}
        <Rayos />

        {/* ── Todas las capas, al mismo tiempo ── */}
        <Capas />
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
              Observaciones: <span className="text-sky-accent">SMN</span>
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

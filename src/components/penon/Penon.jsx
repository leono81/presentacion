import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { fadeInUp } from '../../lib/animations'
import Embudo from './Embudo'
import Memoria from './Memoria'
import Capas from './Capas'
import Rayos from './Rayos'
import Brigadistas from './Brigadistas'
import { Wind, Gauge, CloudSun } from 'lucide-react'

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

        {/* ── El embudo: los focos del planeta caen sobre la isla y se suma lo local ── */}
        <div className="mb-20 md:mb-24">
          <Embudo />
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
              Pronóstico, viento y <span className="text-sky-accent">peligro de incendio</span>
            </h3>
            <p className="text-slate-text text-sm max-w-2xl mx-auto">
              El pronóstico oficial llega del Servicio Meteorológico Nacional, con sus avisos. El índice de
              peligro FWI se calcula con las observaciones del SMN en Río Grande y Ushuaia y con la carga de la
              brigada en Tolhuin. El viento y la temperatura del mapa vienen de un modelo (Open-Meteo), y el
              mapa lo rotula como modelo.
            </p>
          </div>

          {/* Pronóstico del SMN, FWI y avance del fuego */}
          <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto mb-4">
            {/* Pronóstico oficial del SMN */}
            <div className="relative p-5 rounded-xl bg-surface-2/30 border border-sky-accent/10 overflow-hidden">
              <FwiCardPulse color="56,189,248" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <CloudSun className="w-5 h-5 text-sky-accent" />
                  <span className="px-2 py-0.5 rounded-full border border-emerald-accent/30 bg-emerald-accent/[0.06] font-mono text-[9px] text-emerald-accent tracking-widest uppercase">En producción</span>
                </div>
                <h4 className="font-display font-700 text-base mb-2">Pronóstico del SMN</h4>
                <p className="text-xs text-slate-text leading-relaxed">
                  Los avisos meteorológicos oficiales del Servicio Meteorológico Nacional se ven en el mapa,
                  rotulados «Pronóstico del SMN», y salen por Telegram. Penon los revisa cada 15 minutos.
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

          </div>

          <p className="text-center text-[10px] text-slate-text/40 font-mono">
            Pronóstico, avisos y observaciones: SMN · Viento y temperatura: Open-Meteo (modelo)
          </p>
        </motion.div>

        {/* ── La memoria del monte: cómo se calcula el FWI, con los datos reales de Río Grande 2022 ── */}
        <Memoria />

        {/* ── Rayos: de dónde salen, cómo se procesan, cómo se muestran ── */}
        <Rayos />

        {/* ── Todas las capas, al mismo tiempo ── */}
        <Capas />

        {/* ── Lo que viene: brigadistas en el mapa con Meshtastic ── */}
        <Brigadistas />
      </div>

      {/* Subtle aurora bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-accent/20 to-transparent" />
    </section>
  )
}

/** Mini wind particle field for the Viento card */
// fijas (no Math.random en cada render) y con transform en vez de `left`: `left` obliga a recalcular el
// layout en cada cuadro, y estas animaciones no paran nunca
const PARTICULAS = Array.from({ length: 12 }, (_, i) => {
  const r = (k) => ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1 + 1) % 1
  const width = 20 + r(1) * 30
  return {
    y: 15 + (i % 4) * 22,
    delay: i * 0.3,
    duration: 2 + r(2) * 1.5,
    opacity: 0.08 + r(3) * 0.12,
    width,
    // de -20 % a 120 % del ancho de la tarjeta, en % del ancho propio (lo que mide translateX)
    x: [`${(-20 / width) * 100}%`, `${(120 / width) * 100}%`],
  }
})

function WindParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICULAS.map((p, i) => (
        <motion.div
          key={i}
          className="absolute left-0 h-px bg-gradient-to-r from-transparent via-sky-accent to-transparent rounded-full"
          style={{
            top: `${p.y}%`,
            width: `${p.width}%`,
            opacity: p.opacity,
          }}
          animate={{ x: p.x }}
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

/** Subtle pulse glow for the FWI card */
function FwiCardPulse({ color = '16,185,129' }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-xl pointer-events-none"
      style={{ background: `radial-gradient(circle at 50% 30%, rgba(${color},0.06) 0%, transparent 70%)` }}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    />
  )
}

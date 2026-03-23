import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { fadeInUp } from '../../lib/animations'
import SectionTag from '../ui/SectionTag'
import { MapPin, Navigation, Send, Clock, Flame } from 'lucide-react'

export default function Alertas() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })
  const [step, setStep] = useState(0) // 0: telegram, 1: transition, 2: map route

  useEffect(() => {
    if (!inView) return
    const timers = [
      setTimeout(() => setStep(1), 2500),
      setTimeout(() => setStep(2), 3500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [inView])

  return (
    <section className="relative py-24 md:py-32 bg-void overflow-hidden">
      <div className="max-w-5xl mx-auto px-6" ref={ref}>
        <div className="text-center mb-12">
          <SectionTag>Respuesta inmediata</SectionTag>
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4"
          >
            Del satélite al{' '}
            <span className="text-sky-accent">celular</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-slate-text text-base max-w-2xl mx-auto"
          >
            Penon detecta un foco, envía la alerta por Telegram con la ubicación exacta,
            y el operador puede navegar directo al foco con la ruta más rápida.
          </motion.p>
        </div>

        {/* Two-panel flow */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Panel 1: Telegram */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-sky-accent/10 flex items-center justify-center text-[10px] font-mono font-bold text-sky-accent">1</span>
                <span className="text-xs font-mono text-slate-text/60 tracking-widest uppercase">Alerta llega al celular</span>
              </div>
              <TelegramMockup highlighted={step >= 1} />
            </div>

            {/* Panel 2: Google Maps route */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-accent/10 flex items-center justify-center text-[10px] font-mono font-bold text-emerald-accent">2</span>
                <span className="text-xs font-mono text-slate-text/60 tracking-widest uppercase">Ruta directa al foco</span>
              </div>
              <MapRouteMockup active={step >= 2} />
            </div>
          </div>

          {/* Timeline footer */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mt-10">
            <TimelineStep icon={Flame} label="Satélite detecta" color="text-red-400" delay={0} inView={inView} />
            <div className="w-6 sm:w-12 h-px bg-gradient-to-r from-red-400/40 to-sky-accent/40" />
            <TimelineStep icon={Send} label="Telegram alerta" color="text-sky-accent" delay={0.3} inView={inView} />
            <div className="w-6 sm:w-12 h-px bg-gradient-to-r from-sky-accent/40 to-emerald-accent/40" />
            <TimelineStep icon={Navigation} label="Ruta al foco" color="text-emerald-accent" delay={0.6} inView={inView} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TimelineStep({ icon: Icon, label, color, delay, inView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 1 + delay }}
      className="flex flex-col items-center gap-1.5"
    >
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-[10px] text-slate-text/60 font-mono">{label}</span>
    </motion.div>
  )
}

function TelegramMockup({ highlighted }) {
  return (
    <div className={`rounded-2xl bg-[#1B2836] border overflow-hidden shadow-2xl flex-1 transition-all duration-500 ${highlighted ? 'border-sky-accent/30' : 'border-white/[0.06]'}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-[#17212B] flex items-center gap-3 border-b border-white/[0.04]">
        <div className="w-8 h-8 rounded-full bg-emerald-accent/20 flex items-center justify-center">
          <Send className="w-4 h-4 text-emerald-accent" />
        </div>
        <div>
          <span className="text-sm font-semibold text-white-text">Penon Monitor</span>
          <span className="text-[10px] text-sky-accent ml-2">bot</span>
        </div>
      </div>

      {/* Message */}
      <div className="p-4">
        <div className="bg-[#2B5278] rounded-xl rounded-tl-sm p-4">
          <p className="text-[13px] text-white leading-relaxed mb-3">
            <span className="text-red-400 font-bold">ALERTA DE INCENDIO</span>
            <br /><br />
            <span className="text-white/80">Foco detectado por satélite VIIRS</span>
            <br />
            <span className="text-white/80">Confianza: </span>
            <span className="text-emerald-accent font-semibold">Alta</span>
            <br />
            <span className="text-white/80">FWI: </span>
            <span className="text-yellow-400 font-semibold">18.3 (Alto)</span>
            <br /><br />
            <span className="flex items-center gap-1.5 text-white/80">
              <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
              -54.3456, -68.7821
            </span>
          </p>

          {/* Google Maps link — highlighted when transitioning */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-500 ${highlighted ? 'bg-sky-accent/20 ring-1 ring-sky-accent/40' : 'bg-white/10'}`}>
            <Navigation className="w-4 h-4 text-sky-accent" />
            <span className="text-[12px] text-sky-accent font-medium">Abrir ruta en Google Maps</span>
          </div>

          <span className="block text-right text-[10px] text-white/30 mt-2">14:23</span>
        </div>
      </div>
    </div>
  )
}

function MapRouteMockup({ active }) {
  return (
    <div className={`rounded-2xl overflow-hidden shadow-2xl flex-1 transition-all duration-500 ${active ? 'border border-emerald-accent/20' : 'border border-white/[0.06]'}`}>
      {/* Map area */}
      <div className="relative bg-[#1a1a2e] h-full min-h-[340px]">
        {/* Grid background simulating map */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
        }} />

        {/* Road lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 340">
          {/* Background roads */}
          <path d="M 50 300 L 150 250 L 200 180 L 350 160" stroke="rgba(148,163,184,0.15)" strokeWidth="3" fill="none" />
          <path d="M 30 200 L 120 190 L 200 180" stroke="rgba(148,163,184,0.15)" strokeWidth="2" fill="none" />
          <path d="M 200 340 L 200 180 L 200 50" stroke="rgba(148,163,184,0.15)" strokeWidth="2" fill="none" />

          {/* Route line — animated */}
          {active && (
            <motion.path
              d="M 80 290 L 150 250 L 200 180 L 280 120 L 310 80"
              stroke="#38BDF8"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 2, ease: 'easeInOut' }}
            />
          )}

          {/* Start marker (blue dot — current position) */}
          {active && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <circle cx="80" cy="290" r="8" fill="#38BDF8" opacity="0.2" />
              <circle cx="80" cy="290" r="5" fill="#38BDF8" />
              <circle cx="80" cy="290" r="2" fill="white" />
            </motion.g>
          )}

          {/* End marker (fire — red pulsing) */}
          {active && (
            <motion.g
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8 }}
            >
              <motion.circle
                cx="310" cy="80" r="16"
                fill="rgba(239,68,68,0.15)"
                animate={{ r: [16, 24, 16], opacity: [0.3, 0.1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <circle cx="310" cy="80" r="8" fill="rgba(239,68,68,0.3)" />
              <circle cx="310" cy="80" r="4" fill="#EF4444" />
            </motion.g>
          )}
        </svg>

        {/* ETA card — appears after route draws */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="bg-[#1B2836]/95 backdrop-blur-sm rounded-xl border border-white/[0.08] p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-sky-accent" />
                    <span className="text-sm font-semibold text-white-text">Ruta más rápida</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-accent bg-emerald-accent/10 px-2 py-0.5 rounded-full">EN CAMINO</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-accent" />
                    <span className="font-mono font-bold text-lg text-white-text">23 min</span>
                  </div>
                  <div className="text-xs text-slate-text">
                    <span className="font-mono">18.4 km</span> — Ruta 3 → RP-B
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Placeholder text when not active */}
        {!active && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Navigation className="w-8 h-8 text-slate-text/20 mx-auto mb-2" />
              <span className="text-xs text-slate-text/30 font-mono">Google Maps</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { lazy, Suspense, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../../lib/animations'
import { ArrowRight } from 'lucide-react'

const Globe = lazy(() => import('./Globe'))

function GlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-48 h-48 rounded-full bg-surface border border-emerald-accent/20 animate-pulse" />
    </div>
  )
}

/** Reloj UTC en vivo — refuerza la sensación de consola operativa */
function UtcClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const hh = String(now.getUTCHours()).padStart(2, '0')
  const mm = String(now.getUTCMinutes()).padStart(2, '0')
  const ss = String(now.getUTCSeconds()).padStart(2, '0')
  return <span className="tabular-nums">{hh}:{mm}:{ss} UTC</span>
}

const heroStats = [
  { value: '375 m', label: 'resolución VIIRS' },
  { value: '+10/día', label: 'pasadas sobre TdF' },
  { value: '$0', label: 'costo provincial' },
]

export default function Hero() {
  return (
    <section className="relative h-[100dvh] flex flex-col overflow-x-clip grain">
      {/* Starfield + aurora background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(16,185,129,0.10)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_0%,rgba(56,189,248,0.07)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_30%,rgba(139,92,246,0.05)_0%,transparent_60%)]" />
      </div>

      {/* Aurora bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-accent to-transparent opacity-30 z-20" />

      {/* Telemetry strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="relative z-10 shrink-0 pt-16 px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-3 sm:gap-6 font-mono text-[9px] sm:text-[10px] text-slate-text/60 tracking-widest uppercase">
          <span className="hidden sm:inline">54°48′S · 68°18′O</span>
          <span className="hidden sm:inline text-slate-text/20">|</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent telemetry-blink" />
            <span className="text-emerald-accent/90">Sistema activo</span>
          </span>
          <span className="text-slate-text/20">|</span>
          <UtcClock />
        </div>
      </motion.div>

      {/* Text — fixed height, doesn't grow */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center pt-5 pb-2 px-6 shrink-0"
      >
        <motion.h1
          variants={fadeInUp}
          className="font-display font-800 text-4xl sm:text-5xl lg:text-6xl leading-[1.02] tracking-tight mb-4"
        >
          Los <span className="text-emerald-accent">bosques</span> del fin del mundo,
          <br className="hidden sm:block" />
          {' '}vigilados desde <span className="text-sky-accent">órbita</span>
        </motion.h1>

        <motion.p variants={fadeInUp} className="text-slate-text text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-5">
          Detección de incendios en tiempo casi real para{' '}
          <span className="text-white-text font-medium">Tierra del Fuego, Malvinas e Islas del Atlántico Sur</span>,
          con datos de la NASA e inteligencia local.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-center gap-3 mb-4">
          <a
            href="https://penon.howenh-labs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-accent text-void font-display font-700 text-sm rounded-xl hover:bg-emerald-accent/90 transition-[background-color,transform] duration-150 active:scale-[0.98] shadow-[0_0_30px_rgba(16,185,129,0.25)]"
          >
            Ver sistema en vivo
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#firms"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/10 text-slate-text font-display font-600 text-sm rounded-xl hover:border-sky-accent/40 hover:text-white-text transition-[border-color,color,transform] duration-150 active:scale-[0.98]"
          >
            Cómo funciona
          </a>
        </motion.div>

        {/* Compact stats */}
        <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4 sm:gap-8">
          {heroStats.map((s, i) => (
            <div key={s.label} className="flex items-center gap-4 sm:gap-8">
              {i > 0 && <span className="w-px h-6 bg-white/10" />}
              <div className="text-center">
                <div className="font-mono font-bold text-sm sm:text-base text-white-text">{s.value}</div>
                <div className="font-mono text-[8px] sm:text-[9px] text-slate-text/50 uppercase tracking-wider">{s.label}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Globe — takes ALL remaining space */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        className="relative z-10 flex-1 w-full min-h-0"
      >
        <Suspense fallback={<GlobeFallback />}>
          <Globe />
        </Suspense>
      </motion.div>

      {/* Scroll hint — fixed at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="relative z-10 shrink-0 py-3 flex flex-col items-center gap-1 text-slate-text"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 6l4 4 4-4" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

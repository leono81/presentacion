import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '../../lib/animations'

const Globe = lazy(() => import('./Globe'))

function GlobeFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-48 h-48 rounded-full bg-surface border border-emerald-accent/20 animate-pulse" />
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative h-screen flex flex-col overflow-x-clip">
      {/* Aurora background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_100%,rgba(16,185,129,0.08)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_30%_0%,rgba(56,189,248,0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_30%,rgba(139,92,246,0.04)_0%,transparent_60%)]" />
      </div>

      {/* Aurora bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-accent to-transparent opacity-30 z-20" />

      {/* Text — fixed height, doesn't grow */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 text-center pt-20 pb-2 px-6 shrink-0"
      >
        <motion.h1
          variants={fadeInUp}
          className="font-display font-800 text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-4"
        >
          Vigilancia satelital{' '}
          <br className="hidden sm:block" />
          para los{' '}
          <span className="text-emerald-accent">bosques</span>
          {' '}del{' '}
          <span className="text-sky-accent">fin del mundo</span>
        </motion.h1>

        <motion.p variants={fadeInUp} className="text-slate-text text-lg leading-relaxed max-w-2xl mx-auto">
          Monitoreo inteligente de incendios forestales en Tierra del Fuego.
          Datos de la NASA procesados con filtros únicos para el territorio.
        </motion.p>
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

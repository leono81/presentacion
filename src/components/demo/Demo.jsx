import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { fadeInUp } from '../../lib/animations'
import SectionTag from '../ui/SectionTag'

export default function Demo() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  return (
    <section id="demo" className="relative py-24 md:py-32 bg-void">
      <div className="max-w-6xl mx-auto px-6" ref={ref}>
        <div className="text-center mb-12">
          <SectionTag>Demo en Vivo</SectionTag>
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4"
          >
            Funcionando{' '}
            <span className="text-emerald-accent">ahora mismo</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-slate-text text-lg"
          >
            Los datos que ves son de hoy. El sistema está activo en este momento.
          </motion.p>
        </div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        >
          {/* Browser frame */}
          <div className="rounded-2xl overflow-hidden border border-emerald-accent/20 shadow-[0_0_60px_rgba(16,185,129,0.08),0_40px_120px_rgba(0,0,0,0.5)]">
            {/* Browser bar */}
            <div className="bg-surface-2 px-4 py-3 flex items-center gap-3 border-b border-white/5">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-accent/60" />
              </div>
              <div className="flex-1 ml-3 px-4 py-1.5 bg-void/50 rounded-md">
                <span className="text-slate-text/60 text-xs font-mono">penon.howenh-labs.com</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
                <span className="text-emerald-accent text-[10px] font-mono">LIVE</span>
              </div>
            </div>

            {/* iframe or fallback */}
            <div className="relative bg-void" style={{ height: 'clamp(400px, 50vw, 650px)' }}>
              {!iframeError ? (
                <>
                  {/* Loading skeleton */}
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-void">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-2 border-emerald-accent/30 border-t-emerald-accent rounded-full animate-spin" />
                        <span className="text-slate-text text-sm">Cargando sistema...</span>
                      </div>
                    </div>
                  )}
                  <iframe
                    src="https://penon.howenh-labs.com/"
                    title="Penon Monitor — Demo en vivo"
                    className="w-full h-full border-0"
                    onLoad={() => setIframeLoaded(true)}
                    onError={() => setIframeError(true)}
                    loading="lazy"
                  />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-void">
                  <div className="text-center">
                    <p className="text-slate-text mb-4">El sistema está actualizándose</p>
                    <a
                      href="https://penon.howenh-labs.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-accent text-white font-semibold rounded-lg"
                    >
                      Abrir Penon Monitor
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

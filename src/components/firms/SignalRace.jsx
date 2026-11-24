import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { MapPin, Send } from 'lucide-react'

/*
 * El camino de la señal: el pipeline estampa cada etapa y termina en la alerta de Telegram.
 * Para NOAA-20/21 Penon no espera a FIRMS: lee el bucket público de NOAA. Tiempos según la
 * sesión de penonInsight (24/11/2026): NOAA publica entre 15 y 44 min después de la pasada
 * (medido en 14 gránulos); la demora de punta a punta no está medida y no se publica.
 */

const NODES = [
  { name: 'Detección en órbita', sub: 'VIIRS · NOAA-20 y NOAA-21', stamp: 'pasada', color: '#38BDF8' },
  { name: 'Bucket público de NOAA', sub: 'publica minutos después de la pasada', stamp: '15–44 min · medido', color: '#8B5CF6' },
  { name: 'Penon Monitor', sub: 'lo revisa cada 10 min · rótulos + FWI', stamp: 'cada 10 min', color: '#10B981' },
]

const STEP_MS = 1700
const PAUSE_MS = 4000

export default function SignalRace() {
  const [ref, inView] = useInView({ threshold: 0.3 })
  const [phase, setPhase] = useState(-1) // -1 reposo · 0..2 nodos · 3 telegram · 4 pausa

  // Avance de fases — si sale de vista se pausa donde está
  useEffect(() => {
    if (!inView) return
    if (phase === -1) {
      const t = setTimeout(() => setPhase(0), 400)
      return () => clearTimeout(t)
    }
    const t = setTimeout(
      () => setPhase((p) => (p >= 4 ? 0 : p + 1)),
      phase === 4 ? PAUSE_MS : STEP_MS
    )
    return () => clearTimeout(t)
  }, [phase, inView])

  const showTelegram = phase >= 3

  return (
    <div ref={ref} className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-mono text-[10px] text-slate-text/50 uppercase tracking-widest">El camino del dato</span>
        <span className="font-mono text-[10px] text-emerald-accent/80 uppercase tracking-widest">Directo de NOAA</span>
      </div>

      <div className="relative">
        <div className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-sky-accent/30 via-violet-accent/20 to-fire/30" />

        <div className="space-y-3">
          {NODES.map((n, i) => {
            const active = phase >= i
            const isCurrent = phase === i
            return (
              <div key={n.name} className="relative flex items-center gap-4">
                <div
                  className="relative z-10 w-[27px] h-[27px] rounded-full border-2 flex items-center justify-center shrink-0 bg-void transition-colors duration-300"
                  style={{ borderColor: active ? n.color : `${n.color}33` }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: active ? n.color : `${n.color}44` }}
                    animate={isCurrent ? { scale: [1, 1.5, 1] } : {}}
                    transition={{ repeat: isCurrent ? Infinity : 0, duration: 1 }}
                  />
                </div>
                <div
                  className="flex-1 p-3 rounded-xl border transition-all duration-300"
                  style={{
                    backgroundColor: active ? 'rgba(19,28,46,0.5)' : 'rgba(19,28,46,0.2)',
                    borderColor: active ? `${n.color}33` : 'rgba(255,255,255,0.04)',
                    opacity: active ? 1 : 0.45,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-display font-700 text-xs text-white-text">{n.name}</span>
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                          style={{ color: n.color, backgroundColor: `${n.color}14`, border: `1px solid ${n.color}33` }}
                        >
                          {n.stamp}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <span className="font-mono text-[9px] text-slate-text/50">{n.sub}</span>
                </div>
              </div>
            )
          })}

          {/* Telegram al final */}
          <div className="relative flex items-start gap-4 min-h-[96px]">
            <div
              className="relative z-10 w-[27px] h-[27px] rounded-full border-2 flex items-center justify-center shrink-0 bg-void transition-colors duration-300"
              style={{ borderColor: showTelegram ? '#EF4444' : '#EF444433' }}
            >
              {showTelegram && (
                <motion.div
                  className="absolute inset-0 rounded-full border border-fire/60"
                  animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                />
              )}
              <Send className="w-3 h-3" style={{ color: showTelegram ? '#EF4444' : '#EF444466' }} />
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                {showTelegram ? (
                  <motion.div
                    key="msg"
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                    className="rounded-xl bg-[#1B2836] border border-sky-accent/25 overflow-hidden shadow-xl"
                  >
                    <div className="px-3 py-1.5 bg-[#17212B] flex items-center gap-2 border-b border-white/[0.04]">
                      <div className="w-4 h-4 rounded-full bg-emerald-accent/20 flex items-center justify-center">
                        <Send className="w-2 h-2 text-emerald-accent" />
                      </div>
                      <span className="text-[10px] font-semibold text-white-text">Penon Monitor</span>
                      <span className="text-[8px] text-sky-accent">bot</span>
                      <span className="ml-auto text-[8px] text-white/30">ahora</span>
                    </div>
                    <div className="p-2.5">
                      <div className="bg-[#2B5278] rounded-lg rounded-tl-sm p-2.5 text-[10px] leading-relaxed">
                        <span className="text-red-400 font-bold">ALERTA DE INCENDIO</span>
                        <br />
                        <span className="text-white/80">VIIRS · Confianza: </span>
                        <span className="text-emerald-accent font-semibold">Alta</span>
                        <br />
                        <span className="flex items-center gap-1 text-white/80 mt-0.5">
                          <MapPin className="w-2.5 h-2.5 text-red-400 shrink-0" />
                          -54.345, -67.721 · abrir ruta
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="wait"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-surface-2/20 border border-white/[0.04]"
                  >
                    <span className="font-display font-700 text-xs text-slate-text/60">Alerta en el celular</span>
                    <br />
                    <span className="font-mono text-[9px] text-slate-text/40">Telegram · coordenadas + ruta</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-amber-400/20 bg-amber-400/[0.03]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 shrink-0" />
        <span className="font-mono text-[9px] text-slate-text/70 leading-relaxed">
          <span className="text-amber-300/90">Respaldo: NASA FIRMS</span>, cada 30 min. El mismo foco llega por ahí entre 45 min y 1 h más tarde (medido en campo). Aporta MODIS y cubre si NOAA falla.
        </span>
      </div>
      <p className="font-mono text-[8px] text-slate-text/30 text-center mt-3 leading-relaxed">
        Ilustrativo. Publicación de NOAA medida en 14 gránulos (agosto 2026); ventaja sobre FIRMS
        medida en campo. La demora total hasta la alerta depende de cada pasada.
      </p>
    </div>
  )
}

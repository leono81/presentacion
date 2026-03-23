import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { fadeInUp } from '../../lib/animations'
import SectionTag from '../ui/SectionTag'

const pasos = [
  {
    num: '01',
    title: 'Identificar equipo',
    desc: 'Defensa Civil, Bomberos, o el organismo que corresponda operativamente.',
    color: 'border-sky-accent/30',
    dotColor: 'bg-sky-accent',
  },
  {
    num: '02',
    title: 'Refinar polígonos',
    desc: 'Trabajo conjunto para ajustar las zonas industriales y petroleras con los técnicos del Ministerio.',
    color: 'border-emerald-accent/30',
    dotColor: 'bg-emerald-accent',
  },
  {
    num: '03',
    title: 'Capacitación',
    desc: 'Un día con los operadores. La herramienta es intuitiva — 10 minutos de capacitación bastan.',
    color: 'border-violet-accent/30',
    dotColor: 'bg-violet-accent',
  },
  {
    num: '04',
    title: 'Alertas móviles',
    desc: 'Integración de notificaciones push a dispositivos de brigadistas para respuesta inmediata.',
    color: 'border-sky-accent/30',
    dotColor: 'bg-sky-accent',
  },
]

export default function Pasos() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="pasos" className="relative py-24 md:py-32 bg-void">
      <div className="max-w-4xl mx-auto px-6" ref={ref}>
        <div className="text-center mb-16">
          <SectionTag>Próximos Pasos</SectionTag>
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="font-display font-800 text-3xl sm:text-4xl tracking-tight mb-4"
          >
            No pedimos presupuesto
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-slate-text text-lg"
          >
            Pedimos tiempo y voluntad de implementar algo que{' '}
            <span className="text-emerald-accent font-semibold">ya está funcionando</span>.
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-sky-accent/40 via-emerald-accent/30 to-violet-accent/40" />

          <div className="space-y-8">
            {pasos.map((paso, i) => (
              <motion.div
                key={paso.num}
                initial={{ opacity: 0, x: -30 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                className="relative flex items-start gap-5"
              >
                {/* Dot */}
                <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full ${paso.dotColor}/10 border ${paso.color} flex items-center justify-center`}>
                  <span className="font-mono text-sm font-bold text-white-text">{paso.num}</span>
                </div>

                {/* Content */}
                <div className={`flex-1 p-5 rounded-xl bg-surface/50 border ${paso.color}`}>
                  <h3 className="font-display font-700 text-lg mb-2">{paso.title}</h3>
                  <p className="text-sm text-slate-text leading-relaxed">{paso.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

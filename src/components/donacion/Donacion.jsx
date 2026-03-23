import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { fadeInUp, staggerContainer } from '../../lib/animations'
import { Wrench, GraduationCap, RefreshCw, ArrowRight } from 'lucide-react'
import SectionTag from '../ui/SectionTag'
import CountUp from '../ui/CountUp'

const compromisos = [
  {
    icon: Wrench,
    title: 'Puesta en marcha',
    desc: 'Nos sentamos con Defensa Civil, Bomberos, o quien el Gobierno designe. Configuramos el sistema para que se integre a los flujos de trabajo que ya existen.',
    detail: 'Sin costo',
  },
  {
    icon: GraduationCap,
    title: 'Capacitación presencial',
    desc: 'Una jornada de trabajo con los operadores que van a usar el sistema. Se van con manual de uso y el sistema funcionando en sus celulares.',
    detail: 'En Tierra del Fuego',
  },
  {
    icon: RefreshCw,
    title: 'Mantenimiento permanente',
    desc: 'Howenh Labs se hace cargo de los servidores, las actualizaciones y la evolución del sistema. El Estado no administra nada — solo usa la herramienta.',
    detail: 'Sin costo, sin plazo',
  },
]

export default function Donacion() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 })

  return (
    <section id="donacion" className="relative py-24 md:py-32 bg-surface">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-accent/20 to-transparent" />

      <div className="max-w-5xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <div className="text-center mb-6">
          <SectionTag>Nuestra propuesta</SectionTag>
        </div>

        {/* Main reveal: $0 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="font-mono text-7xl sm:text-8xl md:text-9xl font-bold text-white-text mb-3"
          >
            $<CountUp to={0} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="inline-block px-4 py-1.5 bg-emerald-accent rounded-full text-void text-xs font-bold tracking-wide mb-6"
          >
            COSTO PARA LA PROVINCIA
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7 }}
            className="text-slate-text text-lg max-w-2xl mx-auto leading-relaxed mb-6"
          >
            Penon Monitor es desarrollado y financiado por{' '}
            <a href="https://howenh-labs.com" target="_blank" rel="noopener noreferrer" className="text-emerald-accent hover:underline">
              Howenh Labs
            </a>
            . Nosotros nos hacemos cargo de todo — servidores, datos, mantenimiento.
            La provincia{' '}
            <span className="text-white-text font-semibold">accede sin costo, sin plazos, sin letra chica</span>.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9 }}
            className="text-slate-text/60 text-sm max-w-xl mx-auto leading-relaxed italic"
          >
            Somos fueguinos. Construimos esto porque Tierra del Fuego no puede
            seguir esperando que un presupuesto le resuelva el monitoreo de incendios.
            La herramienta ya existe. Solo falta que se use.
          </motion.p>
        </motion.div>

        {/* What's included */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="mb-6"
        >
          <h3 className="text-center font-display font-700 text-lg text-white-text mb-8">
            Qué incluye
          </h3>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-3 gap-5 mb-16"
        >
          {compromisos.map((c) => (
            <motion.div
              key={c.title}
              variants={fadeInUp}
              className="p-6 rounded-xl bg-emerald-accent/[0.03] border border-emerald-accent/15 text-left flex flex-col"
            >
              <c.icon className="w-7 h-7 text-emerald-accent mb-4" />
              <h4 className="font-display font-700 text-base mb-2">{c.title}</h4>
              <p className="text-sm text-slate-text leading-relaxed mb-4 flex-1">{c.desc}</p>
              <span className="inline-block text-[10px] font-mono text-emerald-accent/70 bg-emerald-accent/[0.06] px-2.5 py-1 rounded-full self-start">
                {c.detail}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <a
            href="https://penon.howenh-labs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-accent text-void font-display font-700 rounded-xl hover:bg-emerald-accent/90 transition-colors"
          >
            Ver el sistema en funcionamiento
            <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-[11px] text-slate-text/40 mt-3">
            penon.howenh-labs.com — operativo ahora mismo con datos reales
          </p>
        </motion.div>
      </div>
    </section>
  )
}

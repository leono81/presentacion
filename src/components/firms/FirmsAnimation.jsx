import { motion } from 'framer-motion'

const steps = [
  {
    id: 1,
    icon: '🛰️',
    title: 'Los Satélites',
    desc: '5 satélites polares (Terra, Aqua, Suomi NPP, NOAA-20, NOAA-21) + geoestacionarios GOES 16/18 orbitan la Tierra continuamente.',
    color: 'border-sky-accent/30',
    bg: 'bg-sky-accent/5',
    dotColor: 'bg-sky-accent',
  },
  {
    id: 2,
    icon: '📡',
    title: 'Los Sensores',
    desc: 'MODIS (1km/píxel) y VIIRS (375m/píxel) miden radiación infrarroja. VIIRS detecta focos desde 20m² — no toman fotos, miden calor.',
    color: 'border-emerald-accent/30',
    bg: 'bg-emerald-accent/5',
    dotColor: 'bg-emerald-accent',
  },
  {
    id: 3,
    icon: '🔥',
    title: 'Detección de Fuego',
    desc: 'Algoritmo contextual filtra agua, nubes y brillo solar. Usa bandas infrarrojo medio + onda larga para detectar llamas abiertas y combustión latente.',
    color: 'border-red-500/30',
    bg: 'bg-red-500/5',
    dotColor: 'bg-red-500',
  },
  {
    id: 4,
    icon: '🌎',
    title: 'Ventaja Polar',
    desc: 'TdF en latitud alta = órbitas se superponen. +10 observaciones diarias por satélites polares + GOES cada 10 minutos, sin pausa.',
    color: 'border-violet-accent/30',
    bg: 'bg-violet-accent/5',
    dotColor: 'bg-violet-accent',
  },
  {
    id: 5,
    icon: '🖥️',
    title: 'De FIRMS a Penon',
    desc: 'NASA procesa la señal y la publica en su API. Penon la consulta, aplica filtros industriales y petroleros, clasifica confianza, y muestra la alerta.',
    color: 'border-emerald-accent/30',
    bg: 'bg-emerald-accent/5',
    dotColor: 'bg-emerald-accent',
  },
]

const stepVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' },
  }),
}

export default function FirmsAnimation({ inView }) {
  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Connecting line */}
      <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-sky-accent/40 via-emerald-accent/30 via-red-500/20 to-violet-accent/40" />

      <div className="space-y-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.id}
            custom={i}
            variants={stepVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="relative flex items-start gap-5 ml-0"
          >
            {/* Step dot */}
            <div className="relative z-10 flex-shrink-0">
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl ${step.bg} border ${step.color} flex items-center justify-center text-2xl md:text-3xl`}>
                {step.icon}
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 p-5 rounded-xl ${step.bg} border ${step.color}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs text-slate-text/50">0{step.id}</span>
                <h3 className="font-display font-700 text-lg text-white-text">{step.title}</h3>
              </div>
              <p className="text-sm text-slate-text leading-relaxed">{step.desc}</p>
            </div>

            {/* Arrow to next */}
            {i < steps.length - 1 && (
              <div className="absolute left-6 md:left-8 -bottom-3 w-px h-6">
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
                  className={`w-1.5 h-1.5 rounded-full ${step.dotColor} mx-auto opacity-60`}
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Time indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-accent/10 border border-emerald-accent/30">
          <span className="text-emerald-accent font-mono font-bold text-lg">&lt; 10 min</span>
          <span className="text-slate-text text-sm">del satélite a la alerta en pantalla</span>
        </div>
      </motion.div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { fadeInUp, staggerContainer } from '../../lib/animations'
import CountUp from '../ui/CountUp'
import SectionTag from '../ui/SectionTag'

const fmtNum = (n) => n.toLocaleString('es-AR')

const incendios = [
  {
    year: '1917',
    lugar: 'Presidio → Monte Olivia',
    detalle: 'Incendio prolongado en bosque nativo. Sin capacidad de respuesta en la época.',
    ha: null,
    img: '/incendios/tolhuin-forestal.jpg',
  },
  {
    year: '1978',
    lugar: 'Ruta 3, "El Quemado"',
    detalle: 'El nombre de la zona quedó como testimonio permanente del incendio.',
    ha: null,
    img: '/incendios/tolhuin-2022-1.jpg',
  },
  {
    year: '2008',
    lugar: 'Corazón de la Isla',
    detalle: '2.517 ha de lenga perdidas. 6.993 ha afectadas en total. Originado por maquinaria en turberas.',
    ha: 6993,
    fuente: 'Dir. Gral. Desarrollo Forestal TdF',
    img: '/incendios/tolhuin-2022-2.jpg',
  },
  {
    year: '2012',
    lugar: 'Bahía El Torito, Lago Fagnano',
    detalle: 'Costa sur del lago. 1.700 hectáreas afectadas.',
    ha: 1700,
    img: '/incendios/tolhuin-2022-3.jpg',
  },
  {
    year: '2022',
    lugar: 'Reserva Corazón de la Isla',
    detalle: 'El incendio más extenso en la historia de la provincia. Más de 2 meses de combate.',
    ha: 12000,
    fuente: 'Gobierno de Tierra del Fuego',
    destacado: true,
    img: '/incendios/reserva-2022.jpg',
  },
]

// Precalculate cumulative hectares at each step
const cumulativeHa = incendios.reduce((acc, inc, i) => {
  const prev = i > 0 ? acc[i - 1] : 0
  acc.push(prev + (inc.ha || 0))
  return acc
}, [])

const datos2022 = [
  { valor: '12.000', unidad: 'ha', label: 'Afectadas', sub: '4× la superficie de Ushuaia' },
  { valor: '2+', unidad: 'meses', label: 'De combate', sub: 'Nov 2022 — Ene 2023' },
  { valor: '1.000', unidad: '', label: 'Brigadistas', sub: 'Desplegados en la zona' },
  { valor: '90', unidad: 'km/h', label: 'Vientos', sub: 'Complicando las tareas' },
]

function TimelineCard({ inc, index, progress, total }) {
  const sliceSize = 1 / total
  const cardStart = index * sliceSize
  const cardMid = cardStart + sliceSize * 0.5
  const cardEnd = cardStart + sliceSize

  // Cards appear from invisible
  const opacity = useTransform(progress, [cardStart, cardMid, cardEnd], [0, 1, 0.3])
  const scale = useTransform(progress, [cardStart, cardMid, cardEnd], [0.92, 1, 0.97])
  const y = useTransform(progress, [cardStart, cardStart + sliceSize * 0.3, cardMid], [30, 0, 0])

  // Dot glow — warm tones only (amber → red)
  const dotScale = useTransform(progress, [cardStart, cardMid, cardEnd], [0.5, 1.3, 0.8])
  const dotGlow = useTransform(
    progress,
    [cardStart, cardMid, cardEnd],
    inc.destacado
      ? ['rgba(239,68,68,0)', 'rgba(239,68,68,0.8)', 'rgba(239,68,68,0.3)']
      : ['rgba(245,158,11,0)', 'rgba(245,158,11,0.6)', 'rgba(245,158,11,0.15)']
  )

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className={`relative flex items-start gap-6 ${
        index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
      }`}
    >
      {/* Dot on the line */}
      <motion.div
        style={{
          scale: dotScale,
          boxShadow: useTransform(dotGlow, (v) => `0 0 ${inc.destacado ? '30px 8px' : '20px 4px'} ${v}`),
        }}
        className={`absolute left-4 md:left-1/2 -translate-x-1/2 rounded-full z-10 ${
          inc.destacado
            ? 'w-6 h-6 bg-red-500 ring-2 ring-red-500/30 ring-offset-2 ring-offset-surface'
            : 'w-4 h-4 bg-amber-500'
        }`}
      />

      {/* Card */}
      <div
        className={`ml-12 md:ml-0 md:w-[45%] ${
          index % 2 === 0 ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'
        }`}
      >
        <div
          className={`relative overflow-hidden p-5 rounded-2xl border backdrop-blur-sm transition-colors duration-500 ${
            inc.destacado
              ? 'bg-red-500/5 border-red-500/20'
              : 'bg-surface-2/50 border-white/5'
          }`}
        >
          {/* Background image with gradient overlay */}
          {inc.img && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${inc.img})`,
                  opacity: 0.4,
                }}
              />
              <div className={`absolute inset-0 ${
                inc.destacado
                  ? 'bg-gradient-to-t from-red-950/80 via-red-950/50 to-red-950/20'
                  : 'bg-gradient-to-t from-void/85 via-void/50 to-void/20'
              }`} />
            </>
          )}

          <div className="relative z-10">
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className={`font-mono font-bold text-2xl ${
                  inc.destacado ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {inc.year}
              </span>
              {inc.ha && (
                <span className="font-mono text-sm text-slate-text/80 bg-white/5 px-2 py-0.5 rounded-full">
                  {fmtNum(inc.ha)} ha
                </span>
              )}
            </div>

            <h4 className="font-display font-700 text-lg text-white-text mb-1">{inc.lugar}</h4>
            <p className="text-sm text-slate-text leading-relaxed">{inc.detalle}</p>

            {inc.fuente && (
              <p className="text-[10px] text-slate-text/40 mt-2 font-mono">
                Fuente: {inc.fuente}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Animated counter that smoothly counts between values
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  const rafRef = useRef(null)
  const prevRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    if (from === to) return

    const start = performance.now()
    const duration = 600

    const step = (now) => {
      const elapsed = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (elapsed < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        prevRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return <>{fmtNum(display)}</>
}

function CumulativeCounter({ progress, total }) {
  const [currentHa, setCurrentHa] = useState(0)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [visible, setVisible] = useState(false)

  useMotionValueEvent(progress, 'change', (v) => {
    const isInRange = v > 0.02 && v < 0.95
    setVisible(isInRange)

    const sliceSize = 1 / total
    const idx = Math.min(Math.floor(v / sliceSize + 0.5), total - 1)
    if (idx !== activeIndex && idx >= 0) {
      setActiveIndex(idx)
      setCurrentHa(cumulativeHa[idx])
    }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
      transition={{ duration: 0.4 }}
      className="sticky top-20 z-20 flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto bg-void/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-3 shadow-2xl">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-mono text-xs text-slate-text uppercase tracking-wider">
          Hectáreas perdidas
        </span>
        <span className="font-mono text-lg font-bold text-amber-400 tabular-nums min-w-[5ch] text-right">
          <AnimatedNumber value={currentHa} />
        </span>
      </div>
    </motion.div>
  )
}

export default function Problema() {
  const [headerRef, headerInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const timelineRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.6', 'end 0.4'],
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  // Line color: amber → orange → red (fire tones only, no green)
  const lineColor = useTransform(
    scrollYProgress,
    [0, 0.4, 0.75, 1],
    [
      'rgba(245,158,11,0.4)',
      'rgba(249,115,22,0.5)',
      'rgba(239,68,68,0.6)',
      'rgba(239,68,68,0.3)',
    ]
  )

  return (
    <section id="problema" className="relative py-24 md:py-32 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div ref={headerRef}>
          <SectionTag>El Problema</SectionTag>

          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate={headerInView ? 'visible' : 'hidden'}
            className="font-display font-800 text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-6"
          >
            Un ecosistema{' '}
            <span className="text-emerald-accent">irreemplazable</span>
            <br />
            bajo amenaza constante
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate={headerInView ? 'visible' : 'hidden'}
            className="text-slate-text text-lg leading-relaxed max-w-2xl mb-12"
          >
            Los bosques de lenga, ñire y guindo de Tierra del Fuego no existen en ningún otro
            lugar del mundo en esta escala. Cada incendio forestal representa una pérdida
            que la restauración tarda décadas en recuperar.
          </motion.p>
        </div>

        {/* Scroll-linked Timeline */}
        <div ref={timelineRef} className="relative mb-16">
          <CumulativeCounter progress={scrollYProgress} total={incendios.length} />

          {/* Animated vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px">
            <div className="absolute inset-0 bg-white/5" />
            <motion.div
              style={{
                height: lineHeight,
                backgroundColor: lineColor,
              }}
              className="absolute top-0 left-0 w-full origin-top shadow-[0_0_8px_rgba(245,158,11,0.2)]"
            />
          </div>

          {/* Cards */}
          <div className="space-y-6 pt-8 pb-4">
            {incendios.map((inc, i) => (
              <TimelineCard
                key={inc.year}
                inc={inc}
                index={i}
                progress={scrollYProgress}
                total={incendios.length}
              />
            ))}
          </div>
        </div>

        {/* 2022 stats grid */}
        <div ref={statsRef}>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
          >
            {datos2022.map((d) => (
              <motion.div
                key={d.label}
                variants={fadeInUp}
                className="group p-6 rounded-xl bg-surface-2/50 border border-white/5 text-center hover:border-amber-500/20 transition-colors duration-300"
              >
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white-text mb-1">
                  {d.valor}
                  <span className="text-amber-400 text-sm ml-1">{d.unidad}</span>
                </div>
                <div className="text-sm font-semibold text-white-text mb-1">{d.label}</div>
                <div className="text-xs text-slate-text">{d.sub}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Dato de contraste */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate={statsInView ? 'visible' : 'hidden'}
            className="relative p-8 md:p-12 rounded-2xl bg-gradient-to-r from-red-500/5 to-emerald-accent/5 border border-white/10 text-center"
          >
            <div className="max-w-3xl mx-auto">
              <p className="font-display font-700 text-xl md:text-2xl lg:text-3xl leading-snug mb-4">
                En <span className="text-emerald-accent">14 años</span> de restauración
                se recuperaron <span className="font-mono text-emerald-accent"><CountUp to={233} /></span> hectáreas.
                <br />
                En <span className="text-amber-400">2 meses</span> se perdieron{' '}
                <span className="font-mono text-amber-400"><CountUp to={12000} separator="." /></span>.
              </p>
              <p className="text-xs text-slate-text/60 font-mono">
                Fuente: Dirección General de Desarrollo Forestal, Tierra del Fuego
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionTag from '../ui/SectionTag'
import CountUp from '../ui/CountUp'
import OrbitScrub from './OrbitScrub'
import ConstellationVis3D from './ConstellationVis3D'
import SensorCompare from './SensorCompare'
import AlgoLive from './AlgoLive'
import SwathDay from './SwathDay'
import SignalRace from './SignalRace'
import { useInView } from 'react-intersection-observer'
import { CloudOff, Crosshair, Timer, ThermometerSnowflake } from 'lucide-react'

/*
 * Datos verificados contra documentación oficial (junio 2026):
 * NASA FIRMS FAQ, VIIRS C2 Active Fire User Guide 1.2 (jun 2025),
 * NOAA NESDIS, NASA Earthdata / LANCE.
 */

const steps = [
  {
    id: 0,
    tag: '01',
    label: 'LA CONSTELACIÓN',
    title: 'Seis pares de ojos sobre el hemisferio',
    body: 'Cuatro satélites polares — Terra y Aqua (NASA), NOAA-20 y NOAA-21 (NASA/NOAA) — recorren el planeta de polo a polo a entre 705 y 833 km de altura, 14 órbitas por día. Los geoestacionarios GOES-19 (Este) y GOES-18 (Oeste) observan América completa cada 10 minutos desde 35.786 km.',
    detail: 'Terra y Aqua, en órbita desde 1999 y 2002, entran en fase de retiro entre 2026 y 2027. Suomi NPP, el primer VIIRS, dejó de aportar datos en noviembre de 2026: NOAA-20 y NOAA-21 siguen plenamente operativos y NOAA-22 (JPSS-4) tiene lanzamiento previsto para 2027.',
  },
  {
    id: 1,
    tag: '02',
    label: 'LOS SENSORES',
    title: 'Miden calor, no toman fotos',
    body: 'VIIRS escanea una franja de ~3.060 km de ancho con píxeles de 375 m: cobertura global completa dos veces al día por satélite. Detecta la radiación infrarroja del fuego en su banda I-4 (3,74 µm) y la contrasta con el fondo térmico en I-5 (~11 µm). MODIS, su antecesor, trabaja a 1 km con bandas de 3,96 y 11 µm.',
    detail: 'De noche la sensibilidad de VIIRS se multiplica: detecta ~17 veces más píxeles de fuego que el producto de 750 m. MODIS detecta rutinariamente fuegos desde 1.000 m² y, en condiciones ideales, de decenas de m². No necesitan luz: funcionan de día y de noche.',
  },
  {
    id: 2,
    tag: '03',
    label: 'EL ALGORITMO',
    title: 'Cada píxel se compara con sus vecinos',
    body: 'Un píxel es candidato si su temperatura de brillo supera 325 K de día (295 K de noche). Luego el algoritmo contextual lo compara estadísticamente contra hasta 35 píxeles vecinos y descarta falsos positivos: reflejo solar sobre agua, nubes, suelo brillante e incluso la Anomalía Magnética del Atlántico Sur, que afecta especialmente a la Argentina.',
    detail: 'Cada detección se publica con nivel de confianza (alta / nominal / baja) y con su FRP: la potencia radiativa del fuego en megawatts, que indica la intensidad. El punto no marca el perímetro — indica fuego activo dentro de un píxel de 375 m.',
  },
  {
    id: 3,
    tag: '04',
    label: 'LA VENTAJA AUSTRAL',
    title: 'El fin del mundo se observa más',
    body: 'Las órbitas polares convergen hacia los polos. En el ecuador cada sensor pasa 1 o 2 veces al día; en latitudes muy altas, las franjas de barrido se superponen hasta 8 veces diarias por sensor, según la NASA. A 54°S, Tierra del Fuego está entre los territorios más observados del planeta.',
    detail: 'Y mientras los polares pasan, GOES-19 vigila el cono sur sin pausa: una imagen completa de América cada 10 minutos, con detección de fuego a 2 km de resolución.',
  },
  {
    id: 4,
    tag: '05',
    label: 'LA SEÑAL',
    title: 'De la órbita a la pantalla',
    body: 'Para NOAA-20 y NOAA-21, Penon no espera a FIRMS: toma los focos directo del bucket público de NOAA, que los publica minutos después de la pasada (medimos entre 15 y 44 min), y lo revisa cada 10 minutos. Medido en campo, el foco llega entre 45 minutos y 1 hora antes que por FIRMS. Rotula las detecciones en zonas industriales y petroleras, las cruza con el peligro del día y emite la alerta por Telegram.',
    detail: 'NASA FIRMS queda de respaldo, consultado cada 30 minutos: aporta MODIS y cubre si NOAA falla, aunque en Sudamérica tarda hasta 3 horas. Parques Nacionales usa estas mismas detecciones VIIRS en Argentina: es el estándar global, y también el local.',
  },
]

const stats = [
  { num: 375, suffix: 'm', label: 'Resolución VIIRS', sub: 'por píxel', color: 'text-sky-accent' },
  { num: 3060, suffix: '', label: 'Km de barrido', sub: 'por pasada VIIRS', color: 'text-violet-accent' },
  { num: 10, suffix: ' min', label: 'Cadencia GOES-19', sub: 'América completa', color: 'text-amber-400' },
  { num: 1, prefix: 'hasta ', suffix: ' h', label: 'Antes que FIRMS', sub: 'directo de NOAA · medido en campo', color: 'text-emerald-accent' },
]

const roster = [
  { name: 'Terra', org: 'NASA', sensor: 'MODIS · 1 km', orbit: '705 km · 99 min', since: 'En órbita desde 1999', status: 'Fase final', statusColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10', note: 'Retiro previsto 2027' },
  { name: 'Aqua', org: 'NASA', sensor: 'MODIS · 1 km', orbit: '705 km · 98,8 min', since: 'En órbita desde 2002', status: 'Fase final', statusColor: 'text-amber-400 border-amber-400/30 bg-amber-400/10', note: 'Retiro previsto 2027' },
  { name: 'Suomi NPP', org: 'NASA / NOAA', sensor: 'VIIRS · 375 m', orbit: '824 km · 101 min', since: 'En órbita desde 2011', status: 'Fuera de servicio', statusColor: 'text-slate-text border-slate-text/30 bg-slate-text/10', note: 'Sin datos desde nov 2026' },
  { name: 'NOAA-20', org: 'JPSS-1', sensor: 'VIIRS · 375 m', orbit: '833 km · 14 órb/día', since: 'En órbita desde 2017', status: 'Operativo', statusColor: 'text-emerald-accent border-emerald-accent/30 bg-emerald-accent/10', note: 'Cruce ecuatorial ~13:30' },
  { name: 'NOAA-21', org: 'JPSS-2', sensor: 'VIIRS · 375 m', orbit: '833 km · 14 órb/día', since: 'En órbita desde 2022', status: 'Operativo', statusColor: 'text-emerald-accent border-emerald-accent/30 bg-emerald-accent/10', note: 'En FIRMS desde ene 2024' },
  { name: 'GOES-19', org: 'NOAA · GOES-Este', sensor: 'ABI FDC · 2 km', orbit: 'Geoestacionario · 75,2°O', since: '35.786 km de altura', status: 'Operativo', statusColor: 'text-emerald-accent border-emerald-accent/30 bg-emerald-accent/10', note: 'América cada 10 min · desde abr 2025' },
  { name: 'GOES-18', org: 'NOAA · GOES-Oeste', sensor: 'ABI FDC · 2 km', orbit: 'Geoestacionario · 137°O', since: '35.786 km de altura', status: 'Operativo', statusColor: 'text-emerald-accent border-emerald-accent/30 bg-emerald-accent/10', note: 'América cada 10 min' },
  { name: 'NOAA-22', org: 'JPSS-4', sensor: 'VIIRS · 375 m', orbit: 'Órbita polar', since: 'Lanzamiento previsto 2027', status: 'Próximo', statusColor: 'text-violet-accent border-violet-accent/30 bg-violet-accent/10', note: 'Refuerza la constelación VIIRS' },
]

const limits = [
  { icon: CloudOff, title: 'Nubes y dosel', desc: 'La nubosidad densa o el dosel cerrado del bosque pueden ocultar un foco por completo.' },
  { icon: Crosshair, title: 'Píxel ≠ perímetro', desc: 'El punto indica fuego activo dentro del píxel — no el tamaño ni el borde del incendio.' },
  { icon: Timer, title: 'Latencia', desc: 'Por FIRMS, en Sudamérica los datos polares tardan hasta 3 horas. Por eso Penon toma NOAA-20 y NOAA-21 directo de NOAA: llegan entre 45 minutos y 1 hora antes.' },
  { icon: ThermometerSnowflake, title: 'Fuegos pequeños o fríos', desc: 'Por debajo del umbral térmico no hay detección. Que no haya puntos no garantiza que no haya fuego.' },
]

// --- Text block: scrolls naturally, triggers vis change ---
function StepBlock({ step, onInView }) {
  // Línea de activación en el centro del viewport: el bloque que la cruza
  // manda. Evita las zonas muertas del threshold con bloques altos.
  const [ref] = useInView({
    rootMargin: '-45% 0px -45% 0px',
    onChange: (inView) => { if (inView) onInView(step.id) },
  })

  return (
    <div ref={ref} className="min-h-[70vh] flex items-center">
      <div className="py-12 max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-sky-accent/10 border border-sky-accent/20 flex items-center justify-center">
            <span className="font-mono text-xs font-bold text-sky-accent">{step.tag}</span>
          </div>
          <span className="font-mono text-[11px] text-slate-text/50 uppercase tracking-widest">{step.label}</span>
        </div>
        <h3 className="font-display font-800 text-2xl md:text-3xl text-white-text mb-4 leading-tight">{step.title}</h3>
        <p className="text-slate-text text-[15px] leading-relaxed mb-4">{step.body}</p>
        <p className="text-slate-text/50 text-[13px] leading-relaxed border-l-2 border-sky-accent/20 pl-4">{step.detail}</p>
      </div>
    </div>
  )
}

const visComponents = [ConstellationVis3D, SensorCompare, AlgoLive, SwathDay, SignalRace]

// --- Sticky visualization panel ---
function StickyVis({ activeStep }) {
  const ActiveVis = visComponents[activeStep]
  return (
    <div className="flex items-center justify-center h-full">
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="w-full"
      >
        <ActiveVis />
      </motion.div>
    </div>
  )
}

export default function Firms() {
  const [headerRef] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section id="firms" className="relative bg-void scroll-mt-16">
      {/* Apertura cinematográfica — scroll scrubbing del video orbital */}
      <OrbitScrub />

      {/* Sticky section header — stays visible throughout the entire section */}
      <div className="sticky top-14 z-30 bg-void/95 backdrop-blur-md border-b border-white/5" ref={headerRef}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <SectionTag>Cómo Funciona FIRMS</SectionTag>
              <h2 className="font-display font-800 text-2xl sm:text-3xl lg:text-4xl tracking-tight">
                Del <span className="text-sky-accent">espacio</span> a la detección
              </h2>
              <p className="text-slate-text text-sm mt-2 max-w-lg">
                NASA FIRMS vigila incendios activos en todo el planeta con una constelación
                de satélites. Así llega la señal desde la órbita hasta tu pantalla.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4 pb-1">
              {steps.map((step, i) => (
                <span
                  key={i}
                  className={`font-mono text-[10px] uppercase tracking-wider transition-colors duration-300 ${
                    i === activeStep ? 'text-white' : 'text-white/25'
                  }`}
                >
                  {step.tag} {step.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollytelling: text scrolls, vis is sticky */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-8 md:gap-12 relative">
          <div>
            {steps.map((step) => (
              <StepBlock key={step.id} step={step} onInView={setActiveStep} />
            ))}
          </div>

          <div className="hidden md:block">
            <div className="sticky top-52 h-[calc(100vh-14rem)]">
              <StickyVis activeStep={activeStep} />
            </div>
          </div>

          {/* Mobile: show visualization inline below each text block */}
          <div className="md:hidden mt-4">
            <div className="w-full">
              <StickyVis activeStep={activeStep} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Evidencia real: el incendio 2022 visto por FIRMS ── */}
      <div className="max-w-7xl mx-auto px-6 pt-20">
        <div className="text-center mb-8">
          <h3 className="font-display font-800 text-2xl md:text-3xl text-white-text mb-3">
            Así vio FIRMS el <span className="text-fire">incendio de 2022</span>
          </h3>
          <p className="text-slate-text text-sm max-w-2xl mx-auto">
            No es una simulación. Esta es la imagen real del sensor VIIRS sobre la Reserva
            Corazón de la Isla, con las detecciones térmicas que el sistema publicó ese día.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
          className="relative hud-frame rounded-2xl overflow-hidden border border-white/10"
        >
          <img
            src="/media/firms-incendio-2022.jpg"
            alt="Imagen satelital VIIRS del 10 de diciembre de 2022: Tierra del Fuego con detecciones térmicas en rojo sobre la Reserva Corazón de la Isla y pluma de humo extendiéndose hacia el Atlántico"
            className="w-full h-auto"
            loading="lazy"
          />
          <div className="scanline-sweep" />

          {/* Callout: detecciones */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute hidden sm:block"
            style={{ left: '52%', top: '60%' }}
          >
            <div className="w-10 h-10 -ml-5 -mt-5 rounded-full border border-fire/60 animate-ping absolute opacity-40" />
            <div className="absolute left-6 -top-2 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-void/85 backdrop-blur-sm border border-fire/30">
              <span className="font-mono text-[10px] text-fire font-bold block">DETECCIONES VIIRS · 375 m</span>
              <span className="font-mono text-[9px] text-slate-text/60">Reserva Corazón de la Isla</span>
            </div>
          </motion.div>

          {/* Callout: humo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="absolute hidden sm:block"
            style={{ left: '68%', top: '34%' }}
          >
            <div className="px-2.5 py-1.5 rounded-lg bg-void/85 backdrop-blur-sm border border-white/15">
              <span className="font-mono text-[10px] text-slate-text block">PLUMA DE HUMO</span>
              <span className="font-mono text-[9px] text-slate-text/60">visible desde 824 km de altura</span>
            </div>
          </motion.div>

          {/* Caption bar */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-void/90 to-transparent pt-10 pb-3 px-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] text-white-text/80">
                <span className="text-emerald-accent font-bold">VIIRS · Suomi NPP</span> — 10 de diciembre de 2022
              </span>
              <span className="font-mono text-[9px] text-slate-text/50">
                Fuente: NASA Worldview / FIRMS · imagen pública
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Ficha técnica de la constelación ── */}
      <div className="max-w-7xl mx-auto px-6 pt-20">
        <div className="text-center mb-10">
          <h3 className="font-display font-800 text-2xl md:text-3xl text-white-text mb-3">
            La constelación, <span className="text-sky-accent">ficha por ficha</span>
          </h3>
          <p className="text-slate-text text-sm max-w-2xl mx-auto">
            Cada satélite que alimenta a FIRMS, con sus datos orbitales verificados
            contra documentación oficial de NASA y NOAA.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roster.map((sat, i) => (
            <motion.div
              key={sat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="hud-frame p-4 rounded-xl bg-surface-2/30 border border-white/[0.06] hover:border-sky-accent/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-display font-800 text-base text-white-text leading-none">{sat.name}</div>
                  <div className="font-mono text-[9px] text-slate-text/50 mt-1">{sat.org}</div>
                </div>
                <span className={`font-mono text-[8px] font-bold px-2 py-0.5 rounded-full border ${sat.statusColor}`}>
                  {sat.status.toUpperCase()}
                </span>
              </div>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-text/40">Sensor</span>
                  <span className="text-slate-text">{sat.sensor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-text/40">Órbita</span>
                  <span className="text-slate-text">{sat.orbit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-text/40">Misión</span>
                  <span className="text-slate-text">{sat.since}</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5">
                <span className="font-mono text-[9px] text-slate-text/40">{sat.note}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="p-5 rounded-xl bg-surface/50 border border-white/5 text-center">
              <div className={`font-mono text-3xl font-bold ${s.color} mb-1`}>
                {s.prefix}<CountUp to={s.num} />{s.suffix}
              </div>
              <div className="text-xs text-white-text/80 font-medium">{s.label}</div>
              <div className="text-[10px] text-slate-text/50 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Honestidad técnica ── */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="rounded-2xl bg-surface-2/20 border border-white/[0.06] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-mono text-[10px] text-amber-400/80 uppercase tracking-widest">Honestidad técnica — lo que el satélite no ve</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {limits.map((l) => (
              <div key={l.title} className="flex flex-col gap-2">
                <l.icon className="w-4 h-4 text-slate-text/40" />
                <span className="font-display font-700 text-xs text-white-text">{l.title}</span>
                <p className="text-[11px] text-slate-text/60 leading-relaxed">{l.desc}</p>
              </div>
            ))}
          </div>
          <p className="font-mono text-[10px] text-slate-text/40 mt-6 pt-4 border-t border-white/5">
            Estas limitaciones están documentadas por la propia NASA. Un sistema confiable empieza por no prometer de más.
          </p>
        </div>
        <p className="text-center text-[10px] text-slate-text/30 font-mono mt-6">
          Fuentes: NASA FIRMS / Earthdata · VIIRS C2 Active Fire User Guide (jun 2025) · NOAA NESDIS · LANCE NRT
        </p>
      </div>
    </section>
  )
}

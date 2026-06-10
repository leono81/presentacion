import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'

/** Reloj UTC compacto para el HUD */
function HudClock() {
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

const FRAME_COUNT = 80
const framePath = (i) => `/media/orbit/frame-${String(i + 1).padStart(3, '0')}.webp`

/** Mensajes sincronizados al progreso del scroll */
const messages = [
  {
    range: [0.05, 0.3],
    title: '7 satélites',
    sub: 'vigilan el hemisferio en este momento',
  },
  {
    range: [0.38, 0.62],
    title: '14 órbitas por día',
    sub: 'cada satélite polar, de polo a polo a 27.000 km/h',
  },
  {
    range: [0.7, 0.95],
    title: 'Cobertura global 2× diaria',
    sub: 'y mucho más frecuente sobre Tierra del Fuego',
  },
]

function ScrubMessage({ progress, msg }) {
  const [start, end] = msg.range
  const fade = 0.06
  const opacity = useTransform(
    progress,
    [start, start + fade, end - fade, end],
    [0, 1, 1, 0]
  )
  const y = useTransform(progress, [start, start + fade], [24, 0])

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-[20%] text-center px-6 pointer-events-none"
    >
      <div className="font-display font-800 text-4xl sm:text-6xl lg:text-7xl text-white-text mb-3 drop-shadow-[0_2px_24px_rgba(0,0,0,0.85)]">
        {msg.title}
      </div>
      <div className="font-mono text-xs sm:text-base text-slate-text tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
        {msg.sub}
      </div>
    </motion.div>
  )
}

/** Telemetría de cámara orbital: esquinas HUD + coordenadas que viajan hacia TdF */
function HudOverlay({ progress }) {
  // El "viaje" baja desde el ecuador hasta Tierra del Fuego con el scroll
  const latText = useTransform(progress, (v) => `LAT ${(v * -54.8).toFixed(1).padStart(5, ' ')}°`)
  const lonText = useTransform(progress, (v) => `LON ${(-60 - v * 8.3).toFixed(1)}°`)
  const corner = 'absolute w-5 h-5 border-sky-accent/30 pointer-events-none'

  return (
    <div className="absolute inset-0 pointer-events-none font-mono">
      {/* Esquinas de viewfinder (las superiores debajo del nav fijo) */}
      <div className={`${corner} top-16 left-4 border-t border-l`} />
      <div className={`${corner} top-16 right-4 border-t border-r`} />
      <div className={`${corner} bottom-4 left-4 border-b border-l`} />
      <div className={`${corner} bottom-4 right-4 border-b border-r`} />

      {/* Crosshair central sutil */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12]">
        <div className="w-10 h-px bg-white absolute -left-5 top-0" />
        <div className="h-10 w-px bg-white absolute left-0 -top-5" />
      </div>

      {/* Sup. izq: REC + reloj */}
      <div className="absolute top-[76px] left-8 sm:left-10 text-[9px] sm:text-[10px] text-slate-text/70 space-y-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-fire telemetry-blink" />
          <span className="text-fire/90 font-bold tracking-widest">FEED ORBITAL</span>
        </div>
        <div className="tracking-wider"><HudClock /></div>
      </div>

      {/* Sup. der: datos orbitales (Suomi NPP) */}
      <div className="absolute top-[76px] right-8 sm:right-10 text-right text-[9px] sm:text-[10px] text-slate-text/70 space-y-1">
        <div className="tracking-wider">ALT <span className="text-white-text/80">824 KM</span></div>
        <div className="tracking-wider">VEL <span className="text-white-text/80">~27.000 KM/H</span></div>
      </div>

      {/* Inf. izq: coordenadas viajando al sur */}
      <div className="absolute bottom-7 left-8 sm:left-10 text-[9px] sm:text-[10px] text-emerald-accent/80 space-y-1">
        <motion.div className="tracking-wider tabular-nums">{latText}</motion.div>
        <motion.div className="tracking-wider tabular-nums">{lonText}</motion.div>
      </div>

      {/* Inf. der: sensor */}
      <div className="absolute bottom-7 right-8 sm:right-10 text-right text-[9px] sm:text-[10px] text-slate-text/60 space-y-1">
        <div className="tracking-wider">SENSOR <span className="text-violet-accent/90">VIIRS I-4</span></div>
        <div className="tracking-wider">3,74 µm · IR</div>
      </div>
    </div>
  )
}

/** Rail vertical de etapas a la derecha */
function StageRail({ progress }) {
  return (
    <div className="absolute right-8 sm:right-10 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-8 pointer-events-none">
      {messages.map((msg) => {
        const [start, end] = msg.range
        return <StageDot key={msg.title} progress={progress} start={start} end={end} label={msg.title} />
      })}
    </div>
  )
}

function StageDot({ progress, start, end, label }) {
  const active = useTransform(progress, [start - 0.02, start, end, end + 0.02], [0.25, 1, 1, 0.25])
  return (
    <motion.div style={{ opacity: active }} className="flex items-center gap-2 justify-end">
      <span className="font-mono text-[8px] text-white/70 uppercase tracking-widest text-right max-w-[90px] leading-tight">
        {label}
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-sky-accent shrink-0" />
    </motion.div>
  )
}

export default function OrbitScrub() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const imagesRef = useRef([])
  const [ready, setReady] = useState(false)

  // Progreso medido a mano en cada scroll: useScroll cachea el offset del
  // target al montar y queda descalibrado cuando el layout asienta (lazy
  // chunks, imágenes). getBoundingClientRect es siempre correcto.
  const scrollYProgress = useMotionValue(0)

  // Precarga progresiva: primero 1 de cada 8 frames, después el resto
  useEffect(() => {
    let cancelled = false
    const imgs = new Array(FRAME_COUNT)
    imagesRef.current = imgs

    const load = (i) =>
      new Promise((resolve) => {
        const img = new Image()
        img.onload = () => { imgs[i] = img; resolve() }
        img.onerror = resolve
        img.src = framePath(i)
      })

    const coarse = []
    for (let i = 0; i < FRAME_COUNT; i += 8) coarse.push(load(i))
    Promise.all(coarse).then(() => {
      if (cancelled) return
      setReady(true)
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (!imgs[i]) load(i).then(() => { if (!cancelled) drawCurrent() })
      }
    })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const drawFrame = useCallback((index) => {
    const canvas = canvasRef.current
    const imgs = imagesRef.current
    if (!canvas || !imgs.length) return

    // Frame exacto o el más cercano ya cargado
    let img = imgs[index]
    if (!img) {
      for (let d = 1; d < FRAME_COUNT && !img; d++) {
        img = imgs[index - d] || imgs[index + d]
      }
    }
    if (!img) return

    const ctx = canvas.getContext('2d')
    const { width: cw, height: ch } = canvas
    // cover: llenar canvas conservando aspecto
    const scale = Math.max(cw / img.width, ch / img.height)
    const w = img.width * scale
    const h = img.height * scale
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
  }, [])

  const drawCurrent = useCallback(() => {
    const idx = Math.min(
      FRAME_COUNT - 1,
      Math.floor(scrollYProgress.get() * FRAME_COUNT)
    )
    drawFrame(idx)
  }, [drawFrame, scrollYProgress])

  useEffect(() => {
    const update = () => {
      const el = sectionRef.current
      if (!el) return
      const total = el.offsetHeight - window.innerHeight
      if (total <= 0) return
      const v = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total))
      scrollYProgress.set(v)
      drawFrame(Math.min(FRAME_COUNT - 1, Math.floor(v * FRAME_COUNT)))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [drawFrame, scrollYProgress])

  // Canvas a tamaño del viewport (1× DPR alcanza para video escalado)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      drawCurrent()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [ready, drawCurrent])

  useEffect(() => { if (ready) drawCurrent() }, [ready, drawCurrent])

  return (
    <div ref={sectionRef} className="relative h-[300vh] motion-reduce:hidden" aria-hidden="true">
      <div className="sticky top-0 h-screen overflow-hidden bg-void">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Vignette para legibilidad del texto */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,transparent_40%,rgba(3,7,18,0.55)_100%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-void to-transparent pointer-events-none" />

        {messages.map((msg) => (
          <ScrubMessage key={msg.title} progress={scrollYProgress} msg={msg} />
        ))}

        <HudOverlay progress={scrollYProgress} />
        <StageRail progress={scrollYProgress} />

        {/* Hint de scroll al inicio */}
        <ScrubHint progress={scrollYProgress} />
      </div>
    </div>
  )
}

function ScrubHint({ progress }) {
  const opacity = useTransform(progress, [0, 0.04], [1, 0])
  return (
    <motion.div
      style={{ opacity }}
      className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-1 text-slate-text pointer-events-none"
    >
      <span className="font-mono text-[9px] tracking-[0.25em] uppercase">Seguí scrolleando</span>
      <motion.svg
        width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 1.8 }}
      >
        <path d="M4 6l4 4 4-4" />
      </motion.svg>
    </motion.div>
  )
}

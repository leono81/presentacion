import { useEffect, useRef, useState } from 'react'
import { useMotionValue } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Zap, RotateCcw } from 'lucide-react'
import { dibujar, T } from './rayosPelicula'
import RayosMapa, { MAPA_DUR, MAPA_ARMADO } from './RayosMapa'
import './rayos.css'

/*
 * Rayos: de dónde salen, cómo se procesan y cómo se muestran, como una película en tres capítulos
 * que cambia de escala: la órbita a escala real, el disco que ve el GLM, un archivo por dentro, el Sol
 * pasando detrás de la Tierra y, al final, el mapa de Penon con su regla de avisos.
 * Capítulos 1 y 2: rayosPelicula.js (canvas). Capítulo 3: RayosMapa.jsx (SVG + HTML).
 * Todas las cifras salen del código de Penon (ver el encabezado de rayosPelicula.js); los destellos,
 * las ráfagas y las descargas del dibujo son ilustrativos.
 */

const REDUCIDO = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const TOTAL = T.mapa + MAPA_DUR

const CAPS = [
  { titulo: 'De dónde salen', desde: 0, hasta: T.repo, armado: 9.3 },
  { titulo: 'Cómo se procesan', desde: T.repo, hasta: T.mapa, armado: T.ventana + 3.2 },
  { titulo: 'Cómo se muestran', desde: T.mapa, hasta: TOTAL, armado: T.mapa + MAPA_ARMADO },
]
const BEATS = [
  {
    desde: 0,
    texto:
      'GOES-19 (GOES-East) está en órbita geoestacionaria, a 35.786 km de altura sobre los 75,2° O: gira con la Tierra y mira siempre la misma cara del planeta.',
  },
  { desde: T.disco, texto: 'Su detector de rayos, el GLM, ve América entera. Cada descarga es un destello que queda registrado con su hora y su posición.' },
  { desde: T.repo, texto: 'NOAA publica las mediciones en un repositorio público, en archivos de 20 segundos. Penon pasa a buscarlos cada 10 minutos.' },
  {
    desde: T.range,
    texto:
      'De cada archivo lee solo lo que necesita (posición, hora y energía de cada descarga) por HTTP Range: unos 12 KB de los ~330 KB. Sin eso serían 2 GB por día.',
  },
  {
    desde: T.recorte,
    texto:
      'Se queda con lo que cae en la provincia. El 99,99 % de los destellos son de otras latitudes; en Tierra del Fuego caen apenas unos pocos rayos por temporada.',
  },
  {
    desde: T.sol,
    texto:
      'Intrusión solar. Alrededor de cada temporada de eclipses (febrero a abril y agosto a octubre), cerca de la medianoche local del satélite, el Sol pasa al lado del disco terrestre y entra en el GLM: sobre Tierra del Fuego da ráfagas de 80 a 280 rayos falsos entre las 04:00 y las 06:00 UTC.',
  },
  {
    desde: T.ventana,
    texto:
      'Penon calcula esas ventanas por geometría, calibrada con las 211 ventanas oficiales de NOAA para GOES-19 en 2026. En esos minutos el mapa dice «sin dato», no «sin rayos».',
  },
  {
    desde: T.mapa,
    texto:
      'En el mapa van en cian, para no confundirlos con un foco: rojo, naranja y amarillo ya son fuego y peligro FWI. El borde lleva la clase de peligro del día de su zona; si es Alto, Muy alto o Extremo, sale el aviso en pantalla y por Telegram.',
  },
  {
    desde: T.mapa + 5.2,
    texto:
      'Un aviso por zona cada 3 horas, porque una tormenta deja muchas descargas seguidas. Lo que cae con peligro menor que Alto, o fuera de las zonas, queda en el mapa sin aviso.',
  },
  {
    desde: T.mapa + 8.5,
    texto: 'Quedan 24 horas en el mapa y se atenúan sin apagarse, porque un fuego iniciado por un rayo puede arder latente de 24 a 72 horas.',
  },
]
const beatEn = (t) => {
  let i = BEATS.length - 1
  while (i > 0 && BEATS[i].desde > t) i--
  return i
}
const capDe = (b) => CAPS.findIndex((c) => BEATS[b].desde >= c.desde && BEATS[b].desde < c.hasta)
const tramo01 = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)))

export default function Rayos() {
  const escenario = useRef(null)
  const escena = useRef(null)
  const lienzo = useRef(null)
  const capaMapa = useRef(null)
  const rellenos = useRef([])
  const tRef = useRef(REDUCIDO ? CAPS[2].armado : 0)
  const pausaRef = useRef(false)
  const tramoRef = useRef(null)
  const pedirRef = useRef(() => {})
  const t3 = useMotionValue(REDUCIDO ? MAPA_ARMADO : -1)
  const [beat, setBeat] = useState(REDUCIDO ? beatEn(CAPS[2].armado) : 0)
  const [aviso, setAviso] = useState(null) // null | 'pausa' | índice del capítulo que se repite
  const [ref, inView] = useInView({ threshold: 0.3 })

  useEffect(() => {
    const cv = lienzo.current
    const ctx = cv.getContext('2d')
    let W = 0
    let H = 0
    let dpr = 1
    let raf = 0
    let antes = performance.now()
    let reloj = 0
    let ultimo = -1

    const medir = () => {
      const r = escena.current.getBoundingClientRect()
      W = r.width
      H = r.height
      dpr = Math.min(2, window.devicePixelRatio || 1)
      cv.width = Math.round(W * dpr)
      cv.height = Math.round(H * dpr)
    }
    const cuadro = (ahora) => {
      const dt = Math.min(0.1, (ahora - antes) / 1000)
      antes = ahora
      let t = tRef.current
      if (!REDUCIDO) {
        reloj += dt
        if (!pausaRef.current) {
          t += dt
          const tr = tramoRef.current
          if (tr && (t >= tr[1] || t < tr[0] - 0.05)) t = tr[0]
          if (t >= TOTAL) t = 0
          tRef.current = t
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (W) dibujar(ctx, W, H, Math.min(t, T.mapa + 0.4), reloj)
      t3.set(t - T.mapa)
      const om = tramo01(t, T.mapa - 0.3, T.mapa + 0.3)
      capaMapa.current.style.opacity = om
      capaMapa.current.style.visibility = om > 0 ? 'visible' : 'hidden'
      CAPS.forEach((c, i) => {
        const el = rellenos.current[i]
        if (el) el.style.transform = `scaleX(${tramo01(t, c.desde, c.hasta)})`
      })
      const b = beatEn(t)
      if (b !== ultimo) {
        ultimo = b
        setBeat(b)
      }
      if (!REDUCIDO && inView) raf = requestAnimationFrame(cuadro)
    }
    const arrancar = () => {
      cancelAnimationFrame(raf)
      antes = performance.now()
      raf = requestAnimationFrame(cuadro)
    }
    pedirRef.current = arrancar
    medir()
    arrancar()
    const ro = new ResizeObserver(() => {
      medir()
      arrancar()
    })
    ro.observe(escena.current)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [inView, t3])

  // al salir de pantalla, la próxima vez empieza de cero
  useEffect(() => {
    if (!inView && !REDUCIDO) {
      tRef.current = 0
      tramoRef.current = null
    }
  }, [inView])

  const pausar = () => {
    if (REDUCIDO || tramoRef.current) return
    pausaRef.current = true
    setAviso('pausa')
  }
  const seguir = () => {
    pausaRef.current = false
    setAviso(null)
  }
  const entrarCap = (i) => {
    pausaRef.current = false
    if (REDUCIDO) {
      tRef.current = CAPS[i].armado
      pedirRef.current()
      return
    }
    tramoRef.current = [CAPS[i].desde, CAPS[i].hasta]
    tRef.current = CAPS[i].desde
    setAviso(i)
  }
  const salirCap = () => {
    if (REDUCIDO) return
    tramoRef.current = null
    seguir()
  }

  const cap = capDe(beat)
  const beatsDelCap = BEATS.map((b, i) => i).filter((i) => capDe(i) === cap)

  return (
    <section ref={ref} className="ry">
      <header className="ry-cabeza" onMouseEnter={pausar} onMouseLeave={seguir}>
        <div>
          <div className="ry-cejilla">
            <Zap aria-hidden="true" />
            Capa de rayos · GOES-19
          </div>
          <h3 className="ry-titulo">
            Rayos, <span>medidos desde el espacio</span>
          </h3>
        </div>
        <p className="ry-bajada">
          No es un pronóstico de tormentas: son las descargas que el satélite realmente registró, sobre la isla y con su hora.
        </p>
      </header>

      <ol className="ry-capitulos">
        {CAPS.map((c, i) => (
          <li
            key={c.titulo}
            tabIndex={0}
            data-activo={(typeof aviso === 'number' ? aviso : cap) === i || undefined}
            onMouseEnter={() => entrarCap(i)}
            onMouseLeave={salirCap}
            onFocus={() => entrarCap(i)}
            onBlur={salirCap}
            onClick={() => entrarCap(i)}
          >
            <span className="ry-cap-num">0{i + 1}</span>
            <span className="ry-cap-titulo">{c.titulo}</span>
            <i className="ry-cap-barra">
              <b
                ref={(el) => {
                  rellenos.current[i] = el
                }}
              />
            </i>
          </li>
        ))}
      </ol>

      <div ref={escenario} className="ry-escenario" onMouseEnter={pausar} onMouseLeave={seguir}>
        <div className="ry-panel">
          <div className="ry-panel-cap">
            <span>0{cap + 1}</span>
            {CAPS[cap].titulo}
          </div>
          <p key={beat} className="ry-panel-texto">
            {BEATS[beat].texto}
          </p>
          <div className="ry-puntos" aria-hidden="true">
            {beatsDelCap.map((i) => (
              <i key={i} data-on={i === beat || undefined} data-visto={i < beat || undefined} />
            ))}
          </div>
          <div className="ry-pausa" data-visible={aviso !== null ? '' : undefined}>
            {typeof aviso === 'number' ? (
              <>
                <RotateCcw aria-hidden="true" />
                Repite · {CAPS[aviso].titulo}
              </>
            ) : (
              <>
                <i />
                En pausa
              </>
            )}
          </div>
          <p className="ry-panel-nota">Destellos, ráfagas y descargas del dibujo: ilustrativos.</p>
        </div>
        <div ref={escena} className="ry-escena">
          <canvas
            ref={lienzo}
            className="ry-lienzo"
            role="img"
            aria-label="De la órbita de GOES-19 al mapa de Penon: el disco que ve el GLM, un archivo leído por partes, el recorte a la provincia, la intrusión solar y cómo se muestran los rayos"
          />
          <div ref={capaMapa} className="ry-mapa">
            <RayosMapa t={t3} />
          </div>
        </div>
      </div>
      <p className="ry-fuente">
        Fuentes: código de Penon (glm_client.py, intrusion_solar.py, scheduler.py, routers/lightning.py, LightningLayer.tsx). Ventanas
        de intrusión de la noche del 23/09/2026, calculadas con intrusion_solar.py. GLM: NOAA, repositorio público de GOES-19.
      </p>
    </section>
  )
}

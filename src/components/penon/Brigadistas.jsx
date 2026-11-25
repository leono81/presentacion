import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Satellite, WifiOff } from 'lucide-react'
import './brigadistas.css'

/*
 * Próximamente: brigadistas en el mapa con Meshtastic. La imagen es una película renderizada cuadro a
 * cuadro (three.js sobre el relieve real de Copernicus GLO-30, en la zona del incendio Corazón de la
 * Isla de 2022, al norte del Lago Fagnano); todo el texto va
 * en HTML encima, sincronizado con el video por la «pista» que exporta el render: dónde cae cada
 * rótulo en cada cuadro y qué dice el panel. Así se lee nítido en un proyector y en un celular.
 * Fuente de la escena: assets/penon/presentaciones/2026-11-brigadistas-meshtastic (Vincent).
 * Las posiciones son simuladas; la línea de vista entre radios está calculada sobre el relieve real.
 */

const DIR = '/brigadistas/'
const QUIETO = 26.9 // con movimiento reducido: el cuadro final, armado
const REDUCIDO = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

// cada paso es un tramo de la película: con el mouse encima (o tocándolo) arranca desde su principio y
// se repite mientras siga ahí. El 1 empieza con el satélite; el 2, cuando se arman los enlaces; el 3,
// cuando se levanta el relieve (antes del fundido del final).
const TRAMOS = [
  [0, 10],
  [9.8, 15],
  [15, 27.4],
]

const pasos = [
  {
    titulo: 'Sin internet',
    texto: 'Cada brigadista lleva una radio Meshtastic. Entre los brigadistas y el jefe de brigada no hace falta internet ni señal de celular.',
  },
  {
    titulo: 'Red entre radios',
    texto: 'Cada radio retransmite lo que recibe: si un brigadista queda detrás de un cerro, su posición llega al jefe por los demás. El jefe la sube a Penon por Starlink.',
  },
  {
    titulo: 'Sobre el terreno real',
    texto: 'Cada uno aparece sobre el relieve, con su rastro de los últimos minutos y los datos de su equipo: temperatura, presión, batería y última señal.',
  },
]

// rótulos anclados a un punto del mapa: clave de la pista, texto y estilo
const rotulos = [
  { k: 'foco', texto: 'Foco detectado · NOAA-21', corto: 'Foco · NOAA-21', clase: 'br-r-foco' },
  { k: 'zona', texto: 'Simulación en la zona del incendio Corazón de la Isla (2022)', clase: 'br-r-zona' },
  { k: 'lejos', texto: 'Tolhuin, a 32 km →', clase: 'br-r-lejos' },
  { k: 'lago', texto: 'Lago Yehuin', clase: 'br-r-agua' },
  { k: 'jefe', texto: 'Jefe de brigada · Starlink', corto: 'Jefe · Starlink', clase: 'br-r-jefe' },
  { k: 'b1', texto: 'Brigadista 1', corto: 'B1', clase: 'br-r-radio' },
  { k: 'b2', texto: 'Brigadista 2', corto: 'B2', clase: 'br-r-radio' },
  { k: 'b3', texto: 'Brigadista 3', corto: 'B3', clase: 'br-r-radio' },
  { k: 'b4', texto: 'Brigadista 4', corto: 'B4', clase: 'br-r-radio' },
  { k: 'b5', texto: 'Brigadista 5', corto: 'B5', clase: 'br-r-radio' },
  { k: 'bloqueo', texto: 'sin línea directa', clase: 'br-r-bloqueo' },
  { k: 'recibido', texto: 'Posición recibida · 3 saltos', corto: 'Recibida · 3 saltos', clase: 'br-r-recibido' },
  { k: 'starlink', texto: 'Sube a Penon por Starlink', corto: 'Sube por Starlink', clase: 'br-r-starlink' },
  { k: 'satelite', texto: 'Starlink · a Penon', corto: 'Starlink', clase: 'br-r-jefe' },
  { k: 'alerta', texto: 'Brigadista 2 · 34 °C · cerca del frente', corto: 'B2 · 34 °C · frente', clase: 'br-r-alerta' },
]

const coma = (v, d = 1) => v.toFixed(d).replace('.', ',')
const ultima = (s) => (s <= 1 ? 'ahora' : s < 60 ? `hace ${s} s` : `hace ${Math.floor(s / 60)} min`)

export default function Brigadistas() {
  const seccionRef = useRef(null)
  const cuadroRef = useRef(null)
  const videoRef = useRef(null)
  const capaRef = useRef(null)
  const panelRef = useRef(null)
  const [cerca, setCerca] = useState(false)
  const [pista, setPista] = useState(null)
  const [paso, setPaso] = useState(REDUCIDO ? 2 : -1)
  // para presentar: el mouse sobre un paso salta a su tramo y lo repite; sobre el texto de arriba, pausa
  const visibleRef = useRef(false)
  const pausaRef = useRef(false)
  const tramoRef = useRef(null)
  const [aviso, setAviso] = useState(null) // null, 'pausa' o el número de paso que se repite
  const seguir = () => {
    const v = videoRef.current
    if (!v || REDUCIDO) return
    if (visibleRef.current && !pausaRef.current) v.play().catch(() => {})
    else v.pause()
  }
  const sobreTexto = {
    onMouseEnter: () => {
      if (REDUCIDO) return
      pausaRef.current = true
      setAviso('pausa')
      seguir()
    },
    onMouseLeave: () => {
      pausaRef.current = false
      setAviso(null)
      seguir()
    },
  }
  const irAPaso = (i) => {
    const v = videoRef.current
    if (!v || REDUCIDO || !v.src) return
    pausaRef.current = false
    tramoRef.current = TRAMOS[i]
    setAviso(i)
    v.currentTime = TRAMOS[i][0]
    v.play().catch(() => {})
  }
  const soltarPaso = () => {
    tramoRef.current = null
    setAviso(null)
    seguir()
  }
  const [angosto, setAngosto] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(max-width: 900px)').matches)

  useEffect(() => {
    const mq = matchMedia('(max-width: 900px)')
    const cambio = () => setAngosto(mq.matches)
    mq.addEventListener('change', cambio)
    return () => mq.removeEventListener('change', cambio)
  }, [])

  // el video y la pista se piden recién cuando la sección está cerca
  useEffect(() => {
    const el = seccionRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setCerca(true), { rootMargin: '900px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  useEffect(() => {
    if (!cerca) return
    let vivo = true
    fetch(DIR + 'pista.json')
      .then((r) => r.json())
      .then((p) => vivo && setPista(p))
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [cerca])

  // corre solo mientras se ve
  useEffect(() => {
    const v = videoRef.current
    const el = cuadroRef.current
    if (!v || !el || !cerca || REDUCIDO) return
    const io = new IntersectionObserver(
      ([e]) => {
        visibleRef.current = e.isIntersecting
        if (e.isIntersecting && !pausaRef.current) v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [cerca])

  // la capa de texto, cuadro a cuadro con el video
  useEffect(() => {
    const v = videoRef.current
    const capa = capaRef.current
    if (!pista || !v || !capa) return
    const W = pista.w
    const H = pista.h
    const n = pista.n
    const els = Object.fromEntries([...(seccionRef.current?.querySelectorAll('[data-k]') ?? [])].map((e) => [e.dataset.k, e]))
    const anchos = {}
    const filas = [...(panelRef.current?.querySelectorAll('[data-fila]') ?? [])]
    const celdas = filas.map((f) => Object.fromEntries([...f.querySelectorAll('[data-c]')].map((c) => [c.dataset.c, c])))
    const previo = {}
    const poner = (el, clave, texto) => {
      if (previo[clave] !== texto) {
        el.textContent = texto
        previo[clave] = texto
      }
    }
    let ultimoPaso = null

    const aplicar = (t) => {
      const cw = capa.clientWidth
      const ch = capa.clientHeight
      // object-fit: cover, con el foco donde está la acción (a la izquierda del panel)
      const esc = Math.max(cw / W, ch / H)
      const dw = W * esc
      const dh = H * esc
      const ox = (cw - dw) * (angosto ? 0.1 : 0.5)
      const oy = (ch - dh) * 0.5
      const panelVis = angosto ? 0 : (pista.s.panel[Math.floor(Math.min(n - 1, Math.max(0, t * pista.fps)))] ?? 0) / 100
      const panelX = panelVis > 0.05 ? cw - (panelRef.current?.offsetWidth ?? 0) - 40 : cw
      const fi = Math.min(n - 1, Math.max(0, t * pista.fps))
      const i0 = Math.floor(fi)
      const i1 = Math.min(n - 1, i0 + 1)
      const f = fi - i0
      const cierre = (pista.s.cierre[i0] + (pista.s.cierre[i1] - pista.s.cierre[i0]) * f) / 100
      for (const [k, arr] of Object.entries(pista.a)) {
        const el = els[k]
        if (!el) continue
        const x = (arr[i0 * 3] + (arr[i1 * 3] - arr[i0 * 3]) * f) / 10000
        const y = (arr[i0 * 3 + 1] + (arr[i1 * 3 + 1] - arr[i0 * 3 + 1]) * f) / 10000
        let a = (arr[i0 * 3 + 2] + (arr[i1 * 3 + 2] - arr[i0 * 3 + 2]) * f) / 100
        const px = ox + x * dw
        const py = oy + y * dh
        if (px < 8 || px > panelX || py < 8 || py > ch - 8) a = 0
        a *= 1 - 0.85 * cierre
        el.style.opacity = a.toFixed(3)
        el.style.visibility = a > 0.01 ? 'visible' : 'hidden'
        if (a > 0.01) {
          el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`
          // si el rótulo se mete abajo del panel o se sale del cuadro, va a la izquierda del punto
          anchos[k] ??= el.offsetWidth
          el.toggleAttribute('data-izq', px + 20 + anchos[k] > Math.min(panelX, cw - 8))
          // lo que llega al jefe va arriba de él; si ahí está el cartel fijo, va abajo (y lo de Starlink más abajo)
          if (k === 'recibido') {
            const tope = (els.badge?.offsetTop ?? 0) + (els.badge?.offsetHeight ?? 0) + 6
            const abajo = py - 22 - (el.offsetHeight || 26) < tope
            el.toggleAttribute('data-abajo', abajo)
            els.starlink?.toggleAttribute('data-abajo', abajo)
          }
        }
      }
      const s = pista.s
      const val = (arr) => (arr[i0] + (arr[i1] - arr[i0]) * f) / 100
      for (const k of ['badge', 'leyenda', 'cierre', 'panel']) {
        const el = els[k]
        if (!el) continue
        const a = k === 'panel' && angosto ? 1 : val(s[k])
        el.style.opacity = a.toFixed(3)
        el.style.visibility = a > 0.01 ? 'visible' : 'hidden'
      }
      const esca = els.escala
      if (esca) {
        const w = ((s.escala[i0 * 2] + (s.escala[i1 * 2] - s.escala[i0 * 2]) * f) / 10000) * dw
        const a = (s.escala[i0 * 2 + 1] + (s.escala[i1 * 2 + 1] - s.escala[i0 * 2 + 1]) * f) / 100
        esca.style.opacity = a.toFixed(3)
        esca.style.visibility = a > 0.01 ? 'visible' : 'hidden'
        esca.style.setProperty('--ancho', `${w.toFixed(1)}px`)
      }
      if (els.sub) poner(els.sub, 'sub', s.sub[i0] < 0 ? 'conectando…' : s.sub[i0] <= 1 ? 'subido ahora' : `subido hace ${s.sub[i0]} s`)
      const p = s.paso[i0]
      if (p !== ultimoPaso) {
        ultimoPaso = p
        setPaso(p)
      }
      // el panel: valores enteros del cuadro
      filas.forEach((fila, b) => {
        const d = pista.p[b]
        const o = i0 * 7
        const vis = d[o + 6] / 100
        const c = celdas[b]
        fila.style.setProperty('--vis', vis.toFixed(2))
        fila.toggleAttribute('data-alerta', d[o + 5] === 1)
        if (vis <= 0) {
          for (const k of ['temp', 'pres', 'bat', 'ult']) poner(c[k], `${b}${k}`, '—')
          poner(c.saltos, `${b}s`, '')
          return
        }
        poner(c.temp, `${b}temp`, `${coma(d[o] / 10)} °C`)
        poner(c.pres, `${b}pres`, `${d[o + 1]} hPa`)
        poner(c.bat, `${b}bat`, `${d[o + 2]} %`)
        poner(c.ult, `${b}ult`, ultima(d[o + 3]))
        poner(c.saltos, `${b}s`, d[o + 4] ? `vía ${d[o + 4]} saltos` : '')
        fila.toggleAttribute('data-ahora', d[o + 3] <= 1)
      })
    }

    if (REDUCIDO) {
      aplicar(QUIETO)
      const r = () => aplicar(QUIETO)
      addEventListener('resize', r)
      return () => removeEventListener('resize', r)
    }
    let id = 0
    let cancelado = false
    const rvfc = 'requestVideoFrameCallback' in HTMLVideoElement.prototype
    const cuadro = (_, meta) => {
      if (cancelado) return
      const t = meta ? meta.mediaTime : v.currentTime
      // repetir el tramo del paso que tiene el mouse encima
      const tramo = tramoRef.current
      if (tramo && (t >= tramo[1] || t < tramo[0] - 0.2)) v.currentTime = tramo[0]
      aplicar(t)
      id = rvfc ? v.requestVideoFrameCallback(cuadro) : requestAnimationFrame(cuadro)
    }
    id = rvfc ? v.requestVideoFrameCallback(cuadro) : requestAnimationFrame(cuadro)
    aplicar(v.currentTime || 0)
    const r = () => aplicar(v.currentTime || 0)
    addEventListener('resize', r)
    return () => {
      cancelado = true
      if (rvfc) v.cancelVideoFrameCallback(id)
      else cancelAnimationFrame(id)
      removeEventListener('resize', r)
    }
  }, [pista, angosto])

  const src = cerca ? `${DIR}${angosto ? 'brigadistas-1280.mp4' : 'brigadistas-1920.mp4'}` : undefined

  return (
    <div ref={seccionRef} className="br-seccion">
      <div className="br-intro">
        <div>
          <div className="font-mono text-[10px] text-ember/80 tracking-[0.25em] uppercase mb-4">Próximamente · pruebas de campo</div>
          <h3 className="font-display font-800 text-3xl lg:text-5xl tracking-tight text-white-text text-balance">
            Cada brigadista en el mapa, <span className="text-ember">aunque no haya señal</span>
          </h3>
        </div>
        <div className="br-texto" {...sobreTexto}>
          <p>
            Cada brigadista lleva una radio Meshtastic que manda su posición y los datos de su equipo y retransmite los de los demás: una red en
            malla que se arma en el terreno, hasta el jefe de brigada. Él los sube a Penon por Starlink.
          </p>
          <p className="br-estado">
            <span className="font-mono text-[10px] tracking-[0.2em] text-ember/90 mr-2.5">ESTADO</span>
            En desarrollo. Lo que sigue es una simulación sobre el relieve real de la zona del incendio Corazón de la Isla (2022), a 32 km de
            Tolhuin.
          </p>
        </div>
      </div>

      <div className="br-pista">
        <figure className="br-cuadro" ref={cuadroRef}>
          <video
            ref={videoRef}
            className="br-video"
            src={src}
            poster={cerca ? `${DIR}poster.jpg` : undefined}
            muted
            loop
            playsInline
            preload="none"
            aria-label="Simulación: un satélite detecta un foco en la zona del incendio Corazón de la Isla, llega la brigada y sus radios arman una red en malla hasta el jefe de brigada, que sube los datos por Starlink"
          />
          <div className="br-capa" ref={capaRef} aria-hidden="true">
            <div className="br-sombra" />
            {rotulos.map((r) => (
              <span key={r.k} data-k={r.k} className={`br-rotulo ${r.clase}`}>
                {angosto && r.corto ? r.corto : r.texto}
              </span>
            ))}
            <div data-k="badge" className="br-badge">
              <WifiOff className="w-3.5 h-3.5" strokeWidth={2.2} />
              Sin internet · sin señal de celular
            </div>
            <div data-k="escala" className="br-escala">
              <span className="br-escala-linea" />
              1 km
            </div>
            {!angosto && <Leyenda />}
            <div data-k="cierre" className="br-cierre">
              <span>Simulación</span>
              <span className="br-cierre-sep" />
              <span>Pruebas de campo próximamente</span>
            </div>
            <div className="br-sim">Simulación · relieve real: Copernicus GLO-30</div>
            <div className="br-pausa" data-visible={aviso !== null ? '' : undefined}>
              {typeof aviso === 'number' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.2} />
                  Repite · {pasos[aviso].titulo}
                </>
              ) : (
                <>
                  <i />
                  En pausa
                </>
              )}
            </div>
            {!angosto && <Panel panelRef={panelRef} />}
          </div>
        </figure>
        {angosto && (
          <div className="br-panel-afuera">
            <Leyenda />
            <Panel panelRef={panelRef} />
          </div>
        )}

        <ol className="br-pasos">
          {pasos.map((p, i) => (
            <li
              key={p.titulo}
              data-activo={(typeof aviso === 'number' ? aviso : paso) === i ? '' : undefined}
              tabIndex={0}
              aria-label={`${p.titulo}: ver este tramo de la simulación`}
              onMouseEnter={() => irAPaso(i)}
              onMouseLeave={soltarPaso}
              onFocus={() => irAPaso(i)}
              onBlur={soltarPaso}
              onClick={() => irAPaso(i)}
            >
              <span className="br-num">0{i + 1}</span>
              <h4>{p.titulo}</h4>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function Leyenda() {
  return (
    <p data-k="leyenda" className="br-leyenda">
      Cada radio retransmite: si uno queda detrás de un cerro, el mensaje llega por otro.
    </p>
  )
}

function Panel({ panelRef }) {
  return (
    <div data-k="panel" className="br-panel" ref={panelRef}>
      <div className="br-panel-cab">
        <span>Lo que recibe el jefe de brigada</span>
        <span className="br-panel-sim">Simulación</span>
      </div>
      <div className="br-tabla" role="table" aria-label="Datos de cada brigadista">
        <div className="br-fila br-fila-cab" role="row">
          <span role="columnheader">Brigadista</span>
          <span role="columnheader">Temp.</span>
          <span role="columnheader">Presión</span>
          <span role="columnheader">Batería</span>
          <span role="columnheader">Última señal</span>
        </div>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="br-fila" data-fila={n} role="row">
            <span className="br-nombre" role="cell">
              <i />
              Brigadista {n}
            </span>
            <span data-c="temp" role="cell">
              —
            </span>
            <span data-c="pres" role="cell">
              —
            </span>
            <span data-c="bat" role="cell">
              —
            </span>
            <span className="br-ult" role="cell">
              <span data-c="ult">—</span>
              <span data-c="saltos" className="br-saltos" />
            </span>
          </div>
        ))}
      </div>
      <div className="br-subida">
        <Satellite className="w-4 h-4" strokeWidth={1.8} />
        <span>Starlink → Penon</span>
        <span data-k="sub">conectando…</span>
      </div>
    </div>
  )
}

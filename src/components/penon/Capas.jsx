import { Fragment, useEffect, useRef } from 'react'
import isla from './isla.json'
import './capas.css'

/*
 * Todas las capas al mismo tiempo. La misma lámina de howenh-labs.com (Penon.astro), en oscuro:
 * la isla en perspectiva y, con el scroll, cada capa cae y queda apilada sobre la anterior, con su
 * rótulo abajo. Con la pila armada pasa el satélite y, donde barre, aparecen los focos: los del
 * bosque dan alerta, el del yacimiento queda rotulado. Textos según penon-hechos.md (howenh-labs).
 */

// una entrada por capa, en el orden en que caen (la 0 es el suelo, la 5 el satélite). El color de
// cada una es el mismo que esa fuente tiene en el resto de la página.
const leyenda = [
  { nombre: 'Capa territorial', desc: 'La isla y su territorio: IDE Tierra del Fuego, IGN y el relevamiento de rutas del Ministerio de Producción y Ambiente.', color: '#64748B', cuanto: 1, capas: ['Bosque nativo (OTBN)', 'Humedales y turberas', 'Relieve', 'Aguas', 'Rutas y huellas', 'Puntos de ruta', 'Parajes y estancias'] },
  { nombre: 'Capa de peligro FWI', desc: 'El peligro del día en tres zonas, con observaciones del SMN y la carga de la brigada en Tolhuin. El viento es de modelo.', color: '#10B981', cuanto: 0.22, capas: ['Riesgo Incendio', 'Muestras de campo', 'Viento'] },
  { nombre: 'Capa industrial y petrolera', desc: 'Lo que cae en un parque industrial o un yacimiento se rotula: no se descarta.', color: '#F97316', cuanto: 0.16, capas: ['Industrial', 'Petrolera'] },
  { nombre: 'Capa de rayos', desc: 'Las descargas que mide el GLM del GOES-19, revisadas cada 10 minutos.', color: '#22D3EE', cuanto: 0.16, capas: ['Rayos'] },
  { nombre: 'Capa de contexto', desc: 'Lo que hay alrededor de cada foco: quién está cerca, qué se protege y qué ardió antes.', color: '#A78BFA', cuanto: 0.16, capas: ['Áreas Protegidas', 'Poblados', 'Ejidos municipales', 'Emergencias', 'Sitios de fuego', 'Incendios históricos', 'Volteos por viento'] },
  { nombre: 'Capa satelital', desc: 'Focos de calor de NOAA-20 y NOAA-21, directo del bucket público de NOAA cada 10 minutos (entre 45 minutos y 1 hora antes que por FIRMS), y de MODIS vía NASA FIRMS.', color: '#EF4444', cuanto: 1, capas: ['Fuego GOES (10 min)', 'GOES en vivo', 'VIIRS día', 'Satélite HD'] },
]

const proximas = [
  { nombre: 'Avance del fuego', desc: 'Hacia dónde iría el fuego según el viento y el terreno.' },
  { nombre: 'Brigadistas en el mapa', desc: 'La posición de cada brigada sobre el mismo mapa. Pruebas de campo próximamente.' },
]

// ---------- la isla en perspectiva (las mismas cuentas que Penon.astro) ----------
const { proy, capas, zonasD, instalaciones, poblados } = isla
// planta (x al este, y al sur, en km) → pantalla: girada para que la costa atlántica quede
// horizontal con el mar arriba, y acostada. La misma cuenta como matriz, para dibujar la planta.
const GIRO = (-28 * Math.PI) / 180
const ACOSTADA = 0.42
const [cg, sg] = [Math.cos(GIRO), Math.sin(GIRO)]
const pl = ([x, y], z = 0) => [x * cg - y * sg, ACOSTADA * (x * sg + y * cg) - z]
const MATRIZ = `matrix(${cg} ${ACOSTADA * sg} ${-sg} ${ACOSTADA * cg} 0 0)`
const enPlanta = (lon, lat) => [(lon - proy.LON0) * proy.KX, (proy.LAT0 - lat) * proy.KY]
const f1 = (v) => (Math.round(v * 10) / 10).toString()
const pt = (p) => `${f1(p[0])} ${f1(p[1])}`

// cada capa queda apilada PILA unidades arriba de la anterior; antes de caer espera CAIDA más arriba.
// ZSAT: la altura del satélite. TOPE: la cara de arriba de la pila.
const PILA = 4
const CAIDA = 150
const ZSAT = 100
const TOPE = 4 * PILA
const hojas = ['fwi', 'industria', 'rayos', 'contexto'].map((clave, i) => ({ clave, z: (i + 1) * PILA, ...leyenda[i + 1] }))

const puntos = [...(capas.contorno + capas.chileIsla).matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => pl([+m[1], +m[2]]))
const xs = puntos.map((p) => p[0])
const ys = puntos.map((p) => p[1])
const VB = {
  x: Math.min(...xs) - 16,
  y: Math.min(...ys) - ZSAT - 24,
  w: Math.max(...xs) - Math.min(...xs) + 32,
  h: Math.max(...ys) - Math.min(...ys) + ZSAT + 30,
}
const viewBox = `${VB.x} ${VB.y} ${VB.w} ${VB.h}`
const enAlto = (z) => ((z / VB.h) * 100).toFixed(3) // una altura, en % del alto de la lámina
const pct = ([x, y]) => ({ left: `${(((x - VB.x) / VB.w) * 100).toFixed(2)}%`, top: `${(((y - VB.y) / VB.h) * 100).toFixed(2)}%` })

// los rayos del dibujo son ilustrativos: muestran qué trae la capa, no un día real
const rayos = [
  [-67.68, -54.24],
  [-67.05, -54.16],
  [-68.15, -54.47],
  [-66.75, -54.6],
  [-68.0, -53.92],
].map(([lo, la]) => pl(enPlanta(lo, la)))
const rayo = ([x, y]) => `M${f1(x)} ${f1(y)}l2.4 -6.5l-3.2 0.6l2.6 -8`

// la pasada: de sur a norte, inclinada unos 20° hacia el oeste (NOAA-20 de día, ascendente). La línea
// de barrido, perpendicular a la traza, cruza la isla; el satélite va ZSAT más arriba.
const ang = (20 * Math.PI) / 180
const norte = [-Math.sin(ang), -Math.cos(ang)]
const ancho = [Math.cos(ang), -Math.sin(ang)]
const eje = enPlanta(-67.55, -54.33)
const L = 230
const A = 115
const inicio = [eje[0] - norte[0] * L, eje[1] - norte[1] * L]
const fin = [eje[0] + norte[0] * L, eje[1] + norte[1] * L]
const [ini, fn] = [pl(inicio), pl(fin)]
const o0 = pl([0, 0])
const e0 = pl([ancho[0] * A, ancho[1] * A])
const [bx, by] = [e0[0] - o0[0], e0[1] - o0[1]]

// un satélite chico (caja y dos alas) en ejes isométricos, centrado en c
const C30 = Math.cos(Math.PI / 6)
const iso = (x, y, z = 0) => [-C30 * (x + y), 0.5 * (x - y) - z]
const pol = (...pts) => 'M' + pts.map(([a, b]) => `${f1(a)} ${f1(b)}`).join('L') + 'Z'
const sat = (() => {
  const c = [0, -ZSAT]
  const q = (x, y, z) => {
    const [a, b] = iso(x, y, z)
    return [c[0] + a, c[1] + b]
  }
  return {
    cuerpo:
      pol(q(-2.5, -2.5, -2.5), q(2.5, -2.5, -2.5), q(2.5, -2.5, 2.5), q(-2.5, -2.5, 2.5)) +
      pol(q(2.5, -2.5, -2.5), q(2.5, 2.5, -2.5), q(2.5, 2.5, 2.5), q(2.5, -2.5, 2.5)) +
      pol(q(-2.5, -2.5, 2.5), q(2.5, -2.5, 2.5), q(2.5, 2.5, 2.5), q(-2.5, 2.5, 2.5)),
    alas: pol(q(-2.5, -1.5, 0), q(-13, -1.5, 0), q(-13, 1.5, 0), q(-2.5, 1.5, 0)) + pol(q(2.5, -1.5, 0), q(13, -1.5, 0), q(13, 1.5, 0), q(2.5, 1.5, 0)),
  }
})()

// los focos del dibujo, también ilustrativos. u: en qué punto de la pasada los barre la línea.
const focos = [
  { lon: -68.25, lat: -54.4, tipo: 'alerta', rotulo: 'alerta', izquierda: true },
  { lon: -67.55, lat: -54.33, tipo: 'alerta', rotulo: 'alerta' },
  { lon: -67.98, lat: -53.73, tipo: 'rotulado', rotulo: 'rotulado · yacimiento', izquierda: true },
].map((f) => {
  const pf = enPlanta(f.lon, f.lat)
  const u = ((pf[0] - inicio[0]) * norte[0] + (pf[1] - inicio[1]) * norte[1]) / (2 * L)
  return { ...f, u: +u.toFixed(3), p: pl(pf, TOPE) }
})
// sin scroll o con movimiento reducido, el satélite queda sobre el segundo foco
const quieto = [ini[0] + (fn[0] - ini[0]) * focos[1].u, ini[1] + (fn[1] - ini[1]) * focos[1].u]

const NAV = 64 // alto del nav fijo: lo pegado se queda debajo
const PASO = 14000 // ms por pasada del satélite (la pasada ocupa el 80 %; después, un respiro)

export default function Capas() {
  const pistaRef = useRef(null)

  useEffect(() => {
    const pista = pistaRef.current
    if (!pista || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const satEl = pista.querySelector('.cp-satelite')
    const traza = pista.querySelector('.cp-traza')
    const texto = pista.querySelector('.cp-texto')
    const panel = pista.querySelector('.cp-panel')
    const lamina = pista.querySelector('.cp-lamina')
    const hojaEls = [...pista.querySelectorAll('.cp-hoja')]
    const entradas = [...pista.querySelectorAll('.cp-leyenda li')]
    const focoEls = [...pista.querySelectorAll('.cp-foco')]
    const pasoEls = [...pista.querySelectorAll('.cp-paso')]
    const angosto = matchMedia('(max-width: 900px)')
    const largo = traza.getTotalLength()
    const entre = (v) => Math.min(1, Math.max(0, v))
    const suave = (t) => 1 - (1 - t) ** 3

    // el satélite: corre con el reloj, no con el scroll
    let corre = false
    let enPantalla = true
    let t0 = 0
    let cuadro = 0
    const volar = (ahora) => {
      cuadro = 0
      if (!corre || !enPantalla) return
      const t = (ahora - t0) % PASO
      const u = entre(t / (PASO * 0.8))
      const p = traza.getPointAtLength(u * largo)
      satEl.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`)
      satEl.style.opacity = String(entre(u / 0.06) * entre((1 - u) / 0.06))
      // cada pasada vuelve a encontrar los focos; al final del respiro se apagan para la próxima
      focoEls.forEach((f) => f.toggleAttribute('data-visto', u >= +f.dataset.u && t < PASO * 0.96))
      cuadro = requestAnimationFrame(volar)
    }
    const arrancar = () => {
      if (corre) return
      corre = true
      t0 = performance.now()
      pasoEls.forEach((e) => e.setAttribute('data-ve', ''))
      cuadro ||= requestAnimationFrame(volar)
    }
    const parar = () => {
      if (!corre) return
      corre = false
      satEl.style.opacity = '0'
      pasoEls.forEach((e) => e.removeAttribute('data-ve'))
      focoEls.forEach((f) => f.removeAttribute('data-visto'))
    }
    const io = new IntersectionObserver(([v]) => {
      enPantalla = v.isIntersecting
      if (enPantalla && corre) cuadro ||= requestAnimationFrame(volar)
    })
    io.observe(pista)
    satEl.style.opacity = '0' // hasta que la pila esté armada

    // las capas: con el scroll
    let pedido = 0
    const pintar = () => {
      pedido = 0
      const r = pista.getBoundingClientRect()
      // lo que se queda pegado: en ancho, el panel entero; en angosto, la lámina, que va después del texto
      const antes = angosto.matches ? texto.offsetHeight + 24 : 0
      const alto = (angosto.matches ? lamina : panel).offsetHeight
      // 0 cuando lo pegado llega arriba; una unidad por capa y un poco más para que asiente
      const s = entre(-(r.top - NAV + antes) / (r.height - antes - alto)) * 4.4
      hojaEls.forEach((h) => {
        const t = entre((s - +h.dataset.capa + 0.85) / 0.7)
        h.style.setProperty('--t', suave(t).toFixed(3))
        h.style.setProperty('--o', entre(t * 4).toFixed(2))
      })
      entradas.forEach((e, i) => e.toggleAttribute('data-vista', i === 0 || (i < 5 ? s > i - 0.85 : s >= 3.9)))
      pista.toggleAttribute('data-armada', s >= 3.9)
      if (s >= 3.9) arrancar()
      else parar()
    }
    const pedir = () => (pedido ||= requestAnimationFrame(pintar))
    pista.classList.add('cp-con-scroll')
    addEventListener('scroll', pedir, { passive: true })
    addEventListener('resize', pedir)
    pintar()

    return () => {
      removeEventListener('scroll', pedir)
      removeEventListener('resize', pedir)
      io.disconnect()
      cancelAnimationFrame(cuadro)
      cancelAnimationFrame(pedido)
    }
  }, [])

  return (
    <div className="cp-pista" ref={pistaRef}>
      <div className="cp-panel">
        <div className="cp-texto">
          <div className="font-mono text-[10px] text-slate-text/60 tracking-[0.25em] uppercase mb-4">Todas las capas, al mismo tiempo</div>
          <h3 className="font-display font-800 text-3xl lg:text-4xl tracking-tight text-white-text text-balance">
            Un solo mapa, <span className="text-emerald-accent">capa sobre capa</span>
          </h3>
          <p>
            Cada fuente que vimos hace su parte. Penon las apila sobre la isla real para que quien combate el fuego vea cada foco con su
            contexto: el peligro del día en su zona, si cayó en un yacimiento, si hubo rayos cerca y qué hay alrededor.
          </p>
          <p>Cuando pasa el satélite, los focos en el bosque dan alerta y el del yacimiento queda rotulado, sin perderse.</p>
          <blockquote className="cp-principio">Hoy, Penon muestra solo lo observado y medido.</blockquote>
          <p className="cp-estado">
            <span className="font-mono text-[10px] tracking-[0.2em] text-emerald-accent/80 mr-2.5">ESTADO</span>
            En producción en Tierra del Fuego. Lo usan brigadistas y personal de gobierno, con acceso restringido.
          </p>
        </div>

        <figure className="cp-lamina">
          <div className="cp-pila" style={{ maxWidth: `max(320px, calc((100vh - 540px) * ${(VB.w / VB.h).toFixed(3)}))` }}>
            {/* el suelo: la isla entera con su mar, el bosque nativo rayado, los lagos y la costa */}
            <svg className="cp-suelo" viewBox={viewBox} role="img" aria-label="La Isla Grande de Tierra del Fuego en perspectiva, con las capas de Penon apiladas encima">
              <defs>
                <path id="cp-tierra" d={capas.tierra} />
                <path id="cp-chile" d={capas.chileIsla} />
                <pattern id="cp-bosque" width="2.4" height="2.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <path d="M0 0.6H2.4" stroke="var(--cp-tinta-suave)" strokeWidth="0.28" />
                </pattern>
              </defs>
              <g transform={MATRIZ} strokeLinejoin="round" fill="none">
                {['#cp-tierra', '#cp-chile'].map((h) => (
                  <use key={h} href={h} stroke="var(--cp-mar)" strokeWidth="18" vectorEffect="non-scaling-stroke" />
                ))}
                {[7, 4.2, 2].map((d, i) => (
                  <g key={d}>
                    {['#cp-tierra', '#cp-chile'].map((h) => (
                      <use key={h} href={h} stroke="var(--cp-costa)" strokeOpacity={0.35 + i * 0.2} strokeWidth={2 * d + 0.5} vectorEffect="non-scaling-stroke" />
                    ))}
                    {['#cp-tierra', '#cp-chile'].map((h) => (
                      <use key={h + 'm'} href={h} stroke="var(--cp-mar)" strokeWidth={2 * d - 0.5} vectorEffect="non-scaling-stroke" />
                    ))}
                  </g>
                ))}
                {/* el lado chileno, apagado: Penon trabaja del lado argentino */}
                <use href="#cp-chile" fill="var(--cp-papel)" stroke="var(--cp-tinta-suave)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
                <use href="#cp-tierra" fill="var(--cp-tierra)" />
                <path d={capas.bosque} fill="url(#cp-bosque)" />
                <path d={capas.lagos} fill="var(--cp-mar)" stroke="var(--cp-tinta-suave)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                <use href="#cp-tierra" stroke="var(--cp-tinta)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
              </g>
            </svg>

            {/* las capas: cada una es la provincia otra vez, como una hoja transparente, con lo suyo.
                Cada una es un svg aparte que se mueve entero (sin redibujar): cae sobre la pila. */}
            {hojas.map((h, i) => (
              <svg
                key={h.clave}
                className="cp-hoja"
                viewBox={viewBox}
                aria-hidden="true"
                data-capa={i + 1}
                style={{ '--z': enAlto(h.z), '--caida': enAlto(CAIDA), '--lavado': h.color, '--cuanto': h.cuanto }}
              >
                <defs>
                  <path id={`cp-contorno-${i}`} d={capas.contorno} />
                  {h.clave === 'fwi' && (
                    <>
                      <clipPath id="cp-isla">
                        <use href={`#cp-contorno-${i}`} />
                      </clipPath>
                      {[0, 60, 120].map((g, j) => (
                        <pattern key={g} id={`cp-zona-${j}`} width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform={`rotate(${g})`}>
                          <path d="M0 0.8H3.4" stroke={h.color} strokeOpacity="0.55" strokeWidth="0.32" />
                        </pattern>
                      ))}
                    </>
                  )}
                  {h.clave === 'industria' && (
                    <pattern id="cp-industria" width="1.2" height="1.2" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
                      <path d="M0 0.4H1.2" stroke={h.color} strokeWidth="0.45" />
                    </pattern>
                  )}
                  {h.clave === 'contexto' && (
                    <pattern id="cp-puntos" width="3" height="3" patternUnits="userSpaceOnUse">
                      <circle cx="0.8" cy="0.8" r="0.42" fill={h.color} fillOpacity="0.6" />
                      <circle cx="2.3" cy="2.3" r="0.34" fill={h.color} fillOpacity="0.6" />
                    </pattern>
                  )}
                </defs>
                <g transform={MATRIZ} strokeLinejoin="round">
                  <use className="cp-fondo" href={`#cp-contorno-${i}`} stroke={h.color} strokeOpacity="0.5" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
                  {h.clave === 'fwi' && (
                    <g clipPath="url(#cp-isla)">
                      {['norte', 'centro', 'sur'].map((z, j) => (
                        <path key={z} d={zonasD[z]} fill={`url(#cp-zona-${j})`} />
                      ))}
                      <path d={capas.limites} fill="none" stroke={h.color} strokeWidth="0.8" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
                    </g>
                  )}
                  {h.clave === 'industria' && <path d={capas.industria} fill="url(#cp-industria)" stroke={h.color} strokeWidth="0.7" vectorEffect="non-scaling-stroke" />}
                  {h.clave === 'contexto' && (
                    <path d={capas.protegidas} fill="url(#cp-puntos)" stroke={h.color} strokeOpacity="0.7" strokeWidth="0.6" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
                  )}
                </g>
                {h.clave === 'industria' &&
                  instalaciones.map((p, k) => {
                    const [x, y] = pl(p)
                    return <rect key={k} x={f1(x - 1.6)} y={f1(y - 1.6)} width="3.2" height="3.2" fill={h.color} />
                  })}
                {h.clave === 'rayos' && (
                  <g fill="none" stroke={h.color} strokeWidth="0.9" strokeLinejoin="round" strokeLinecap="round">
                    {rayos.map((r, k) => (
                      <Fragment key={k}>
                        <ellipse cx={f1(r[0])} cy={f1(r[1])} rx="3.4" ry="2" strokeOpacity="0.6" strokeWidth="0.6" />
                        <path d={rayo(r)} />
                      </Fragment>
                    ))}
                  </g>
                )}
                {h.clave === 'contexto' &&
                  poblados.map((p, k) => {
                    const [x, y] = pl(p)
                    return <rect key={k} x={f1(x - 2.2)} y={f1(y - 2.2)} width="4.4" height="4.4" fill="var(--cp-papel)" stroke={h.color} strokeWidth="0.8" />
                  })}
              </svg>
            ))}

            {/* arriba de la pila: la pasada del satélite y los focos que va encontrando */}
            <svg className="cp-cielo" viewBox={viewBox} aria-hidden="true">
              <path className="cp-traza cp-paso" d={`M${pt(ini)}L${pt(fn)}`} fill="none" stroke="var(--cp-tinta-suave)" strokeWidth="0.6" strokeDasharray="1 3" opacity="0.8" transform={`translate(0 ${-ZSAT})`} />
              {focos.map((f, i) =>
                f.tipo === 'alerta' ? (
                  <g key={i} className="cp-foco" data-u={f.u}>
                    <ellipse cx={f1(f.p[0])} cy={f1(f.p[1])} rx="2.8" ry="1.7" fill="var(--cp-acento)" />
                    <ellipse cx={f1(f.p[0])} cy={f1(f.p[1])} rx="4" ry="2.3" fill="none" stroke="var(--cp-acento)" strokeWidth="0.8">
                      <animate attributeName="rx" values="3;22" dur="2.6s" begin={`${i * 0.9}s`} repeatCount="indefinite" />
                      <animate attributeName="ry" values="1.7;12.7" dur="2.6s" begin={`${i * 0.9}s`} repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0" dur="2.6s" begin={`${i * 0.9}s`} repeatCount="indefinite" />
                    </ellipse>
                  </g>
                ) : (
                  <g key={i} className="cp-foco" data-u={f.u}>
                    <ellipse cx={f1(f.p[0])} cy={f1(f.p[1])} rx="2.4" ry="1.4" fill="var(--cp-rotulado)" />
                    <rect x={f1(f.p[0] - 6)} y={f1(f.p[1] - 4)} width="12" height="8" fill="none" stroke="var(--cp-rotulado)" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
                  </g>
                ),
              )}
              {/* el satélite, su haz y la línea que barre la isla: pasa solo cuando la pila ya está armada */}
              <g className="cp-satelite" transform={`translate(${pt(quieto)})`}>
                <path d={`M0 ${-ZSAT}L${f1(bx)} ${f1(by)}L${f1(-bx)} ${f1(-by)}Z`} fill="var(--cp-haz)" fillOpacity="0.07" />
                <path d={`M0 ${-ZSAT}L${f1(bx)} ${f1(by)}M0 ${-ZSAT}L${f1(-bx)} ${f1(-by)}`} stroke="var(--cp-haz)" strokeWidth="0.5" opacity="0.35" />
                <path d={`M${f1(bx)} ${f1(by)}L${f1(-bx)} ${f1(-by)}`} stroke="var(--cp-haz)" strokeWidth="0.9" opacity="0.8" />
                <g stroke="var(--cp-tinta)" strokeLinejoin="round" strokeLinecap="round">
                  <path d={sat.alas} fill="var(--cp-papel)" strokeWidth="0.6" />
                  <path d={sat.cuerpo} fill="var(--cp-papel)" strokeWidth="0.6" />
                </g>
                <circle cy={-ZSAT - 4} r="1.3" fill="var(--cp-acento)" />
              </g>
            </svg>
            {focos.map((f, i) => (
              <span
                key={i}
                className={`cp-r-foco cp-foco cp-r-${f.tipo}${f.izquierda ? ' cp-a-izquierda' : ''}`}
                data-u={f.u}
                style={pct([f.p[0] + (f.izquierda ? -9 : 9), f.p[1] - 3])}
              >
                {f.rotulo}
              </span>
            ))}
          </div>

          <ol className="cp-leyenda">
            {leyenda.map((c, i) => (
              <li key={c.nombre} data-capa={i} style={{ '--lavado': c.color }}>
                <span className="cp-nombre">{c.nombre}</span>
                <span className="cp-desc">{c.desc}</span>
                {c.capas && (
                  <span className="cp-chips">
                    {c.capas.map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </span>
                )}
              </li>
            ))}
          </ol>
          <div className="cp-proximas">
            <span className="cp-nombre text-ember">En desarrollo</span>
            <ul>
              {proximas.map((c) => (
                <li key={c.nombre}>
                  <span className="cp-nombre">{c.nombre}</span>
                  <span className="cp-desc">{c.desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="cp-fuentes">27 capas en el mapa de Penon, agrupadas acá en seis, sobre la isla real. Los focos y los rayos del dibujo son ilustrativos. Fuentes: IGN, IDE Tierra del Fuego y Penon.</p>
        </figure>
      </div>
    </div>
  )
}

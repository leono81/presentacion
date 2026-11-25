import { useRef, useState } from 'react'
// eslint-disable-next-line no-unused-vars -- se usa como <motion.*>; el config no tiene jsx-uses-vars
import { motion, useTransform, useMotionValueEvent } from 'framer-motion'
import isla from './isla.json'
import './rayos-mapa.css'

/*
 * Rayos, capítulo 3: cómo se muestran en Penon. La isla con las tres zonas y la clase de peligro del
 * día, las descargas en cian con el borde de su clase, el aviso en pantalla y por Telegram, el
 * silencio de 3 h POR zona y las 24 h en que el punto se atenúa sin apagarse. Todo sale de `t`
 * (segundos locales, MotionValue del padre); no hay reloj propio.
 * Reglas de penonInsight: apps/web/src/components/LightningLayer.tsx (colores, radio, opacidad),
 * LightningAlertBanner.tsx (el aviso), services/api/app/routers/lightning.py (avisan Alto, Muy Alto y
 * Extremo; silencio por zona), config.py (STORM_ALERT_COOLDOWN_HOURS = 3), telegram_bot.py
 * (send_lightning_alert). Las descargas y las clases del día son ilustrativas.
 */

export const MAPA_DUR = 16
export const MAPA_ARMADO = 7.6

// ---------- la isla ----------
const { proy, capas, zonasD } = isla
const enPlanta = (lon, lat) => [(lon - proy.LON0) * proy.KX, (proy.LAT0 - lat) * proy.KY]
// recorte a la provincia (con un margen de mar y del sector chileno)
const CROP = { x: 30, y: 5, w: 305, h: 300 }
const pct = ([x, y]) => ({ left: `${((x - CROP.x) / CROP.w) * 100}%`, top: `${((y - CROP.y) / CROP.h) * 100}%` })

// clases del día: ilustrativas (Norte y Sur con la escala de la zona Norte; Centro con la suya)
const ZONAS = {
  norte: { nombre: 'Norte (Río Grande)', corto: 'Norte', clase: 'Muy Alto', color: '#f97316', fwi: 28, chip: [-68.4, -53.0] },
  centro: { nombre: 'Centro (Tolhuin)', corto: 'Centro', clase: 'Alto', color: '#eab308', fwi: 12, chip: [-68.45, -54.33] },
  sur: { nombre: 'Sur (Ushuaia)', corto: 'Sur', clase: 'Moderado', color: '#3b82f6', chip: [-66.1, -54.73] },
}
const ALERTA = new Set(['Alto', 'Muy Alto', 'Extremo']) // routers/lightning.py, _ALERT_LABELS

// las descargas del dibujo (ilustrativas). at: segundo local en que cae
const DESCARGAS = [
  { zona: 'norte', lon: -68.1, lat: -53.85, at: 1.2 },
  { zona: 'norte', lon: -67.95, lat: -53.7, at: 2.8 },
  { zona: 'norte', lon: -68.25, lat: -53.98, at: 3.3 },
  { zona: 'norte', lon: -67.9, lat: -54.02, at: 3.9 },
  { zona: 'sur', lon: -67.6, lat: -54.78, at: 5.4 },
  { zona: null, lon: -66.8, lat: -53.45, at: 6.2 },
  { zona: 'centro', lon: -67.0, lat: -54.4, at: 7.0 },
].map((d) => ({ ...d, p: enPlanta(d.lon, d.lat) }))
// el aviso sale un poco después de la descarga que lo dispara
const AVISOS = { norte: 1.8, centro: 7.4 }

// ---------- el reloj del mapa ----------
// Hasta 8,5 s corre un minuto por segundo (la tormenta); de 8,5 a 14,5 s avanza 24 h.
const R0 = DESCARGAS[0].at
const FF0 = 8.5
const FF1 = 14.5
const horasFF = (v) => Math.max(0, Math.min(1, (v - FF0) / (FF1 - FF0))) * 24
const minutoMapa = (v) => (v < FF0 ? v - R0 : FF0 - R0 + horasFF(v) * 60)
const edadH = (d, v) => (minutoMapa(v) - (d.at - R0)) / 60
const visible = (d, v) => v >= d.at && edadH(d, v) < 24
const SILENCIO_H = 3 // config.py STORM_ALERT_COOLDOWN_HOURS
const HORA0 = 15 * 60 + 12 // 15:12 UTC, la hora de la primera descarga
const hhmm = (m) => {
  const x = ((Math.floor(m) % 1440) + 1440) % 1440
  return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`
}
const hace = (min) => (min < 60 ? `hace ${Math.max(1, Math.floor(min))} min` : `hace ${Math.floor(min / 60)} h`)
const descargas = (n) => `${n} ${n === 1 ? 'descarga' : 'descargas'}` // LightningAlertBanner.tsx
const clamp = (v) => Math.max(0, Math.min(MAPA_DUR, v))

/** Lo que cambia a saltos: se recalcula con cada `t`, pero solo re-renderiza cuando cambia. */
function discreto(v) {
  const vis = DESCARGAS.filter((d) => visible(d, v))
  const filas = ['norte', 'centro']
    .filter((z) => v >= AVISOS[z] && vis.some((d) => d.zona === z))
    .map((z) => {
      const del = vis.filter((d) => d.zona === z)
      const ultima = del[del.length - 1]
      return { z, total: del.length, hace: hace(minutoMapa(v) - (ultima.at - R0)) }
    })
  const restaN = SILENCIO_H * 60 - (minutoMapa(v) - (AVISOS.norte - R0))
  return {
    n: vis.length,
    filas,
    tg: ['norte', 'centro'].filter((z) => v >= AVISOS[z] && v < FF1 + 0.2),
    chip: v < 2.75 || v >= FF1 ? null : restaN > 0 ? `próximo aviso en ${Math.ceil(restaN / 60)} h` : 'vuelve a avisar',
    chipLibre: restaN <= 0,
    ff: v >= FF0,
    reloj: v >= FF0 ? `+${Math.min(24, Math.floor(horasFF(v)))} h` : `${hhmm(HORA0 + minutoMapa(v))} UTC`,
    sur: v >= 5.6 && v < FF0,
    mar: v >= 6.4 && v < FF0,
    zonaSilencio: v >= 7.5 && v < FF0,
  }
}

/** El rayo que baja y el punto que queda, con la regla de LightningLayer.tsx. */
function Descarga({ t, d }) {
  const op = useTransform(t, (v) => {
    if (!visible(d, v)) return 0
    return Math.min(1, (v - d.at) / 0.12)
  })
  const fresco = (v) => edadH(d, v) < 1
  // relleno: cian claro la primera hora, cian oscuro después; opacidad 0,9 → 0,35 (24 h)
  const fondo = useTransform(t, (v) => {
    const a = Math.max(0.35, 0.9 - Math.max(0, edadH(d, v)) / 30)
    return fresco(v) ? `rgba(34,211,238,${a})` : `rgba(14,116,144,${a})`
  })
  // radio 8 la primera hora, 6 después; borde 3 px con clase, 1 px blanco sin clase
  const borde = d.zona ? 3 : 1
  const lado = useTransform(t, (v) => 2 * (fresco(v) ? 8 : 6) - borde)
  const color = d.zona ? ZONAS[d.zona].color : '#ffffff'
  return (
    <motion.span
      className="rm-punto"
      style={{ ...pct(d.p), opacity: op, background: fondo, width: lado, height: lado, borderWidth: borde, borderColor: color }}
    />
  )
}

function Destello({ t, d }) {
  const op = useTransform(t, [d.at - 0.01, d.at, d.at + 0.14, d.at + 0.5], [0, 1, 1, 0])
  const halo = useTransform(op, (v) => v * 0.3)
  const [x, y] = d.p
  return (
    <g>
      <motion.circle cx={x} cy={y} r={13} fill="#22d3ee" style={{ opacity: halo }} />
      <motion.path d={`M${x + 1.6} ${y - 26}l-6 14h5l-4 12l11-16h-6l5-10z`} fill="#e0f7ff" style={{ opacity: op }} />
    </g>
  )
}

/** Anillo de la cuenta regresiva del silencio de Norte. */
function Anillo({ t }) {
  const resto = useTransform(t, (v) => Math.max(0, Math.min(1, 1 - (minutoMapa(v) - (AVISOS.norte - R0)) / (SILENCIO_H * 60))))
  const largo = 2 * Math.PI * 7
  const off = useTransform(resto, (r) => largo * (1 - r))
  return (
    <svg className="rm-anillo" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="7" fill="none" stroke="rgb(148 163 184 / 0.25)" strokeWidth="2" />
      <motion.circle cx="9" cy="9" r="7" fill="none" stroke={ZONAS.norte.color} strokeWidth="2" strokeDasharray={largo} style={{ strokeDashoffset: off }} transform="rotate(-90 9 9)" />
    </svg>
  )
}

function Telegram({ z, hora }) {
  const zona = ZONAS[z]
  return (
    <div className="rm-tg" style={{ '--rm-c': zona.color }}>
      <div className="rm-tg-de">Penon</div>
      <p className="rm-tg-titulo">⚡ ALERTA: RAYO SOBRE COMBUSTIBLE SECO</p>
      <p className="rm-tg-extra">🕐 {hora} UTC</p>
      <p>🌲 Zona: {zona.nombre}</p>
      <p>
        🔥 FWI de hoy: {zona.fwi} ({zona.clase})
      </p>
    </div>
  )
}

export default function RayosMapa({ t }) {
  const [e, setE] = useState(() => discreto(clamp(t.get())))
  const clave = useRef(JSON.stringify(e))
  useMotionValueEvent(t, 'change', (v) => {
    const nuevo = discreto(clamp(v))
    const k = JSON.stringify(nuevo)
    if (k !== clave.current) {
      clave.current = k
      setE(nuevo)
    }
  })

  const total = useTransform(t, [0, 0.8, FF1 + 0.3, MAPA_DUR], [0, 1, 1, 0])
  // cada zona se ilumina cuando dispara su aviso
  const brilloN = useTransform(t, [AVISOS.norte - 0.1, AVISOS.norte + 0.2, AVISOS.norte + 1.4], [0.07, 0.3, 0.1])
  const brilloC = useTransform(t, [AVISOS.centro - 0.1, AVISOS.centro + 0.2, AVISOS.centro + 1.4], [0.07, 0.3, 0.1])
  // el chip late con cada descarga que NO manda mensaje
  const latido = useTransform(t, [2.8, 2.9, 3.2, 3.3, 3.4, 3.7, 3.9, 4.0, 4.4], [1, 1.07, 1, 1, 1.07, 1, 1, 1.07, 1])
  const peor = e.filas[0] ? ZONAS[e.filas[0].z] : null

  return (
    <motion.div className="rm" style={{ opacity: total }} role="img" aria-label="Así se ven los rayos en Penon: puntos cian con el borde de la clase de peligro de su zona, aviso en pantalla y por Telegram, silencio de 3 horas por zona y 24 horas en el mapa. Rayos y clases ilustrativos.">
      <div className="rm-grilla">
        <div className="rm-celda">
          <div className="rm-mapa">
            <svg viewBox={`${CROP.x} ${CROP.y} ${CROP.w} ${CROP.h}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <path d={capas.chileIsla} fill="#0a1222" stroke="#273449" strokeWidth="0.6" />
              <path d={capas.tierra} fill="#101b2f" stroke="#64748b" strokeWidth="0.8" />
              <path d={capas.lagos} fill="#040915" stroke="#334155" strokeWidth="0.4" />
              <motion.path d={zonasD.norte} fill={ZONAS.norte.color} style={{ fillOpacity: brilloN }} stroke={ZONAS.norte.color} strokeOpacity="0.7" strokeWidth="1" />
              <motion.path d={zonasD.centro} fill={ZONAS.centro.color} style={{ fillOpacity: brilloC }} stroke={ZONAS.centro.color} strokeOpacity="0.7" strokeWidth="1" />
              <path d={zonasD.sur} fill={ZONAS.sur.color} fillOpacity="0.07" stroke={ZONAS.sur.color} strokeOpacity="0.7" strokeWidth="1" />
              {DESCARGAS.map((d, i) => (
                <Destello key={i} t={t} d={d} />
              ))}
            </svg>

            {Object.entries(ZONAS).map(([k, z]) => (
              <span key={k} className="rm-zona" style={{ ...pct(enPlanta(...z.chip)), '--rm-c': z.color }}>
                {z.corto} · <b>{z.clase}</b>
              </span>
            ))}

            {DESCARGAS.map((d, i) => (
              <Descarga key={i} t={t} d={d} />
            ))}

            {e.sur && (
              <span className="rm-rotulo" style={pct(DESCARGAS[4].p)} data-lado="abajo">
                <span className="rm-largo">Moderado: queda en el mapa, no avisa</span>
                <span className="rm-corto">Moderado: no avisa</span>
              </span>
            )}
            {e.mar && (
              <span className="rm-rotulo" style={pct(DESCARGAS[5].p)} data-lado="arriba">
                <span className="rm-largo">Fuera de las zonas: sin clase</span>
                <span className="rm-corto">Sin zona: sin clase</span>
              </span>
            )}
          </div>

          <div className="rm-sello">
            <span aria-hidden="true">⚡</span> Rayos · {e.n} en 24 h
          </div>
          <div className="rm-reloj" data-ff={e.ff || undefined}>
            <span>{e.ff ? 'el mapa avanza' : 'hora del mapa'}</span>
            <b>{e.reloj}</b>
          </div>
        </div>

        <div className="rm-panel">
          <div className="rm-aviso" data-visible={e.filas.length ? '' : undefined} style={{ '--rm-c': peor?.color }}>
            <h4>⚡ Riesgo de ignición por rayo</h4>
            <ul>
              {e.filas.map((f) => (
                <li key={f.z} style={{ '--rm-c': ZONAS[f.z].color }}>
                  <b>
                    <span className="rm-largo">{ZONAS[f.z].nombre}</span>
                    <span className="rm-corto">{ZONAS[f.z].corto}</span>
                  </b>
                  <i>● {ZONAS[f.z].clase}</i>
                  <span>
                    {descargas(f.total)} · última {f.hace}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rm-mensajes">
            <div className="rm-mensajes-rotulo">Telegram · mensaje ilustrativo</div>
            {e.tg.includes('norte') && (
              <div className="rm-fila">
                <Telegram z="norte" hora={hhmm(HORA0 + AVISOS.norte - R0)} />
                {e.chip && (
                  <motion.div className="rm-chip" data-libre={e.chipLibre || undefined} style={{ scale: latido }}>
                    <Anillo t={t} />
                    Norte: {e.chip}
                  </motion.div>
                )}
              </div>
            )}
            {e.tg.includes('centro') && (
              <div className="rm-fila">
                <Telegram z="centro" hora={hhmm(HORA0 + AVISOS.centro - R0)} />
                {e.zonaSilencio && <div className="rm-chip rm-chip-nota">El silencio es por zona</div>}
              </div>
            )}
          </div>

          <div className="rm-pie">
            <div className="rm-edad">
              <span>
                <i style={{ background: '#22d3ee' }} />
                menos de 1 h
              </span>
              <span>
                <i style={{ background: '#0e7490', width: 9, height: 9 }} />
                más viejo
              </span>
              <span className="rm-edad-nota">se atenúa hasta 24 h, no se apaga</span>
            </div>
            <div className="rm-nota">Rayos y clases de peligro ilustrativos</div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

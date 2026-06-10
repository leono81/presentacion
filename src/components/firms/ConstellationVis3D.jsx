import { useRef, useState, useMemo, Suspense, Component } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture, Trail, Html, Stars } from '@react-three/drei'
import * as THREE from 'three'

/** Si WebGL falla (contexto perdido, GPU sin recursos), la ficha sigue sirviendo */
class GlBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono text-[10px] text-slate-text/40 text-center px-6">
            Vista 3D no disponible en este dispositivo.
            <br />Seleccioná un satélite abajo para ver su ficha.
          </span>
        </div>
      )
    }
    return this.props.children
  }
}

const EARTH_R = 1.5

function latLonToXYZ(lat, lon, radius) {
  const phi = (lon + 180) * (Math.PI / 180)
  const theta = (90 - lat) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

/* Datos verificados — los mismos del roster */
const SATS = {
  'Terra': { sensor: 'MODIS · 1 km', orbit: '705 km · 99 min', extra: 'NASA · desde 1999 · retiro previsto 2027', color: '#38BDF8' },
  'Aqua': { sensor: 'MODIS · 1 km', orbit: '705 km · 98,8 min', extra: 'NASA · desde 2002 · retiro previsto 2027', color: '#38BDF8' },
  'Suomi NPP': { sensor: 'VIIRS · 375 m', orbit: '824 km · 101 min', extra: 'NASA/NOAA · desde 2011 · cruce ~13:30', color: '#8B5CF6' },
  'NOAA-20': { sensor: 'VIIRS · 375 m', orbit: '833 km · 14 órb/día', extra: 'JPSS-1 · desde 2017 · 50 min tras Suomi NPP', color: '#8B5CF6' },
  'NOAA-21': { sensor: 'VIIRS · 375 m', orbit: '833 km · 14 órb/día', extra: 'JPSS-2 · en FIRMS desde ene 2024', color: '#A78BFA' },
  'GOES-19': { sensor: 'ABI FDC · 2 km', orbit: 'Geoestacionario · 75,2°O', extra: 'GOES-Este · América cada 10 min', color: '#FBBF24' },
  'GOES-18': { sensor: 'ABI FDC · 2 km', orbit: 'Geoestacionario · 137°O', extra: 'GOES-Oeste · América cada 10 min', color: '#FBBF24' },
}

function Earth({ children }) {
  const ref = useRef()
  const tex = useTexture('/earth-blue-marble.jpg')
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.05 })
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[EARTH_R, 48, 48]} />
        <meshPhongMaterial map={tex} emissiveMap={tex} emissive="#ffffff" emissiveIntensity={0.1} shininess={12} />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_R * 1.04, 48, 48]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
      {/* TdF marker */}
      <mesh position={latLonToXYZ(-54, -68, EARTH_R * 1.01)}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>
      {/* Los geoestacionarios giran CON la Tierra */}
      {children}
    </group>
  )
}

function PolarSat({ name, radius, speed, lonOffset, phase = 0, selected, onSelect }) {
  const ref = useRef()
  const data = SATS[name]
  const lonRad = THREE.MathUtils.degToRad(lonOffset)

  const curve = useMemo(() => {
    const pts = []
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2
      const y = radius * Math.cos(a)
      const z = radius * Math.sin(a)
      pts.push(new THREE.Vector3(z * Math.sin(lonRad), y, z * Math.cos(lonRad)))
    }
    return new THREE.CatmullRomCurve3(pts, true)
  }, [radius, lonRad])

  useFrame(({ clock }) => {
    const a = (clock.elapsedTime * speed + phase) % (Math.PI * 2)
    const y = radius * Math.cos(a)
    const z = radius * Math.sin(a)
    if (ref.current) ref.current.position.set(z * Math.sin(lonRad), y, z * Math.cos(lonRad))
  })

  const isSel = selected === name
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 96, 0.005, 6, true]} />
        <meshBasicMaterial color={data.color} transparent opacity={isSel ? 0.5 : 0.15} />
      </mesh>
      <group ref={ref}>
        <Trail width={0.35} length={4} color={data.color} attenuation={(t) => t * t}>
          <mesh
            onClick={(e) => { e.stopPropagation(); onSelect(name) }}
            onPointerOver={(e) => { e.stopPropagation(); onSelect(name); document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}
          >
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color={data.color} />
          </mesh>
        </Trail>
        {/* halo clickeable más grande que el dot */}
        <mesh visible={false} onClick={(e) => { e.stopPropagation(); onSelect(name) }}>
          <sphereGeometry args={[0.18, 8, 8]} />
          <meshBasicMaterial />
        </mesh>
        {isSel && (
          <mesh>
            <sphereGeometry args={[0.11, 12, 12]} />
            <meshBasicMaterial color={data.color} transparent opacity={0.25} />
          </mesh>
        )}
        <Html position={[0.1, 0.1, 0]} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
            color: data.color, opacity: isSel ? 1 : 0.65,
          }}>{name}</span>
        </Html>
      </group>
    </group>
  )
}

/** Geoestacionario: fijo respecto a la Tierra (va DENTRO del grupo que rota) */
function GeoSat({ name, lon, selected, onSelect }) {
  const dist = EARTH_R * 2.6 // no a escala (35.786 km reales)
  const pos = latLonToXYZ(0, lon, dist)
  const isSel = selected === name

  // Cono de visión: desde el satélite hacia el centro
  const coneQuat = useMemo(() => {
    const dir = pos.clone().negate().normalize()
    const q = new THREE.Quaternion()
    q.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir)
    return q
  }, [pos])
  const coneLen = dist - EARTH_R * 0.6
  const conePos = pos.clone().multiplyScalar(1 - coneLen / (2 * dist))

  return (
    <group>
      <mesh position={conePos} quaternion={coneQuat}>
        <coneGeometry args={[EARTH_R * 0.85, coneLen, 24, 1, true]} />
        <meshBasicMaterial color="#FBBF24" transparent opacity={isSel ? 0.08 : 0.03} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh
        position={pos}
        onClick={(e) => { e.stopPropagation(); onSelect(name) }}
        onPointerOver={(e) => { e.stopPropagation(); onSelect(name); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#FBBF24" />
      </mesh>
      {isSel && (
        <mesh position={pos}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshBasicMaterial color="#FBBF24" transparent opacity={0.25} />
        </mesh>
      )}
      <Html position={[pos.x, pos.y + 0.16, pos.z]} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }} center>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 700,
          color: '#FBBF24', opacity: isSel ? 1 : 0.65,
        }}>{name}</span>
      </Html>
    </group>
  )
}

function Scene({ selected, onSelect }) {
  return (
    <>
      <Stars radius={40} depth={20} count={900} factor={1.8} saturation={0} fade speed={0.3} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 2, 4]} intensity={1.1} />
      <pointLight position={[-3, -1, -2]} intensity={0.3} color="#10B981" />

      <Suspense fallback={null}>
        <Earth>
          <GeoSat name="GOES-19" lon={-75.2} selected={selected} onSelect={onSelect} />
          <GeoSat name="GOES-18" lon={-137} selected={selected} onSelect={onSelect} />
        </Earth>
      </Suspense>

      <PolarSat name="Terra" radius={2.0} speed={0.35} lonOffset={-65} phase={0} selected={selected} onSelect={onSelect} />
      <PolarSat name="Aqua" radius={2.05} speed={0.38} lonOffset={-25} phase={2} selected={selected} onSelect={onSelect} />
      <PolarSat name="Suomi NPP" radius={2.15} speed={0.42} lonOffset={15} phase={4} selected={selected} onSelect={onSelect} />
      <PolarSat name="NOAA-20" radius={2.15} speed={0.42} lonOffset={15} phase={4.8} selected={selected} onSelect={onSelect} />
      <PolarSat name="NOAA-21" radius={2.22} speed={0.45} lonOffset={55} phase={1} selected={selected} onSelect={onSelect} />
    </>
  )
}

export default function ConstellationVis3D() {
  const [selected, setSelected] = useState('Suomi NPP')
  const data = SATS[selected]

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative aspect-square hud-frame rounded-2xl overflow-hidden bg-void/40">
        <GlBoundary>
          <Canvas
            camera={{ position: [0, 1.6, 6.2], fov: 42 }}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true }}
          >
            <Scene selected={selected} onSelect={setSelected} />
          </Canvas>
        </GlBoundary>
        <div className="absolute top-2 left-3 font-mono text-[8px] text-slate-text/40 uppercase tracking-widest pointer-events-none">
          Constelación en vivo · distancias no a escala
        </div>
      </div>

      {/* Ficha del satélite seleccionado */}
      <div className="mt-3 p-3.5 rounded-xl bg-surface-2/40 border border-white/[0.06] min-h-[76px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-display font-800 text-sm" style={{ color: data.color }}>{selected}</span>
          <span className="font-mono text-[9px] text-slate-text/50">{data.orbit}</span>
        </div>
        <div className="font-mono text-[10px] text-slate-text mb-0.5">{data.sensor}</div>
        <div className="font-mono text-[9px] text-slate-text/50">{data.extra}</div>
      </div>

      <div className="mt-2 flex flex-wrap justify-center gap-1.5">
        {Object.keys(SATS).map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`px-2 py-0.5 rounded-full font-mono text-[9px] border transition-colors duration-150 active:scale-[0.97] ${
              selected === name
                ? 'border-white/30 text-white-text bg-white/10'
                : 'border-white/[0.06] text-slate-text/60 hover:text-slate-text'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}

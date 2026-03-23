import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Convert geographic lat/lon to Three.js XYZ for SphereGeometry.
 * Three.js SphereGeometry UV mapping:
 *   phi (horizontal) = (lon + 180) degrees
 *   theta (vertical) = (90 - lat) degrees (colatitude from north pole)
 *   x = -r * cos(phi) * sin(theta)
 *   y = r * cos(theta)
 *   z = r * sin(phi) * sin(theta)
 */
function latLonToXYZ(lat, lon, radius) {
  const phi = (lon + 180) * (Math.PI / 180)
  const theta = (90 - lat) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

function Earth() {
  const groupRef = useRef()
  const earthTexture = useTexture('/earth-blue-marble.jpg')

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06
    }
  })

  return (
    <group ref={groupRef}>
      {/* Textured earth */}
      <mesh>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={earthTexture}
          emissiveMap={earthTexture}
          emissive="#ffffff"
          emissiveIntensity={0.08}
          shininess={15}
          specular="#1a3055"
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh>
        <sphereGeometry args={[2.08, 64, 64]} />
        <meshBasicMaterial color="#10B981" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshBasicMaterial color="#38BDF8" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* TdF marker */}
      <TierraDelFuegoMarker />
    </group>
  )
}

function EarthFallback() {
  const ref = useRef()
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 32, 32]} />
      <meshBasicMaterial color="#0f2847" wireframe transparent opacity={0.3} />
    </mesh>
  )
}

function TierraDelFuegoMarker() {
  const fillRef = useRef()
  const r = 2.04

  // Bounding box: TdF + Malvinas + Islas Atlántico Sur
  const latMin = -55.5, latMax = -51.0
  const lonMin = -70.0, lonMax = -57.0
  const steps = 12 // points per edge for sphere curvature

  // Build rectangle as line segments following the sphere surface
  const linePositions = useMemo(() => {
    const pts = []
    const addEdge = (latA, lonA, latB, lonB) => {
      for (let i = 0; i < steps; i++) {
        const t1 = i / steps
        const t2 = (i + 1) / steps
        const p1 = latLonToXYZ(
          latA + (latB - latA) * t1,
          lonA + (lonB - lonA) * t1, r
        )
        const p2 = latLonToXYZ(
          latA + (latB - latA) * t2,
          lonA + (lonB - lonA) * t2, r
        )
        pts.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z)
      }
    }
    // 4 edges: bottom, right, top, left
    addEdge(latMin, lonMin, latMin, lonMax)
    addEdge(latMin, lonMax, latMax, lonMax)
    addEdge(latMax, lonMax, latMax, lonMin)
    addEdge(latMax, lonMin, latMin, lonMin)
    return new Float32Array(pts)
  }, [])

  // Top-right corner for label anchor
  const labelAnchor = useMemo(() => latLonToXYZ(latMax, lonMax, r), [])

  useFrame(({ clock }) => {
    if (fillRef.current) {
      fillRef.current.material.opacity = 0.06 + Math.sin(clock.elapsedTime * 2) * 0.04
    }
  })

  return (
    <group>
      {/* Rectangle border — thin sharp lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={linePositions}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#10B981" transparent opacity={0.8} />
      </lineSegments>

      {/* Subtle glow fill — slightly larger tube tracing the box */}
      {(() => {
        const fillPts = []
        for (let i = 0; i <= steps; i++) {
          fillPts.push(latLonToXYZ(latMin, lonMin + (lonMax - lonMin) * (i / steps), r))
        }
        for (let i = 0; i <= steps; i++) {
          fillPts.push(latLonToXYZ(latMin + (latMax - latMin) * (i / steps), lonMax, r))
        }
        for (let i = 0; i <= steps; i++) {
          fillPts.push(latLonToXYZ(latMax, lonMax + (lonMin - lonMax) * (i / steps), r))
        }
        for (let i = 0; i <= steps; i++) {
          fillPts.push(latLonToXYZ(latMax + (latMin - latMax) * (i / steps), lonMin, r))
        }
        const curve = new THREE.CatmullRomCurve3(fillPts, true, 'centripetal', 0)
        return (
          <mesh ref={fillRef}>
            <tubeGeometry args={[curve, 60, 0.04, 4, true]} />
            <meshBasicMaterial color="#10B981" transparent opacity={0.08} />
          </mesh>
        )
      })()}

      {/* Label — right next to the rectangle */}
      <group position={labelAnchor}>
        <Html
          position={[0.08, 0.05, 0.05]}
          center={false}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          occlude={false}
          distanceFactor={4}
        >
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '2px',
            padding: '4px 10px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '6px', backdropFilter: 'blur(4px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: '#10B981', boxShadow: '0 0 6px #10B981',
              }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px', fontWeight: 700, color: '#10B981',
                letterSpacing: '0.05em',
              }}>
                Tierra del Fuego
              </span>
            </div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '7px', color: 'rgba(16, 185, 129, 0.6)',
              letterSpacing: '0.08em', paddingLeft: '11px',
            }}>
              Malvinas e Islas del Atlántico Sur
            </span>
          </div>
        </Html>
      </group>
    </group>
  )
}

/**
 * Polar orbit: goes pole-to-pole, tilted by a longitude offset.
 * Real FIRMS satellites (VIIRS/MODIS) are sun-synchronous polar orbiters
 * with ~98° inclination — nearly pole-to-pole.
 * Each orbit passes over a different longitude as Earth rotates.
 */
function PolarOrbit({ color, radius, speed, longitudeOffset, name }) {
  const satRef = useRef()

  const lonRad = THREE.MathUtils.degToRad(longitudeOffset)

  // Build orbit path: a circle in the XZ plane tilted nearly vertical,
  // then rotated around Y axis by the longitude offset
  const curve = useMemo(() => {
    const points = []
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2
      // Circle in Y-localZ plane (polar orbit)
      const localY = radius * Math.cos(angle)
      const localZ = radius * Math.sin(angle)
      // Rotate around Y axis by longitude offset
      const x = localZ * Math.sin(lonRad)
      const y = localY
      const z = localZ * Math.cos(lonRad)
      points.push(new THREE.Vector3(x, y, z))
    }
    return new THREE.CatmullRomCurve3(points, true)
  }, [radius, lonRad])

  useFrame(({ clock }) => {
    const angle = (clock.elapsedTime * speed) % (Math.PI * 2)
    const localY = radius * Math.cos(angle)
    const localZ = radius * Math.sin(angle)
    const x = localZ * Math.sin(lonRad)
    const y = localY
    const z = localZ * Math.cos(lonRad)
    if (satRef.current) satRef.current.position.set(x, y, z)
  })

  return (
    <group>
      {/* Orbit path */}
      <mesh>
        <tubeGeometry args={[curve, 128, 0.008, 8, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.25} />
      </mesh>
      {/* Satellite + label group — moves together */}
      <group ref={satRef}>
        <mesh>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
        {name && (
          <Html
            position={[0.18, 0.12, 0]}
            center={false}
            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
            distanceFactor={5}
          >
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '8px',
              fontWeight: 600,
              color: color,
              opacity: 0.8,
              textShadow: `0 0 8px ${color}40`,
            }}>
              {name}
            </span>
          </Html>
        )}
      </group>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} color="#F8FAFC" />
      <pointLight position={[-4, -2, -3]} intensity={0.4} color="#10B981" />
      <pointLight position={[3, 2, -3]} intensity={0.3} color="#38BDF8" />

      <Suspense fallback={<EarthFallback />}>
        <Earth />
      </Suspense>

      {/* 5 real FIRMS satellites — polar orbits at different longitudes */}
      <PolarOrbit color="#38BDF8" radius={2.35} speed={0.28} longitudeOffset={-68} name="Terra" />
      <PolarOrbit color="#06B6D4" radius={2.42} speed={0.32} longitudeOffset={-30} name="Aqua" />
      <PolarOrbit color="#10B981" radius={2.50} speed={0.36} longitudeOffset={10} name="Suomi NPP" />
      <PolarOrbit color="#8B5CF6" radius={2.57} speed={0.40} longitudeOffset={50} name="NOAA-20" />
      <PolarOrbit color="#A78BFA" radius={2.64} speed={0.44} longitudeOffset={90} name="NOAA-21" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={window.innerWidth >= 768}
        autoRotate
        autoRotateSpeed={0.3}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.7}
      />
    </>
  )
}

export default function GlobeScene() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0.5, 9], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  )
}

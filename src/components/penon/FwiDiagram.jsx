import { motion } from 'framer-motion'

const nodeVariant = (delay) => ({
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { delay, duration: 0.5, ease: 'easeOut' } },
})

const lineVariant = (delay) => ({
  hidden: { pathLength: 0, opacity: 0 },
  visible: { pathLength: 1, opacity: 1, transition: { delay, duration: 0.8, ease: 'easeOut' } },
})

export default function FwiDiagram({ inView }) {
  const animate = inView ? 'visible' : 'hidden'

  return (
    <div className="max-w-4xl mx-auto overflow-x-auto">
      <div className="min-w-[700px] p-4 md:p-6">
        <svg viewBox="0 0 820 420" className="w-full h-auto" aria-label="Diagrama del sistema Fire Weather Index">
          {/* ── Column Headers ── */}
          <text x={95} y={28} textAnchor="middle" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.12em">INPUTS</text>
          <text x={340} y={28} textAnchor="middle" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.12em">CÓDIGOS HUMEDAD</text>
          <text x={560} y={28} textAnchor="middle" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.12em">COMPORTAMIENTO</text>
          <text x={740} y={28} textAnchor="middle" fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.12em">RESULTADO</text>

          {/* ── CONNECTIONS: Inputs → Level 1 ── */}
          <motion.g variants={lineVariant(0.3)} initial="hidden" animate={animate}>
            {/* To FFMC */}
            <FlowLine x1={170} y1={80} x2={260} y2={80} color="#38BDF8" />
            <FlowLine x1={170} y1={150} x2={260} y2={90} color="#38BDF8" />
            <FlowLine x1={170} y1={220} x2={260} y2={100} color="#38BDF8" />
            <FlowLine x1={170} y1={290} x2={260} y2={110} color="#38BDF8" />
            {/* To DMC */}
            <FlowLine x1={170} y1={80} x2={260} y2={200} color="#10B981" />
            <FlowLine x1={170} y1={150} x2={260} y2={210} color="#10B981" />
            <FlowLine x1={170} y1={290} x2={260} y2={220} color="#10B981" />
            {/* To DC */}
            <FlowLine x1={170} y1={80} x2={260} y2={320} color="#8B5CF6" />
            <FlowLine x1={170} y1={290} x2={260} y2={330} color="#8B5CF6" />
          </motion.g>

          {/* ── INPUTS (Level 0) ── */}
          <motion.g variants={nodeVariant(0)} initial="hidden" animate={animate}>
            <InputNode x={30} y={60} label="Temperatura" icon="🌡️" />
            <InputNode x={30} y={130} label="Humedad Rel." icon="💧" />
            <InputNode x={30} y={200} label="Viento" icon="💨" />
            <InputNode x={30} y={270} label="Precipitación" icon="🌧️" />
          </motion.g>

          {/* ── LEVEL 1: Moisture Codes ── */}
          <motion.g variants={nodeVariant(0.5)} initial="hidden" animate={animate}>
            <CodeNode x={260} y={55} label="FFMC" sublabel="Combustible fino ≤2cm" color="#38BDF8" />
            <CodeNode x={260} y={180} label="DMC" sublabel="Materia orgánica 5-10cm" color="#10B981" />
            <CodeNode x={260} y={300} label="DC" sublabel="Sequía 10-20cm" color="#8B5CF6" />
          </motion.g>

          {/* ── CONNECTIONS: Level 1 → Level 2 ── */}
          <motion.g variants={lineVariant(0.8)} initial="hidden" animate={animate}>
            {/* FFMC → ISI */}
            <FlowLine x1={420} y1={85} x2={480} y2={130} color="#38BDF8" />
            {/* Viento → ISI (direct, labeled connection) */}
            <FlowLine x1={170} y1={220} x2={230} y2={220} color="#38BDF8" />
            <FlowLine x1={230} y1={220} x2={450} y2={145} color="#38BDF8" />
            <FlowLine x1={450} y1={145} x2={480} y2={140} color="#38BDF8" />
            <FlowLine x1={420} y1={210} x2={480} y2={275} color="#10B981" />
            <FlowLine x1={420} y1={330} x2={480} y2={285} color="#8B5CF6" />
          </motion.g>

          {/* ── LEVEL 2: Behavior Indices ── */}
          <motion.g variants={nodeVariant(1.0)} initial="hidden" animate={animate}>
            <CodeNode x={480} y={110} label="ISI" sublabel="Vel. propagación" color="#38BDF8" />
            <CodeNode x={480} y={255} label="BUI" sublabel="Combustible disponible" color="#10B981" />
          </motion.g>

          {/* ── CONNECTIONS: Level 2 → FWI ── */}
          <motion.g variants={lineVariant(1.3)} initial="hidden" animate={animate}>
            <FlowLine x1={640} y1={140} x2={680} y2={195} color="#10B981" thick />
            <FlowLine x1={640} y1={285} x2={680} y2={215} color="#10B981" thick />
          </motion.g>

          {/* ── LEVEL 3: FWI ── */}
          <motion.g variants={nodeVariant(1.5)} initial="hidden" animate={animate}>
            <g transform="translate(680, 170)">
              <rect width="110" height="75" rx="14" fill="rgba(16,185,129,0.08)" stroke="#10B981" strokeWidth="2" />
              <motion.rect
                width="110" height="75" rx="14"
                fill="transparent" stroke="#10B981"
                animate={{ strokeOpacity: [0.2, 0.7, 0.2] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                strokeWidth="1.5"
              />
              <text x="55" y="35" textAnchor="middle" fill="#10B981" fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="20">FWI</text>
              <text x="55" y="55" textAnchor="middle" fill="#94A3B8" fontFamily="Inter, sans-serif" fontSize="10">Índice de riesgo</text>
            </g>
          </motion.g>
        </svg>
      </div>
    </div>
  )
}

function InputNode({ x, y, label, icon }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width="140" height="44" rx="10" fill="rgba(30,41,59,0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <text x="22" y="28" fontSize="16">{icon}</text>
      <text x="44" y="28" fill="#F8FAFC" fontFamily="Inter, sans-serif" fontWeight="500" fontSize="12">{label}</text>
    </g>
  )
}

function CodeNode({ x, y, label, sublabel, color }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect width="160" height="65" rx="12" fill={`${color}10`} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" />
      <text x="80" y="30" textAnchor="middle" fill={color} fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="17">{label}</text>
      <text x="80" y="50" textAnchor="middle" fill="#94A3B8" fontFamily="Inter, sans-serif" fontSize="9">{sublabel}</text>
    </g>
  )
}

function FlowLine({ x1, y1, x2, y2, color, thick }) {
  return (
    <motion.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={color}
      strokeWidth={thick ? 2 : 1.2}
      strokeOpacity={thick ? 0.6 : 0.35}
    />
  )
}

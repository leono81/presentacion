import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export default function CountUp({ to, duration = 1.5, separator = '.' }) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!inView || hasAnimated.current) return
    hasAnimated.current = true

    if (to === 0) {
      setCount(0)
      return
    }

    const start = performance.now()
    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / (duration * 1000), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * to))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [inView, to, duration])

  const formatted = separator ? count.toLocaleString('es-AR') : count
  return <span ref={ref}>{formatted}</span>
}

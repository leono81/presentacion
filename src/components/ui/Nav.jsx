import { useState, useEffect } from 'react'

const links = [
  { href: '#problema', label: 'El Problema' },
  { href: '#firms', label: 'FIRMS' },
  { href: '#penon', label: 'Penon Monitor' },
  { href: '#donacion', label: 'Donación' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-void/90 backdrop-blur-xl border-b border-emerald-accent/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <span className="relative w-3 h-3">
            <span className="absolute inset-0 rounded-full bg-emerald-accent animate-ping opacity-40" />
            <span className="relative block w-3 h-3 rounded-full bg-emerald-accent shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
          </span>
          <span className="font-display font-800 text-lg tracking-tight text-white-text">
            PENON
          </span>
          <span className="text-slate-text text-xs font-mono hidden sm:inline">MONITOR</span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-slate-text text-sm font-medium hover:text-white-text transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://penon.howenh-labs.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-accent/10 border border-emerald-accent/30 rounded-lg text-emerald-accent text-sm font-semibold hover:bg-emerald-accent/20 transition-colors"
          >
            Ver en vivo
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-text p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú de navegación"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-void/95 backdrop-blur-xl border-t border-surface-2 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-slate-text text-base font-medium hover:text-white-text transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://penon.howenh-labs.com/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            className="px-4 py-2 bg-emerald-accent/10 border border-emerald-accent/30 rounded-lg text-emerald-accent text-sm font-semibold hover:bg-emerald-accent/20 transition-colors text-center"
          >
            Ver en vivo
          </a>
        </div>
      )}
    </nav>
  )
}

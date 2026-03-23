import { Mail, Phone, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-emerald-accent animate-ping opacity-30" />
              <span className="relative block w-2.5 h-2.5 rounded-full bg-emerald-accent" />
            </span>
            <span className="font-display font-800 text-base text-white-text tracking-tight">
              PENON MONITOR
            </span>
          </div>

          {/* Center info */}
          <div className="text-center">
            <p className="text-slate-text text-sm mb-1">
              Powered by{' '}
              <a
                href="https://howenh-labs.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white-text hover:text-emerald-accent transition-colors font-semibold"
              >
                Howenh Labs
              </a>
            </p>
            <p className="text-slate-text/50 text-xs font-mono">
              -54.8°S, -68.3°W · Tierra del Fuego, Argentina
            </p>
          </div>

          {/* Sources */}
          <div className="text-right text-xs text-slate-text/40">
            <p>Datos: <a href="https://firms.modaps.eosdis.nasa.gov/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-text transition-colors">NASA FIRMS</a></p>
            <p>Meteorología: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-text transition-colors">Open-Meteo</a></p>
            <p>FWI: <a href="https://natural-resources.canada.ca/forest-forestry/wildland-fires/canada-fire-weather-index-system" target="_blank" rel="noopener noreferrer" className="hover:text-slate-text transition-colors">Natural Resources Canada</a></p>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <a href="mailto:leandro.terrado@howenh-labs.com" className="flex items-center gap-2 text-slate-text text-sm hover:text-emerald-accent transition-colors">
            <Mail className="w-4 h-4" />
            leandro.terrado@howenh-labs.com
          </a>
          <a href="tel:+542964404044" className="flex items-center gap-2 text-slate-text text-sm hover:text-emerald-accent transition-colors">
            <Phone className="w-4 h-4" />
            2964-404044
          </a>
          <a href="https://howenh-labs.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-slate-text text-sm hover:text-emerald-accent transition-colors">
            <Globe className="w-4 h-4" />
            howenh-labs.com
          </a>
        </div>

        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-text/30 text-xs">
            Donación al Pueblo Fueguino · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  )
}

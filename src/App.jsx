import { lazy, Suspense } from 'react'
import Nav from './components/ui/Nav'
import Hero from './components/hero/Hero'
import Problema from './components/problema/Problema'
import Footer from './components/footer/Footer'
import Donacion from './components/donacion/Donacion'
import Penon from './components/penon/Penon'
import Alertas from './components/alertas/Alertas'

const Firms = lazy(() => import('./components/firms/Firms'))

export default function App() {
  return (
    <div className="min-h-screen bg-void">
      <Nav />
      <main>
        <Hero />
        <Problema />
        <Suspense fallback={<div className="h-screen bg-void" />}>
          <Firms />
        </Suspense>
        <Penon />
        <Alertas />
        <Donacion />
      </main>
      <Footer />
    </div>
  )
}

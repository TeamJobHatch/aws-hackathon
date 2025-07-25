import Dashboard from '@/components/Dashboard'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen gradient-bg">
      <Header />
      <Dashboard />
      <Footer />
    </main>
  )
} 
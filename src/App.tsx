import { useAuth } from '@/hooks/useAuth'
import PaginaAuth from '@/componentes/PaginaAuth'
import Layout from '@/componentes/Layout'

export default function App() {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    )
  }

  if (!usuario) {
    return <PaginaAuth />
  }

  return <Layout />
}

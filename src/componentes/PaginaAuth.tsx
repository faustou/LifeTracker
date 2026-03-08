import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PaginaAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMensaje(null)
    setCargando(true)

    try {
      if (modo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMensaje('Revisa tu email para confirmar el registro.')
      }
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <div className="w-full max-w-sm p-8 bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">LifeTracker</h1>
          <p className="text-sm text-gray-400 mt-1">
            {modo === 'login' ? 'Inicia sesion en tu cuenta' : 'Crea tu cuenta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Contrasena</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {mensaje && (
            <p className="text-sm text-green-400 bg-green-950/40 border border-green-800/50 rounded-lg px-3 py-2">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-colors"
          >
            {cargando
              ? 'Cargando...'
              : modo === 'login'
                ? 'Iniciar sesion'
                : 'Registrarse'}
          </button>
        </form>

        <p className="mt-5 text-sm text-center text-gray-500">
          {modo === 'login' ? 'No tenes cuenta? ' : 'Ya tenes cuenta? '}
          <button
            onClick={() => { setModo(modo === 'login' ? 'registro' : 'login'); setError(null) }}
            className="text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {modo === 'login' ? 'Registrate' : 'Inicia sesion'}
          </button>
        </p>
      </div>
    </div>
  )
}

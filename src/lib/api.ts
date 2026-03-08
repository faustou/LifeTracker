import { supabase } from './supabase'
import type {
  Actividad,
  Completado,
  ConfiguracionUsuario,
  CrearActividadPayload,
  CrearCompletadoPayload,
  ActualizarConfiguracionPayload,
} from '@/tipos'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function fetchConAuth(path: string, opciones: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const res = await fetch(`${API_URL}${path}`, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Error ${res.status}`)
  }

  if (res.status === 204) return undefined
  return res.json()
}

export const api = {
  actividades: {
    listar: (): Promise<Actividad[]> =>
      fetchConAuth('/api/actividades'),

    crear: (payload: CrearActividadPayload): Promise<Actividad> =>
      fetchConAuth('/api/actividades', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    actualizar: (id: string, payload: Partial<CrearActividadPayload>): Promise<Actividad> =>
      fetchConAuth(`/api/actividades/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),

    eliminar: (id: string): Promise<void> =>
      fetchConAuth(`/api/actividades/${id}`, { method: 'DELETE' }),
  },

  completados: {
    listar: (params: { desde: string; hasta: string }): Promise<Completado[]> =>
      fetchConAuth(`/api/completados?desde=${params.desde}&hasta=${params.hasta}`),

    crear: (payload: CrearCompletadoPayload): Promise<Completado> =>
      fetchConAuth('/api/completados', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    eliminar: (id: string): Promise<void> =>
      fetchConAuth(`/api/completados/${id}`, { method: 'DELETE' }),
  },

  configuracion: {
    obtener: (): Promise<ConfiguracionUsuario> =>
      fetchConAuth('/api/configuracion'),

    actualizar: (payload: ActualizarConfiguracionPayload): Promise<ConfiguracionUsuario> =>
      fetchConAuth('/api/configuracion', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
  },

  rachas: {
    obtener: (actividadId: string): Promise<{ racha: number }> =>
      fetchConAuth(`/api/rachas/${actividadId}`),
  },
}

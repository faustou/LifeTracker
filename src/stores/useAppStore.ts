import { create } from 'zustand'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  addMonths,
  subMonths,
  parseISO,
  min,
  max,
} from 'date-fns'
import type {
  AppStore,
  Completado,
  CrearActividadPayload,
  CrearCompletadoPayload,
  ActualizarConfiguracionPayload,
} from '@/tipos'
import { api } from '@/lib/api'

const mesActualInicial = format(new Date(), 'yyyy-MM')

export const useAppStore = create<AppStore>()((set, get) => ({
  actividades: [],
  completados: [],
  configuracion: null,
  mesActual: mesActualInicial,
  cargando: false,
  error: null,

  cargarDatosMes: async (mes) => {
    set({ cargando: true, error: null })
    try {
      const fechaMes = parseISO(mes + '-01')
      // Rango de la grilla del mes (incluye días de meses adyacentes para completar semanas)
      const inicioGrilla = startOfWeek(startOfMonth(fechaMes), { weekStartsOn: 1 })
      const finGrilla = endOfWeek(endOfMonth(fechaMes), { weekStartsOn: 1 })

      // Siempre incluir la semana actual para que el panel muestre progreso correcto
      const hoy = new Date()
      const inicioSemanaHoy = startOfWeek(hoy, { weekStartsOn: 1 })
      const finSemanaHoy = endOfWeek(hoy, { weekStartsOn: 1 })

      const desde = format(min([inicioGrilla, inicioSemanaHoy]), 'yyyy-MM-dd')
      const hasta = format(max([finGrilla, finSemanaHoy]), 'yyyy-MM-dd')

      const [actividades, completados, configuracion] = await Promise.all([
        api.actividades.listar(),
        api.completados.listar({ desde, hasta }),
        api.configuracion.obtener(),
      ])
      set({ actividades, completados, configuracion, cargando: false })
    } catch (e: unknown) {
      set({ error: (e as Error).message, cargando: false })
    }
  },

  crearActividad: async (payload: CrearActividadPayload) => {
    const nueva = await api.actividades.crear(payload)
    set(s => ({ actividades: [...s.actividades, nueva] }))
  },

  actualizarActividad: async (id, payload) => {
    const anterior = get().actividades.find(a => a.id === id)
    set(s => ({
      actividades: s.actividades.map(a => a.id === id ? { ...a, ...payload } : a),
    }))
    try {
      const actualizada = await api.actividades.actualizar(id, payload)
      set(s => ({
        actividades: s.actividades.map(a => a.id === id ? actualizada : a),
      }))
    } catch (e) {
      if (anterior) {
        set(s => ({ actividades: s.actividades.map(a => a.id === id ? anterior : a) }))
      }
      throw e
    }
  },

  eliminarActividad: async (id) => {
    const anterior = get().actividades
    set(s => ({ actividades: s.actividades.filter(a => a.id !== id) }))
    try {
      await api.actividades.eliminar(id)
    } catch (e) {
      set({ actividades: anterior })
      throw e
    }
  },

  agregarCompletado: async (payload: CrearCompletadoPayload) => {
    const inicioSemana = format(
      startOfWeek(parseISO(payload.fecha_completado), { weekStartsOn: 1 }),
      'yyyy-MM-dd'
    )
    const tempId = `temp-${Date.now()}`
    const tempCompletado: Completado = {
      id: tempId,
      actividad_id: payload.actividad_id,
      usuario_id: '',
      fecha_completado: payload.fecha_completado,
      inicio_semana: inicioSemana,
      notas: payload.notas,
      creada_en: new Date().toISOString(),
    }
    set(s => ({ completados: [...s.completados, tempCompletado] }))
    try {
      const real = await api.completados.crear(payload)
      set(s => ({
        completados: s.completados.map(c => c.id === tempId ? real : c),
      }))
    } catch (e) {
      set(s => ({ completados: s.completados.filter(c => c.id !== tempId) }))
      throw e
    }
  },

  quitarCompletado: async (completadoId) => {
    const anterior = get().completados.find(c => c.id === completadoId)
    set(s => ({ completados: s.completados.filter(c => c.id !== completadoId) }))
    try {
      await api.completados.eliminar(completadoId)
    } catch (e) {
      if (anterior) {
        set(s => ({ completados: [...s.completados, anterior] }))
      }
      throw e
    }
  },

  actualizarConfiguracion: async (payload: ActualizarConfiguracionPayload) => {
    const actualizada = await api.configuracion.actualizar(payload)
    set({ configuracion: actualizada })
  },

  navegarMes: (direccion) => {
    const { mesActual } = get()
    const fecha = parseISO(mesActual + '-01')
    const nueva = direccion === 'siguiente' ? addMonths(fecha, 1) : subMonths(fecha, 1)
    const nuevaMes = format(nueva, 'yyyy-MM')
    set({ mesActual: nuevaMes })
    get().cargarDatosMes(nuevaMes)
  },
}))

import { create } from 'zustand'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  format,
  addMonths,
  subMonths,
  subDays,
  parseISO,
  isSameDay,
  startOfDay,
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

      // 90 días atrás para calcular rachas largas
      const hace90dias = subDays(hoy, 90)
      const desde = format(min([inicioGrilla, inicioSemanaHoy, hace90dias]), 'yyyy-MM-dd')
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
      estado: 'planeado',
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

  confirmarCompletado: async (completadoId) => {
    set(s => ({
      completados: s.completados.map(c =>
        c.id === completadoId ? { ...c, estado: 'cumplido' as const } : c
      ),
    }))
    try {
      const actualizado = await api.completados.confirmar(completadoId)
      set(s => ({
        completados: s.completados.map(c => c.id === completadoId ? actualizado : c),
      }))
    } catch (e) {
      set(s => ({
        completados: s.completados.map(c =>
          c.id === completadoId ? { ...c, estado: 'planeado' as const } : c
        ),
      }))
      throw e
    }
  },

  desconfirmarCompletado: async (completadoId) => {
    set(s => ({
      completados: s.completados.map(c =>
        c.id === completadoId ? { ...c, estado: 'planeado' as const } : c
      ),
    }))
    try {
      const actualizado = await api.completados.desconfirmar(completadoId)
      set(s => ({
        completados: s.completados.map(c => c.id === completadoId ? actualizado : c),
      }))
    } catch (e) {
      set(s => ({
        completados: s.completados.map(c =>
          c.id === completadoId ? { ...c, estado: 'cumplido' as const } : c
        ),
      }))
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

  borrarRacha: async (actividadId) => {
    const hoy = startOfDay(new Date())
    const ayer = subDays(hoy, 1)

    const cumplidos = get().completados
      .filter(c => c.actividad_id === actividadId && c.estado === 'cumplido')
      .map(c => ({ ...c, fechaObj: parseISO(c.fecha_completado) }))
      .sort((a, b) => b.fechaObj.getTime() - a.fechaObj.getTime())

    const tieneHoy = cumplidos.some(c => isSameDay(c.fechaObj, hoy))
    let fechaEsperada = tieneHoy ? hoy : ayer

    const streakIds: string[] = []
    for (const c of cumplidos) {
      if (isSameDay(c.fechaObj, fechaEsperada)) {
        streakIds.push(c.id)
        fechaEsperada = subDays(fechaEsperada, 1)
      } else if (c.fechaObj < fechaEsperada) {
        break
      }
    }

    // Optimistic: marcar todos como planeado
    set(s => ({
      completados: s.completados.map(c =>
        streakIds.includes(c.id) ? { ...c, estado: 'planeado' as const } : c
      ),
    }))
    await Promise.all(streakIds.map(id => api.completados.desconfirmar(id)))
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

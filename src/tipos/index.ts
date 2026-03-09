export type TipoActividad = 'tarea' | 'habito'
export type EstadoCompletado = 'planeado' | 'cumplido'

export interface Actividad {
  id: string
  usuario_id: string
  nombre: string
  tipo: TipoActividad
  duracion_minutos: number
  color: string
  icono?: string
  meta_semanal: number
  archivada: boolean
  orden: number
  creada_en: string
  actualizada_en: string
}

export interface Completado {
  id: string
  actividad_id: string
  usuario_id: string
  fecha_completado: string   // 'YYYY-MM-DD'
  inicio_semana: string      // lunes de esa semana
  estado: EstadoCompletado
  notas?: string
  creada_en: string
}

export interface ConfiguracionUsuario {
  usuario_id: string
  horas_sueno: number
  horas_trabajo: number
  dias_trabajo: number[]     // [1,2,3,4,5] = Lun-Vie (0=Dom, 6=Sab)
  creada_en: string
  actualizada_en: string
}

// Tipos de UI

export interface EstadoSemanalActividad {
  actividad: Actividad
  completados: Completado[]
  cantidad_completados: number
  meta_cumplida: boolean
  racha?: number             // solo para habitos
}

export interface InfoDia {
  fecha: string              // 'YYYY-MM-DD'
  etiqueta: string           // 'Lun 3', 'Mar 4', etc.
  esHoy: boolean
  esDiaTrabajo: boolean
  horas_libres: number
  horas_usadas: number
  completados: Completado[]
}

// Payloads de la API

export interface CrearActividadPayload {
  nombre: string
  tipo: TipoActividad
  duracion_minutos: number
  color: string
  icono?: string
  meta_semanal: number
}

export interface CrearCompletadoPayload {
  actividad_id: string
  fecha_completado: string
  notas?: string
}

export interface ActualizarConfiguracionPayload {
  horas_sueno?: number
  horas_trabajo?: number
  dias_trabajo?: number[]
}

// Store de Zustand

export interface AppStore {
  actividades: Actividad[]
  completados: Completado[]
  configuracion: ConfiguracionUsuario | null
  mesActual: string             // formato 'YYYY-MM'
  cargando: boolean
  error: string | null

  cargarDatosMes: (mes: string) => Promise<void>
  crearActividad: (payload: CrearActividadPayload) => Promise<void>
  actualizarActividad: (id: string, payload: Partial<CrearActividadPayload>) => Promise<void>
  eliminarActividad: (id: string) => Promise<void>
  agregarCompletado: (payload: CrearCompletadoPayload) => Promise<void>
  confirmarCompletado: (completadoId: string) => Promise<void>
  desconfirmarCompletado: (completadoId: string) => Promise<void>
  quitarCompletado: (completadoId: string) => Promise<void>
  borrarRacha: (actividadId: string) => Promise<void>
  actualizarConfiguracion: (payload: ActualizarConfiguracionPayload) => Promise<void>
  navegarMes: (direccion: 'anterior' | 'siguiente') => void
}

// Constantes

export const COLORES_ACTIVIDAD = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
]

export const ICONOS_DEFAULT = [
  '📚', '🏋️', '🧘', '💻', '📖', '🚴',
  '🎨', '🎵', '🍎', '🚭', '💪', '🧠',
  '💤', '🌿', '✍️', '🎯',
]

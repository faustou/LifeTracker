import { getDay, parseISO } from 'date-fns'
import type { Completado, Actividad, ConfiguracionUsuario } from '@/tipos'

export function calcularHorasRestantes(
  fecha: string,
  completadosDia: Completado[],
  actividades: Actividad[],
  configuracion: ConfiguracionUsuario
): number {
  const esDiaLaboral = configuracion.dias_trabajo.includes(getDay(parseISO(fecha)))
  const horasLibres = 24 - configuracion.horas_sueno - (esDiaLaboral ? configuracion.horas_trabajo : 0)
  const horasUsadas = completadosDia.reduce((acc, c) => {
    return acc + (actividades.find(a => a.id === c.actividad_id)?.duracion_minutos ?? 0)
  }, 0) / 60
  return horasLibres - horasUsadas
}

export function colorPorHoras(horas: number): { fondo: string; texto: string; textoSuave: string } {
  if (horas > 3) return { fondo: 'bg-green-50',  texto: 'text-green-600',  textoSuave: 'text-green-400' }
  if (horas > 1) return { fondo: 'bg-yellow-50', texto: 'text-yellow-600', textoSuave: 'text-yellow-400' }
  if (horas > 0) return { fondo: 'bg-red-50',    texto: 'text-red-500',    textoSuave: 'text-red-300' }
  return           { fondo: 'bg-red-100',         texto: 'text-red-700',    textoSuave: 'text-red-400' }
}

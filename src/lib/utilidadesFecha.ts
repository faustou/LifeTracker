import { getDay, isSameDay, parseISO, startOfDay, subDays } from 'date-fns'
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

export function calcularRacha(completados: Completado[], actividadId: string): number {
  const fechasCumplidas = completados
    .filter(c => c.actividad_id === actividadId && c.estado === 'cumplido')
    .map(c => c.fecha_completado)

  if (fechasCumplidas.length === 0) return 0

  const hoy = startOfDay(new Date())
  const ayer = subDays(hoy, 1)

  const ordenadas = [...fechasCumplidas]
    .map(f => parseISO(f))
    .sort((a, b) => b.getTime() - a.getTime())

  const tieneHoy = ordenadas.some(f => isSameDay(f, hoy))
  let fechaEsperada = tieneHoy ? hoy : ayer

  let racha = 0
  for (const fecha of ordenadas) {
    if (isSameDay(fecha, fechaEsperada)) {
      racha++
      fechaEsperada = subDays(fechaEsperada, 1)
    } else if (fecha < fechaEsperada) {
      break
    }
  }
  return racha
}

export function colorPorHoras(horas: number): { fondo: string; texto: string; textoSuave: string } {
  if (horas > 3) return { fondo: 'bg-green-50',  texto: 'text-green-600',  textoSuave: 'text-green-400' }
  if (horas > 1) return { fondo: 'bg-yellow-50', texto: 'text-yellow-600', textoSuave: 'text-yellow-400' }
  if (horas > 0) return { fondo: 'bg-red-50',    texto: 'text-red-500',    textoSuave: 'text-red-300' }
  return           { fondo: 'bg-red-100',         texto: 'text-red-700',    textoSuave: 'text-red-400' }
}

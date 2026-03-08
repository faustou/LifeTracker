import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isWithinInterval,
  parseISO,
} from 'date-fns'
import ColumnaDia from '../ColumnaDia/ColumnaDia'
import NavMes from './NavMes'
import { useAppStore } from '@/stores/useAppStore'

const DIAS_HEADER = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function CalendarioMensual() {
  const { mesActual, completados, actividades, configuracion } = useAppStore()

  const fechaMes = parseISO(mesActual + '-01')
  const diasGrilla = eachDayOfInterval({
    start: startOfWeek(startOfMonth(fechaMes), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(fechaMes), { weekStartsOn: 1 }),
  })

  const numSemanas = diasGrilla.length / 7

  // Semana activa: solo cuando el mes visible contiene el mes actual
  const hoy = new Date()
  const mesActualEsElDeHoy = isSameMonth(fechaMes, hoy)
  const inicioSemanaActiva = startOfWeek(hoy, { weekStartsOn: 1 })
  const finSemanaActiva = endOfWeek(hoy, { weekStartsOn: 1 })

  const esSemanaActiva = (dia: Date) =>
    mesActualEsElDeHoy &&
    isWithinInterval(dia, { start: inicioSemanaActiva, end: finSemanaActiva })

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-white">
      <NavMes />

      {/* Header con nombres de días */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-white shrink-0">
        {DIAS_HEADER.map(dia => (
          <div
            key={dia}
            className="text-center py-2 text-xs font-medium text-gray-400 uppercase tracking-wide border-r border-gray-100 last:border-r-0"
          >
            {dia}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div
        className="flex-1 grid grid-cols-7 overflow-hidden bg-gray-50"
        style={{ gridTemplateRows: `repeat(${numSemanas}, minmax(0, 1fr))` }}
      >
        {diasGrilla.map(dia => {
          const fechaStr = format(dia, 'yyyy-MM-dd')
          const esDelMes = isSameMonth(dia, fechaMes)
          return (
            <ColumnaDia
              key={fechaStr}
              fecha={fechaStr}
              completadosDia={completados.filter(c => c.fecha_completado === fechaStr)}
              actividades={actividades}
              configuracion={configuracion}
              esDelMes={esDelMes}
              esSemanaActiva={esSemanaActiva(dia)}
            />
          )
        })}
      </div>
    </div>
  )
}

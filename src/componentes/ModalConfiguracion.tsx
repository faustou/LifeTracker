import { useState } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

interface Props {
  onCerrar: () => void
}

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

export default function ModalConfiguracion({ onCerrar }: Props) {
  const { configuracion, actualizarConfiguracion } = useAppStore()
  const [horasSueno, setHorasSueno] = useState(configuracion?.horas_sueno ?? 8)
  const [horasTrabajo, setHorasTrabajo] = useState(configuracion?.horas_trabajo ?? 8)
  const [diasTrabajo, setDiasTrabajo] = useState<number[]>(
    configuracion?.dias_trabajo ?? [1, 2, 3, 4, 5]
  )
  const [guardando, setGuardando] = useState(false)

  const toggleDia = (dia: number) => {
    setDiasTrabajo(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia].sort((a, b) => a - b)
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    await actualizarConfiguracion({
      horas_sueno: horasSueno,
      horas_trabajo: horasTrabajo,
      dias_trabajo: diasTrabajo,
    })
    setGuardando(false)
    onCerrar()
  }

  const horasLibresPromedio = 24 - horasSueno - horasTrabajo

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Configuracion</h2>
          <button
            onClick={onCerrar}
            className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-400">Horas de sueño</label>
              <span className="text-sm font-medium text-white">{horasSueno}h</span>
            </div>
            <input
              type="range"
              min={4}
              max={12}
              step={0.5}
              value={horasSueno}
              onChange={e => setHorasSueno(+e.target.value)}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs text-gray-400">Horas de trabajo</label>
              <span className="text-sm font-medium text-white">{horasTrabajo}h</span>
            </div>
            <input
              type="range"
              min={0}
              max={16}
              step={0.5}
              value={horasTrabajo}
              onChange={e => setHorasTrabajo(+e.target.value)}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">Dias de trabajo</label>
            <div className="flex gap-1">
              {DIAS_SEMANA.map((nombre, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDia(i)}
                  className={cn(
                    'flex-1 py-1.5 rounded text-xs font-medium transition-colors',
                    diasTrabajo.includes(i)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-500 hover:text-gray-300'
                  )}
                >
                  {nombre}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/60 rounded-xl p-3 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Horas libres promedio</span>
              <span className={cn(
                'font-medium',
                horasLibresPromedio > 4 ? 'text-green-400' :
                horasLibresPromedio > 1 ? 'text-yellow-400' : 'text-red-400'
              )}>
                {horasLibresPromedio.toFixed(1)}h / dia
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useDraggable } from '@dnd-kit/core'
import { useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import type { Actividad } from '@/tipos'

interface Props {
  actividad: Actividad
  cumplidosSemana: number
  planeadosSemana: number
  racha: number
  onEditar: () => void
  compacta?: boolean
}

function icoRacha(racha: number) {
  if (racha >= 30) return '🔥🔥🔥'
  if (racha >= 7) return '🔥🔥'
  return '🔥'
}

export default function TarjetaActividad({ actividad, cumplidosSemana, planeadosSemana, racha, onEditar, compacta }: Props) {
  const { borrarRacha } = useAppStore()
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: actividad.id,
    data: { type: 'actividad', actividad },
  })

  const metaCumplida = cumplidosSemana >= actividad.meta_semanal
  const pctCumplidos = Math.min(100, (cumplidosSemana / actividad.meta_semanal) * 100)
  const pctPlaneados = Math.min(100 - pctCumplidos, (planeadosSemana / actividad.meta_semanal) * 100)

  // Tarjeta compacta horizontal para mobile bottom sheet
  if (compacta) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className={cn(
          'flex flex-col items-center gap-1.5 p-2 rounded-xl border cursor-grab select-none shrink-0 w-[72px] transition-all',
          metaCumplida
            ? 'border-green-600/50 bg-green-950/30'
            : 'border-gray-700/60 bg-gray-800/50',
          isDragging && 'opacity-30 cursor-grabbing'
        )}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0"
          style={{ backgroundColor: actividad.color }}
        >
          {actividad.icono || actividad.nombre[0]}
        </div>
        <p className="text-[10px] text-gray-300 truncate w-full text-center leading-tight">
          {actividad.nombre}
        </p>
        <div className="w-full h-0.5 bg-gray-700 rounded-full overflow-hidden flex">
          <div className="h-full" style={{ width: `${pctCumplidos}%`, backgroundColor: actividad.color }} />
          <div className="h-full opacity-30" style={{ width: `${pctPlaneados}%`, backgroundColor: actividad.color }} />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'group relative p-3 rounded-xl border cursor-grab select-none transition-all',
        metaCumplida
          ? 'border-green-600/50 bg-green-950/30'
          : 'border-gray-700/60 bg-gray-800/50 hover:border-gray-600',
        isDragging && 'opacity-30 cursor-grabbing'
      )}
    >
      <div className="flex items-start gap-2.5">
        {actividad.icono && (
          <span className="text-lg mt-0.5 leading-none">{actividad.icono}</span>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'text-sm font-medium truncate',
                metaCumplida ? 'text-green-300' : 'text-gray-100'
              )}
            >
              {actividad.nombre}
            </span>
            {metaCumplida && <Check size={12} className="text-green-400 shrink-0" />}
          </div>

          <div className="text-xs text-gray-500 mt-0.5">
            {actividad.duracion_minutos >= 60
              ? `${(actividad.duracion_minutos / 60).toFixed(1)}h`
              : `${actividad.duracion_minutos}min`}
            {' · '}
            {actividad.meta_semanal}x/sem
          </div>

          {racha >= 1 && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-xs font-medium text-orange-500">
                {icoRacha(racha)} {racha} día{racha > 1 ? 's' : ''} de racha
              </p>
              {confirmandoBorrar ? (
                <>
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); borrarRacha(actividad.id); setConfirmandoBorrar(false) }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-medium hover:bg-red-500 transition-colors"
                  >
                    Sí, borrar
                  </button>
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); setConfirmandoBorrar(false) }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition-colors"
                  >
                    No
                  </button>
                </>
              ) : (
                <button
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); setConfirmandoBorrar(true) }}
                  className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
                  title="Borrar racha"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          <div className="mt-2">
            {metaCumplida ? (
              <span className="text-xs font-semibold text-green-400">COMPLETO</span>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden flex">
                    <div className="h-full transition-all duration-300" style={{ width: `${pctCumplidos}%`, backgroundColor: actividad.color }} />
                    <div className="h-full transition-all duration-300 opacity-30" style={{ width: `${pctPlaneados}%`, backgroundColor: actividad.color }} />
                  </div>
                  <span className="text-xs text-gray-500 tabular-nums shrink-0">
                    {cumplidosSemana}/{actividad.meta_semanal}
                  </span>
                </div>
                {planeadosSemana > 0 && (
                  <p className="text-[10px] text-gray-600">
                    📅 {planeadosSemana} planeado{planeadosSemana > 1 ? 's' : ''}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Indicador de color */}
      <div
        className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
        style={{ backgroundColor: actividad.color }}
      />

      {/* Boton editar */}
      <button
        onClick={e => { e.stopPropagation(); onEditar() }}
        onPointerDown={e => e.stopPropagation()}
        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-700 text-gray-500 hover:text-white transition-all"
        title="Editar"
      >
        <Pencil size={11} />
      </button>
    </div>
  )
}

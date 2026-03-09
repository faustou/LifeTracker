import { useDraggable } from '@dnd-kit/core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import { usarLongPress } from '@/hooks/usarLongPress'
import type { Completado, Actividad } from '@/tipos'

interface Props {
  completado: Completado
  actividad: Actividad
}

export default function ChipCompletado({ completado, actividad }: Props) {
  const { quitarCompletado, confirmarCompletado, desconfirmarCompletado } = useAppStore()
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null)
  const chipRef = useRef<HTMLDivElement | null>(null)

  const esCumplido = completado.estado === 'cumplido'

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: completado.id,
    data: { type: 'completado', completado },
  })

  // Long press: planeado → cumplido, cumplido → planeado
  const { presionando, suprimirClickRef, cancelar, handlers: lpHandlers } = usarLongPress(
    () => esCumplido ? desconfirmarCompletado(completado.id) : confirmarCompletado(completado.id),
    500
  )

  // Cancelar long press si el drag empieza
  useEffect(() => {
    if (isDragging) cancelar()
  }, [isDragging, cancelar])

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    chipRef.current = node
    setNodeRef(node)
  }, [setNodeRef])

  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) return
    if (suprimirClickRef.current) { suprimirClickRef.current = false; return }
    e.stopPropagation()
    if (popupPos) { setPopupPos(null); return }
    const rect = chipRef.current?.getBoundingClientRect()
    if (rect) {
      setPopupPos({
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - 170),
      })
    }
  }

  useEffect(() => {
    if (!popupPos) return
    const close = () => setPopupPos(null)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [Boolean(popupPos)])

  const duracionLabel = actividad.duracion_minutos >= 60
    ? `${(actividad.duracion_minutos / 60).toFixed(1)}h`
    : `${actividad.duracion_minutos}min`

  const tieneIcono = Boolean(actividad.icono)

  const longPressProps = lpHandlers

  return (
    <>
      <div
        ref={setRefs}
        style={
          esCumplido
            ? { backgroundColor: actividad.color }
            : { borderColor: actividad.color, backgroundColor: 'transparent' }
        }
        {...listeners}
        {...attributes}
        {...longPressProps}
        onClick={handleClick}
        className={cn(
          'group relative flex items-center justify-center cursor-grab select-none transition-opacity',
          tieneIcono ? 'h-5 w-5 rounded' : 'h-5 w-5 rounded-full',
          esCumplido ? '' : 'border-2',
          isDragging ? 'opacity-20 cursor-grabbing' : 'hover:brightness-110',
          'min-h-[20px] min-w-[20px] md:min-h-0 md:min-w-0'
        )}
      >
        {tieneIcono && (
          <span className={cn('text-[10px] leading-none', !esCumplido && 'opacity-60')}>
            {actividad.icono}
          </span>
        )}

        {/* Tilde cumplido */}
        {esCumplido && (
          <span className="absolute top-0 right-0.5 text-white text-[8px] font-bold leading-none">
            ✓
          </span>
        )}

        {/* Anillo de progreso long press */}
        {presionando && (
          <svg
            width="20"
            height="20"
            className="absolute inset-0 pointer-events-none animate-ring-progress"
            style={{ animation: 'ring-progress 500ms linear forwards' }}
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke={actividad.color}
              strokeWidth="2"
              strokeDasharray="50.3"
              strokeLinecap="round"
              transform="rotate(-90 10 10)"
            />
          </svg>
        )}

        {/* Tooltip desktop */}
        <div
          className={cn(
            'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50',
            'pointer-events-none select-none whitespace-nowrap',
            'bg-gray-900 text-white text-xs px-2 py-1 rounded-lg shadow-lg',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-300',
            'hidden md:block'
          )}
        >
          {actividad.nombre} · {duracionLabel}
          <span className="ml-1 opacity-60">
            {esCumplido ? '(mantené para destilar)' : '(mantené para confirmar)'}
          </span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-gray-900" />
        </div>
      </div>

      {/* Popup click/tap */}
      {popupPos && createPortal(
        <div
          style={{ top: popupPos.top, left: popupPos.left, position: 'fixed' }}
          className="z-[200] bg-white rounded-xl shadow-xl border border-gray-100 p-3 min-w-[160px]"
          onPointerDown={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-sm shrink-0"
              style={{ backgroundColor: actividad.color }}
            >
              {tieneIcono ? actividad.icono : null}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                {actividad.nombre}
              </p>
              <p className="text-xs text-gray-400">
                {duracionLabel} · {esCumplido ? 'Cumplido' : 'Planeado'}
              </p>
            </div>
          </div>

          {esCumplido ? (
            <button
              onClick={() => { desconfirmarCompletado(completado.id); setPopupPos(null) }}
              className="w-full py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors mb-1"
            >
              Marcar como planeado
            </button>
          ) : (
            <button
              onClick={() => { confirmarCompletado(completado.id); setPopupPos(null) }}
              className="w-full py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mb-1"
            >
              Marcar como cumplido
            </button>
          )}
          <button
            onClick={() => { quitarCompletado(completado.id); setPopupPos(null) }}
            className="w-full py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Quitar
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

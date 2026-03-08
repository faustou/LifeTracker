import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { COLORES_ACTIVIDAD, ICONOS_DEFAULT } from '@/tipos'
import type { CrearActividadPayload } from '@/tipos'
import { cn } from '@/lib/utils'

interface Props {
  actividadId: string | null
  onCerrar: () => void
}

// Estado interno con strings para los campos numericos (permite borrar libremente)
interface FormState {
  nombre: string
  tipo: 'tarea' | 'habito'
  duracion_minutos: string
  meta_semanal: string
  color: string
  icono: string
}

const FORM_DEFAULTS: FormState = {
  nombre: '',
  tipo: 'tarea',
  duracion_minutos: '30',
  meta_semanal: '3',
  color: '#6366f1',
  icono: '',
}

export default function ModalActividad({ actividadId, onCerrar }: Props) {
  const { actividades, crearActividad, actualizarActividad, eliminarActividad } = useAppStore()
  const existente = actividades.find(a => a.id === actividadId)

  const [form, setForm] = useState<FormState>(
    existente
      ? {
          nombre: existente.nombre,
          tipo: existente.tipo,
          duracion_minutos: String(existente.duracion_minutos),
          color: existente.color,
          icono: existente.icono ?? '',
          meta_semanal: String(existente.meta_semanal),
        }
      : FORM_DEFAULTS
  )
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setGuardando(true)
    setError(null)
    try {
      const payload: CrearActividadPayload = {
        nombre: form.nombre,
        tipo: form.tipo,
        color: form.color,
        icono: form.icono?.trim() || undefined,
        duracion_minutos: Math.max(5, Math.min(480, parseInt(form.duracion_minutos) || 30)),
        meta_semanal: Math.max(1, Math.min(7, parseInt(form.meta_semanal) || 1)),
      }
      if (existente) {
        await actualizarActividad(existente.id, payload)
      } else {
        await crearActividad(payload)
      }
      onCerrar()
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  const handleEliminar = async () => {
    if (!existente) return
    if (!confirm(`Eliminar "${existente.nombre}"? Se borraran todos sus registros.`)) return
    await eliminarActividad(existente.id)
    onCerrar()
  }

  return (
    // Overlay: en mobile alinea al fondo, en desktop centra
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center sm:justify-center sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onCerrar() }}
    >
      {/* Modal */}
      <div
        className={cn(
          'w-full flex flex-col bg-gray-900 border border-gray-700 shadow-2xl',
          // Mobile: bottom sheet
          'h-[90vh] rounded-t-2xl animate-slide-up',
          // Desktop: modal centrado normal
          'sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-2xl sm:animate-none',
        )}
      >
        {/* Handle — solo mobile */}
        <div className="mx-auto w-10 h-1 bg-gray-700 rounded-full mt-2.5 mb-1 sm:hidden shrink-0" />

        {/* Header fijo */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800 shrink-0">
          <h2 className="text-base font-semibold text-white">
            {existente ? 'Editar actividad' : 'Nueva actividad'}
          </h2>
          <button
            onClick={onCerrar}
            className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo scrolleable */}
        <form
          id="form-actividad"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0"
        >
          {/* Nombre */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Nombre</label>
            <input
              type="text"
              value={form.nombre}
              onChange={e => set('nombre', e.target.value)}
              onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Ej: Estudiar ingles"
              autoFocus
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {(['tarea', 'habito'] as const).map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => set('tipo', tipo)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                    form.tipo === tipo
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  )}
                >
                  {tipo === 'tarea' ? 'Tarea' : 'Habito'}
                </button>
              ))}
            </div>
          </div>

          {/* Duracion y Meta */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1.5">Duracion (min)</label>
              <input
                type="number"
                value={form.duracion_minutos}
                onChange={e => set('duracion_minutos', e.target.value)}
                onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                onBlur={e => {
                  const v = parseInt(e.target.value)
                  if (isNaN(v) || v < 5) set('duracion_minutos', '5')
                  else if (v > 480) set('duracion_minutos', '480')
                }}
                min={5}
                max={480}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1.5">Meta semanal</label>
              <input
                type="number"
                value={form.meta_semanal}
                onChange={e => set('meta_semanal', e.target.value)}
                onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                onBlur={e => {
                  const v = parseInt(e.target.value)
                  if (isNaN(v) || v < 1) set('meta_semanal', '1')
                  else if (v > 7) set('meta_semanal', '7')
                }}
                min={1}
                max={7}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORES_ACTIVIDAD.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => set('color', color)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-transform hover:scale-110',
                    form.color === color && 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Icono */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Icono (opcional)</label>
            <div className="flex gap-1.5 flex-wrap">
              {ICONOS_DEFAULT.map(icono => (
                <button
                  key={icono}
                  type="button"
                  onClick={() => set('icono', form.icono === icono ? '' : icono)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors',
                    form.icono === icono
                      ? 'bg-indigo-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  )}
                >
                  {icono}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </form>

        {/* Footer fijo */}
        <div className="px-5 py-4 border-t border-gray-800 flex gap-2 shrink-0">
          {existente && (
            <button
              type="button"
              onClick={handleEliminar}
              className="p-2 rounded-lg hover:bg-red-950/40 text-gray-600 hover:text-red-400 transition-colors"
              title="Eliminar actividad"
            >
              <Trash2 size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={onCerrar}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-actividad"
            disabled={guardando || !form.nombre.trim()}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {guardando ? 'Guardando...' : existente ? 'Guardar cambios' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  )
}

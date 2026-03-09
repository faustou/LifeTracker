import { useCallback, useRef, useState } from 'react'

export function usarLongPress(callback: () => void, duracion = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const [presionando, setPresionando] = useState(false)
  const suprimirClickRef = useRef(false)

  const iniciar = useCallback(() => {
    suprimirClickRef.current = false
    setPresionando(true)
    timerRef.current = setTimeout(() => {
      suprimirClickRef.current = true
      setPresionando(false)
      navigator.vibrate?.(30)
      callback()
    }, duracion)
  }, [callback, duracion])

  const cancelar = useCallback(() => {
    setPresionando(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  return {
    presionando,
    suprimirClickRef,
    cancelar,
    handlers: {
      onMouseDown: iniciar,
      onMouseUp: cancelar,
      onMouseLeave: cancelar,
      onTouchStart: iniciar,
      onTouchEnd: cancelar,
      onTouchMove: cancelar,
    },
  }
}

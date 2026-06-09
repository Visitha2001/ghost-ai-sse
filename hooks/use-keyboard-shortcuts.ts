import { useEffect } from 'react'
import { useReactFlow } from '@xyflow/react'

interface UseKeyboardShortcutsProps {
  undo: () => void
  redo: () => void
}

export function useKeyboardShortcuts({ undo, redo }: UseKeyboardShortcutsProps) {
  const { zoomIn, zoomOut } = useReactFlow()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable
      ) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (e.key === '=' || e.key === '+') {
        zoomIn({ duration: 200 })
      } else if (e.key === '-') {
        zoomOut({ duration: 200 })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, zoomIn, zoomOut])
}

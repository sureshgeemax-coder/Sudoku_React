import type { StatusTone } from '../hooks/useSudokuGame'

interface GameStatusProps {
  message: string
  tone: StatusTone
  completed: boolean
}

export function GameStatus({ message, tone, completed }: GameStatusProps) {
  return (
    <div className={`game-status ${tone}`} role="status" aria-live="polite" aria-atomic="true">
      <span className="status-kicker">{completed ? 'Puzzle complete' : tone === 'error' ? 'Check the board' : 'Game status'}</span>
      <p>{message}</p>
    </div>
  )
}

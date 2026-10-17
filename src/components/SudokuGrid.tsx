import { useEffect, useRef, type KeyboardEvent } from 'react'
import { cellName, conflictCells } from '../logic/sudoku'
import type { Board, Digit } from '../types/sudoku'

interface SudokuGridProps {
  board: Board
  clues: Board
  selected: number | null
  completed: boolean
  onSelect: (index: number) => void
  onNumber: (value: Digit) => void
  onClear: () => void
  onMove: (rowDelta: number, columnDelta: number) => void
}

export function SudokuGrid({ board, clues, selected, completed, onSelect, onNumber, onClear, onMove }: SudokuGridProps) {
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([])
  const conflicts = conflictCells(board)
  const selectedValue = selected === null ? 0 : board[selected]
  const selectedRow = selected === null ? -1 : Math.floor(selected / 9)
  const selectedColumn = selected === null ? -1 : selected % 9

  useEffect(() => {
    if (selected !== null) cellRefs.current[selected]?.focus()
  }, [selected])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault()
      onNumber(Number(event.key) as Digit)
      return
    }
    if (event.key === '0' || event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      onClear()
      return
    }
    const directions: Record<string, [number, number]> = {
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
    }
    const direction = directions[event.key]
    if (direction) {
      event.preventDefault()
      onMove(direction[0], direction[1])
    }
  }

  return (
    <div className="board-shell">
      <div className="column-labels" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => <span key={index}>{index + 1}</span>)}
      </div>
      <div className="board-row-wrap">
        <div className="row-labels" aria-hidden="true">
          {Array.from({ length: 9 }, (_, index) => <span key={index}>{String.fromCharCode(65 + index)}</span>)}
        </div>
        <div className="sudoku-grid" role="grid" aria-label="Sudoku board" aria-readonly={completed}>
          {Array.from({ length: 9 }, (_, row) => (
            <div className="sudoku-row" role="row" key={row}>
              {board.slice(row * 9, row * 9 + 9).map((value, column) => {
                const index = row * 9 + column
                const fixed = clues[index] !== 0
                const conflicting = conflicts.has(index)
                const peer = selected !== null && (row === selectedRow || column === selectedColumn)
                const matching = selectedValue !== 0 && value === selectedValue
                const classes = [
                  'sudoku-cell',
                  fixed ? 'fixed' : 'editable',
                  peer ? 'peer' : '',
                  matching ? 'matching' : '',
                  selected === index ? 'selected' : '',
                  conflicting ? 'conflict' : '',
                  column % 3 === 2 && column !== 8 ? 'box-right' : '',
                  row % 3 === 2 && row !== 8 ? 'box-bottom' : '',
                ].filter(Boolean).join(' ')

                return (
                  <button
                    key={index}
                    ref={(node) => { cellRefs.current[index] = node }}
                    type="button"
                    role="gridcell"
                    className={classes}
                    tabIndex={selected === null ? (index === 0 ? 0 : -1) : (selected === index ? 0 : -1)}
                    aria-rowindex={row + 1}
                    aria-colindex={column + 1}
                    aria-label={`Cell ${cellName(index)}, ${fixed ? 'pre-filled' : 'editable'}, ${value || 'empty'}${conflicting ? ', invalid' : ''}`}
                    aria-selected={selected === index}
                    aria-invalid={conflicting}
                    onClick={() => onSelect(index)}
                    onKeyDown={handleKeyDown}
                  >
                    <span aria-hidden="true">{value || '_'}</span>
                    {conflicting && <span className="conflict-mark" aria-hidden="true">!</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

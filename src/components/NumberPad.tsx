import type { Digit } from '../types/sudoku'

interface NumberPadProps {
  disabled: boolean
  onNumber: (value: Digit) => void
  onClear: () => void
}

export function NumberPad({ disabled, onNumber, onClear }: NumberPadProps) {
  return (
    <div className="number-pad" aria-label="Number pad">
      {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).map((number) => (
        <button key={number} type="button" disabled={disabled} onClick={() => onNumber(number)} aria-label={`Enter ${number}`}>
          {number}
        </button>
      ))}
      <button className="erase-button" type="button" disabled={disabled} onClick={onClear}>Clear cell</button>
    </div>
  )
}

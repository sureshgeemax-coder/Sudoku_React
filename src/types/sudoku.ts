export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type Digit = Exclude<CellValue, 0>
export type Board = readonly CellValue[]

export interface Puzzle {
  readonly clues: Board
  readonly solution: Board
}

export type ValidationUnit = 'row' | 'column' | 'box'

export interface ValidationIssue {
  readonly unit: ValidationUnit
  readonly unitIndex: number
  readonly value: Digit
  readonly cells: readonly number[]
  readonly message: string
}

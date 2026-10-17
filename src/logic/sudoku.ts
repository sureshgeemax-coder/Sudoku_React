import type { Board, CellValue, Digit, Puzzle, ValidationIssue, ValidationUnit } from '../types/sudoku'

export const BOARD_SIZE = 9
export const CELL_COUNT = 81

export function cellName(index: number): string {
  return `${String.fromCharCode(65 + Math.floor(index / 9))}${(index % 9) + 1}`
}

function assertBoard(board: Board): void {
  if (board.length !== CELL_COUNT || board.some((value) => !Number.isInteger(value) || value < 0 || value > 9)) {
    throw new Error('A Sudoku board must contain exactly 81 values from 0 to 9.')
  }
}

function unitMessage(unit: ValidationUnit, unitIndex: number, value: Digit): string {
  if (unit === 'row') return `Number ${value} already exists in Row ${String.fromCharCode(65 + unitIndex)}.`
  if (unit === 'column') return `Number ${value} already exists in Column ${unitIndex + 1}.`
  return `Number ${value} already exists in the same 3x3 subgrid.`
}

function issuesForUnit(board: Board, unit: ValidationUnit, unitIndex: number, cells: readonly number[]): ValidationIssue[] {
  const positions = new Map<Digit, number[]>()
  for (const index of cells) {
    const value = board[index]
    if (value !== 0) positions.set(value, [...(positions.get(value) ?? []), index])
  }

  return [...positions.entries()]
    .filter(([, indexes]) => indexes.length > 1)
    .sort(([left], [right]) => left - right)
    .map(([value, indexes]) => ({
      unit,
      unitIndex,
      value,
      cells: indexes,
      message: unitMessage(unit, unitIndex, value),
    }))
}

/** Returns duplicate groups in the C# app's row, column, then box order. */
export function validateBoard(board: Board): ValidationIssue[] {
  assertBoard(board)
  const issues: ValidationIssue[] = []

  for (let row = 0; row < 9; row += 1) {
    issues.push(...issuesForUnit(board, 'row', row, Array.from({ length: 9 }, (_, column) => row * 9 + column)))
  }
  for (let column = 0; column < 9; column += 1) {
    issues.push(...issuesForUnit(board, 'column', column, Array.from({ length: 9 }, (_, row) => row * 9 + column)))
  }
  for (let box = 0; box < 9; box += 1) {
    const startRow = Math.floor(box / 3) * 3
    const startColumn = (box % 3) * 3
    const cells = Array.from({ length: 9 }, (_, offset) =>
      (startRow + Math.floor(offset / 3)) * 9 + startColumn + (offset % 3),
    )
    issues.push(...issuesForUnit(board, 'box', box, cells))
  }
  return issues
}

export function conflictCells(board: Board): Set<number> {
  return new Set(validateBoard(board).flatMap((issue) => issue.cells))
}

export function canPlace(board: Board, index: number, value: Digit): boolean {
  const row = Math.floor(index / 9)
  const column = index % 9
  const boxRow = Math.floor(row / 3) * 3
  const boxColumn = Math.floor(column / 3) * 3

  for (let offset = 0; offset < 9; offset += 1) {
    const rowIndex = row * 9 + offset
    const columnIndex = offset * 9 + column
    const boxIndex = (boxRow + Math.floor(offset / 3)) * 9 + boxColumn + (offset % 3)
    if ((rowIndex !== index && board[rowIndex] === value)
      || (columnIndex !== index && board[columnIndex] === value)
      || (boxIndex !== index && board[boxIndex] === value)) return false
  }
  return true
}

function bestEmptyCell(board: Board): { index: number; candidates: Digit[] } | null {
  let best: { index: number; candidates: Digit[] } | null = null
  for (let index = 0; index < CELL_COUNT; index += 1) {
    if (board[index] !== 0) continue
    const candidates = ([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[]).filter((value) => canPlace(board, index, value))
    if (!best || candidates.length < best.candidates.length) best = { index, candidates }
    if (candidates.length === 0) break
  }
  return best
}

export function solveBoard(board: Board): Board | null {
  assertBoard(board)
  if (validateBoard(board).length > 0) return null
  const working = [...board] as CellValue[]

  const solve = (): boolean => {
    const next = bestEmptyCell(working)
    if (!next) return true
    for (const candidate of next.candidates) {
      working[next.index] = candidate
      if (solve()) return true
    }
    working[next.index] = 0
    return false
  }

  return solve() ? [...working] : null
}

export function countSolutions(board: Board, maximum = 2): number {
  assertBoard(board)
  if (maximum < 1) throw new RangeError('maximum must be at least 1')
  if (validateBoard(board).length > 0) return 0
  const working = [...board] as CellValue[]
  let count = 0

  const search = (): void => {
    if (count >= maximum) return
    const next = bestEmptyCell(working)
    if (!next) {
      count += 1
      return
    }
    for (const candidate of next.candidates) {
      working[next.index] = candidate
      search()
      if (count >= maximum) break
    }
    working[next.index] = 0
  }

  search()
  return count
}

export function isCompleted(board: Board, puzzle: Puzzle): boolean {
  return board.every((value, index) => value !== 0 && value === puzzle.solution[index])
    && validateBoard(board).length === 0
}

export function fixedIndexes(puzzle: Puzzle): Set<number> {
  return new Set(puzzle.clues.flatMap((value, index) => value === 0 ? [] : [index]))
}

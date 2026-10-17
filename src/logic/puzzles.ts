import type { Board, CellValue, Digit, Puzzle } from '../types/sudoku'

const INITIAL_CLUES: Board = rowsToBoard([
  '530070000',
  '600195000',
  '098000060',
  '800060003',
  '400803001',
  '700020006',
  '060000280',
  '000419005',
  '000080079',
])

const INITIAL_SOLUTION: Board = rowsToBoard([
  '534678912',
  '672195348',
  '198342567',
  '859761423',
  '426853791',
  '713924856',
  '961537284',
  '287419635',
  '345286179',
])

export function rowsToBoard(rows: readonly string[]): Board {
  if (rows.length !== 9 || rows.some((row) => !/^[0-9]{9}$/.test(row))) {
    throw new Error('A Sudoku board must contain nine rows of nine digits.')
  }

  return rows.join('').split('').map((value) => Number(value) as CellValue)
}

export function createInitialPuzzle(): Puzzle {
  return { clues: [...INITIAL_CLUES], solution: [...INITIAL_SOLUTION] }
}

function shuffledGroups(random: () => number): number[] {
  const groups = shuffle([0, 1, 2], random)
  return groups.flatMap((group) => shuffle([0, 1, 2], random).map((offset) => group * 3 + offset))
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

/** Generates an isomorphic version of the original unique 30-clue puzzle. */
export function createNewPuzzle(random: () => number = Math.random): Puzzle {
  const rowOrder = shuffledGroups(random)
  const columnOrder = shuffledGroups(random)
  const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9] as Digit[], random)
  const digitMap = new Map<Digit, Digit>(digits.map((digit, index) => [index + 1 as Digit, digit]))

  const transform = (source: Board): Board => rowOrder.flatMap((row) =>
    columnOrder.map((column) => {
      const value = source[row * 9 + column]
      return value === 0 ? 0 : digitMap.get(value)!
    }),
  )

  return { clues: transform(INITIAL_CLUES), solution: transform(INITIAL_SOLUTION) }
}

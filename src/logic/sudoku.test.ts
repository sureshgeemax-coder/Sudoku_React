import { describe, expect, it } from 'vitest'
import { createInitialPuzzle, createNewPuzzle, rowsToBoard } from './puzzles'
import { countSolutions, isCompleted, solveBoard, validateBoard } from './sudoku'

describe('Sudoku validation', () => {
  it('rejects malformed board input', () => {
    expect(() => rowsToBoard(Array(9).fill('00000000x'))).toThrow(/nine rows/)
    expect(() => solveBoard([0, 0, 0])).toThrow(/81 values/)
  })

  it('reports duplicate groups in rows, columns, and boxes', () => {
    const board = rowsToBoard([
      '550000000',
      '500000000',
      '000000000',
      '000000000',
      '000000000',
      '000000000',
      '000000000',
      '000000000',
      '000000000',
    ])

    const issues = validateBoard(board)
    expect(issues.map((issue) => issue.unit)).toEqual(['row', 'column', 'box'])
    expect(new Set(issues.flatMap((issue) => issue.cells))).toEqual(new Set([0, 1, 9]))
  })

  it('ignores empty cells', () => {
    expect(validateBoard(Array(81).fill(0))).toEqual([])
  })
})

describe('Sudoku solver', () => {
  it('solves the original puzzle without mutating it', () => {
    const puzzle = createInitialPuzzle()
    const before = [...puzzle.clues]
    expect(solveBoard(puzzle.clues)).toEqual(puzzle.solution)
    expect(puzzle.clues).toEqual(before)
  })

  it('rejects conflicting and duplicate-free unsolvable boards', () => {
    const conflicting = rowsToBoard(['550000000', ...Array(8).fill('000000000')])
    const unsolvable = rowsToBoard(['023456789', '100000000', ...Array(7).fill('000000000')])
    expect(solveBoard(conflicting)).toBeNull()
    expect(solveBoard(unsolvable)).toBeNull()
    expect(countSolutions(unsolvable)).toBe(0)
  })

  it('recognizes only the stored completed solution', () => {
    const puzzle = createInitialPuzzle()
    expect(isCompleted(puzzle.solution, puzzle)).toBe(true)
    expect(isCompleted(puzzle.clues, puzzle)).toBe(false)
  })
})

describe('Puzzle generation', () => {
  it('creates a valid unique puzzle with exactly 30 clues', () => {
    let seed = 12345
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return (seed - 1) / 2147483646
    }
    const puzzle = createNewPuzzle(random)

    expect(puzzle.clues.filter(Boolean)).toHaveLength(30)
    expect(validateBoard(puzzle.clues)).toEqual([])
    expect(validateBoard(puzzle.solution)).toEqual([])
    expect(countSolutions(puzzle.clues)).toBe(1)
    expect(solveBoard(puzzle.clues)).toEqual(puzzle.solution)
  })
})

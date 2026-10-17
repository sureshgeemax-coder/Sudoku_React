import { useReducer } from 'react'
import { createInitialPuzzle, createNewPuzzle } from '../logic/puzzles'
import { cellName, isCompleted, validateBoard } from '../logic/sudoku'
import type { Board, CellValue, Digit, Puzzle } from '../types/sudoku'

export type StatusTone = 'neutral' | 'error' | 'success'

export interface GameState {
  readonly puzzle: Puzzle
  readonly board: Board
  readonly selected: number | null
  readonly history: readonly Board[]
  readonly status: string
  readonly tone: StatusTone
  readonly completed: boolean
}

type Action =
  | { type: 'select'; index: number }
  | { type: 'set'; value: Digit }
  | { type: 'clear' }
  | { type: 'move'; rowDelta: number; columnDelta: number }
  | { type: 'hint' }
  | { type: 'check' }
  | { type: 'undo' }
  | { type: 'reset' }
  | { type: 'solve' }
  | { type: 'new-game' }

const INITIAL_STATUS = 'Select a cell, then enter 1-9 using the keyboard or number pad.'
const COMPLETE_STATUS = 'You have successfully completed the Sudoku puzzle!'
const LOCKED_STATUS = 'The puzzle is already complete. Start a new game to continue playing.'

function initialState(): GameState {
  const puzzle = createInitialPuzzle()
  return {
    puzzle,
    board: [...puzzle.clues],
    selected: null,
    history: [],
    status: INITIAL_STATUS,
    tone: 'neutral',
    completed: false,
  }
}

function isFixed(state: GameState, index: number): boolean {
  return state.puzzle.clues[index] !== 0
}

function withBoard(state: GameState, board: Board, status: string): GameState {
  const issues = validateBoard(board)
  const completed = isCompleted(board, state.puzzle)
  const conflictStatus = issues.length === 0
    ? status
    : `Entry accepted with a conflict: ${issues[0].message}${issues.length > 1 ? ` (${issues.length} conflicts found)` : ''}`

  return {
    ...state,
    board,
    history: [...state.history, state.board],
    completed,
    status: completed ? COMPLETE_STATUS : conflictStatus,
    tone: completed ? 'success' : issues.length > 0 ? 'error' : 'neutral',
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'select':
      return {
        ...state,
        selected: action.index,
        status: `Selected Cell ${cellName(action.index)} (${isFixed(state, action.index) ? 'pre-filled' : 'editable'}).`,
        tone: 'neutral',
      }
    case 'set': {
      if (state.completed) return { ...state, status: LOCKED_STATUS, tone: 'error' }
      if (state.selected === null) return { ...state, status: 'Select a cell before entering a number.', tone: 'error' }
      if (isFixed(state, state.selected)) {
        return { ...state, status: `Invalid move: Cell ${cellName(state.selected)} is pre-filled and cannot be changed.`, tone: 'error' }
      }
      const board = [...state.board] as CellValue[]
      board[state.selected] = action.value
      return withBoard(state, board, `Cell ${cellName(state.selected)} set to ${action.value}.`)
    }
    case 'clear': {
      if (state.completed) return { ...state, status: LOCKED_STATUS, tone: 'error' }
      if (state.selected === null) return { ...state, status: 'Select an editable cell before clearing it.', tone: 'error' }
      if (isFixed(state, state.selected)) {
        return { ...state, status: `Invalid move: Cell ${cellName(state.selected)} is pre-filled and cannot be cleared.`, tone: 'error' }
      }
      if (state.board[state.selected] === 0) {
        return { ...state, status: `Cell ${cellName(state.selected)} is already empty.`, tone: 'neutral' }
      }
      const board = [...state.board] as CellValue[]
      board[state.selected] = 0
      return withBoard(state, board, `Cell ${cellName(state.selected)} cleared.`)
    }
    case 'move': {
      if (state.selected === null) return state
      const row = Math.floor(state.selected / 9)
      const column = state.selected % 9
      const nextRow = Math.max(0, Math.min(8, row + action.rowDelta))
      const nextColumn = Math.max(0, Math.min(8, column + action.columnDelta))
      const index = nextRow * 9 + nextColumn
      return reducer(state, { type: 'select', index })
    }
    case 'hint': {
      if (state.completed) return { ...state, status: LOCKED_STATUS, tone: 'error' }
      const index = state.board.findIndex((value, cell) => value === 0 && !isFixed(state, cell))
      if (index < 0) {
        return { ...state, status: 'A hint is unavailable because no empty editable cells remain.', tone: 'error' }
      }
      const board = [...state.board] as CellValue[]
      board[index] = state.puzzle.solution[index]
      return { ...withBoard(state, board, `Hint: Cell ${cellName(index)} = ${board[index]}.`), selected: index }
    }
    case 'check': {
      const issues = validateBoard(state.board)
      if (issues.length > 0) {
        return {
          ...state,
          status: `${issues[0].message}${issues.length > 1 ? ` (${issues.length} conflicts found)` : ''}`,
          tone: 'error',
        }
      }
      if (isCompleted(state.board, state.puzzle)) return { ...state, completed: true, status: COMPLETE_STATUS, tone: 'success' }
      return { ...state, status: 'No rule violations detected.', tone: 'success' }
    }
    case 'undo': {
      if (state.history.length === 0) return { ...state, status: 'Nothing to undo.', tone: 'neutral' }
      const board = state.history[state.history.length - 1]
      return {
        ...state,
        board,
        history: state.history.slice(0, -1),
        completed: false,
        status: 'Last move undone.',
        tone: 'neutral',
      }
    }
    case 'reset':
      return {
        ...state,
        board: [...state.puzzle.clues],
        history: [],
        completed: false,
        status: 'Puzzle reset to its starting clues.',
        tone: 'neutral',
      }
    case 'solve':
      if (state.completed) return { ...state, status: LOCKED_STATUS, tone: 'error' }
      return {
        ...state,
        board: [...state.puzzle.solution],
        history: [...state.history, state.board],
        completed: true,
        status: 'Puzzle solved. You can undo to continue playing.',
        tone: 'success',
      }
    case 'new-game': {
      const puzzle = createNewPuzzle()
      return {
        puzzle,
        board: [...puzzle.clues],
        selected: null,
        history: [],
        completed: false,
        status: 'New 30-clue puzzle created. Select a cell to begin.',
        tone: 'neutral',
      }
    }
  }
}

export function useSudokuGame() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  return { state, dispatch }
}

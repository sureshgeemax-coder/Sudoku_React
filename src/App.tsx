import { GameControls } from './components/GameControls'
import { GameStatus } from './components/GameStatus'
import { NumberPad } from './components/NumberPad'
import { SudokuGrid } from './components/SudokuGrid'
import { useSudokuGame } from './hooks/useSudokuGame'
import type { Digit } from './types/sudoku'
import profilePhoto from '../image/sureshkumar.jpg'

export default function App() {
  const { state, dispatch } = useSudokuGame()

  return (
    <main className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Classic logic, thoughtfully rebuilt</p>
          <h1>Sudoku</h1>
        </div>
        <div className="hero-meta">
          <p className="hero-copy">Fill every row, column, and 3×3 box with the numbers 1–9.</p>
          <div className="creator-card" aria-label="Application creator">
            <img className="creator-photo" src={profilePhoto} alt="G Sureshkumar" />
            <div>
              <span className="creator-label">Created by</span>
              <strong>G Sureshkumar</strong>
              <a href="tel:+6596493342">+65 96493342</a>
            </div>
          </div>
        </div>
      </header>

      <section className="game-layout" aria-label="Sudoku game">
        <div className="board-column">
          <SudokuGrid
            board={state.board}
            clues={state.puzzle.clues}
            selected={state.selected}
            completed={state.completed}
            onSelect={(index) => dispatch({ type: 'select', index })}
            onNumber={(value: Digit) => dispatch({ type: 'set', value })}
            onClear={() => dispatch({ type: 'clear' })}
            onMove={(rowDelta, columnDelta) => dispatch({ type: 'move', rowDelta, columnDelta })}
          />
          <GameStatus message={state.status} tone={state.tone} completed={state.completed} />
        </div>

        <aside className="control-panel">
          <div className="panel-heading">
            <span>Input</span>
            <small>Keyboard ready</small>
          </div>
          <NumberPad
            disabled={state.completed}
            onNumber={(value) => dispatch({ type: 'set', value })}
            onClear={() => dispatch({ type: 'clear' })}
          />
          <div className="panel-rule" />
          <GameControls
            canUndo={state.history.length > 0}
            onNewGame={() => dispatch({ type: 'new-game' })}
            onReset={() => dispatch({ type: 'reset' })}
            onUndo={() => dispatch({ type: 'undo' })}
            onHint={() => dispatch({ type: 'hint' })}
            onCheck={() => dispatch({ type: 'check' })}
            onSolve={() => dispatch({ type: 'solve' })}
          />
          <p className="keyboard-help"><strong>Keys:</strong> 1–9 to enter, 0/Delete to clear, arrows to move.</p>
        </aside>
      </section>
    </main>
  )
}

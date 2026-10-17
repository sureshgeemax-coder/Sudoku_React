interface GameControlsProps {
  canUndo: boolean
  onNewGame: () => void
  onReset: () => void
  onUndo: () => void
  onHint: () => void
  onCheck: () => void
  onSolve: () => void
}

export function GameControls(props: GameControlsProps) {
  return (
    <div className="game-controls" aria-label="Game controls">
      <button className="primary-action" type="button" onClick={props.onNewGame}>New game</button>
      <button type="button" onClick={props.onReset}>Reset</button>
      <button type="button" disabled={!props.canUndo} onClick={props.onUndo}>Undo</button>
      <button type="button" onClick={props.onHint}>Hint</button>
      <button type="button" onClick={props.onCheck}>Check</button>
      <button type="button" onClick={props.onSolve}>Solve</button>
    </div>
  )
}

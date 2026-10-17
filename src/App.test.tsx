import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('Sudoku application', () => {
  it('selects an editable cell and enters a number with the number pad', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('gridcell', { name: /Cell A3, editable, empty/ }))
    await user.click(screen.getByRole('button', { name: 'Enter 4' }))

    expect(screen.getByRole('gridcell', { name: /Cell A3, editable, 4/ })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Cell A3 set to 4.')
  })

  it('supports keyboard entry, conflict feedback, and clearing', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cell = screen.getByRole('gridcell', { name: /Cell A3, editable, empty/ })
    await user.click(cell)
    await user.keyboard('5')
    expect(screen.getByRole('gridcell', { name: /Cell A3, editable, 5, invalid/ })).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('Entry accepted with a conflict')

    await user.keyboard('{Backspace}')
    expect(screen.getByRole('gridcell', { name: /Cell A3, editable, empty/ })).toHaveAttribute('aria-invalid', 'false')
  })

  it('moves both selection and focus with arrows without hijacking control keys', async () => {
    const user = userEvent.setup()
    render(<App />)

    const cellA3 = screen.getByRole('gridcell', { name: /Cell A3, editable, empty/ })
    await user.click(cellA3)
    await user.keyboard('{ArrowRight}')
    const cellA4 = screen.getByRole('gridcell', { name: /Cell A4, editable, empty/ })
    expect(cellA4).toHaveFocus()
    expect(cellA4).toHaveAttribute('aria-selected', 'true')

    const hint = screen.getByRole('button', { name: 'Hint' })
    hint.focus()
    await user.keyboard('5')
    expect(cellA4).toHaveAccessibleName(/empty/)
  })

  it('does not allow fixed clues to be overwritten', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('gridcell', { name: /Cell A1, pre-filled, 5/ }))
    await user.click(screen.getByRole('button', { name: 'Enter 9' }))
    expect(screen.getByRole('gridcell', { name: /Cell A1, pre-filled, 5/ })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('pre-filled and cannot be changed')
  })

  it('fills the first empty editable cell with a hint and can undo it', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Hint' }))
    expect(screen.getByRole('gridcell', { name: /Cell A3, editable, 4/ })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Hint: Cell A3 = 4.')

    await user.click(screen.getByRole('button', { name: 'Undo' }))
    expect(screen.getByRole('gridcell', { name: /Cell A3, editable, empty/ })).toBeInTheDocument()
  })

  it('resets user entries and reports completion after solve', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('gridcell', { name: /Cell A3, editable, empty/ }))
    await user.click(screen.getByRole('button', { name: 'Enter 4' }))
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    expect(screen.getByRole('gridcell', { name: /Cell A3, editable, empty/ })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Solve' }))
    expect(screen.getByRole('status')).toHaveTextContent('Puzzle solved')
    expect(screen.getByText('Puzzle complete')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enter 1' })).toBeDisabled()
  })

  it('creates a new 30-clue game', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'New game' }))
    expect(screen.getByRole('status')).toHaveTextContent('New 30-clue puzzle created')
    expect(screen.getAllByRole('gridcell', { name: /pre-filled/ })).toHaveLength(30)
  })
})

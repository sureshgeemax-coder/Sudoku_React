import { expect, test } from '@playwright/test'

test('player can enter, detect, clear, and hint a cell', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Sudoku' })).toBeVisible()

  const cell = page.getByRole('gridcell', { name: /Cell A3, editable, empty/ })
  await cell.click()
  await page.keyboard.press('5')
  await expect(page.getByRole('status')).toContainText('Entry accepted with a conflict')
  await expect(page.getByRole('gridcell', { name: /Cell A3, editable, 5, invalid/ })).toBeVisible()

  await page.keyboard.press('Backspace')
  await page.getByRole('button', { name: 'Hint' }).click()
  await expect(page.getByRole('gridcell', { name: /Cell A3, editable, 4/ })).toBeVisible()
})

test('solve completes and locks number entry', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Solve' }).click()
  await expect(page.getByRole('status')).toContainText('Puzzle solved')
  await expect(page.getByRole('button', { name: 'Enter 1' })).toBeDisabled()
})

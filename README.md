# Sudoku React

A responsive TypeScript/React port of the original C# WinForms Sudoku application. It preserves the original 30-clue puzzle, validation rules, stored-solution hints, exact-solution completion, and validity-preserving New Game generation while adding Reset, Undo, Solve, mobile layout, and browser accessibility.

## Requirements

- Node.js 24.x
- npm 11 or newer

## Local development

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`.

## Quality checks

```powershell
npm test
npm run typecheck
npm run lint
npm run build
```

Install the Playwright browser once, then run browser tests:

```powershell
npx playwright install chromium
npm run e2e
```

Preview the production bundle locally:

```powershell
npm run preview
```

## Controls

- Select any cell with a mouse, touch, or keyboard focus.
- Enter `1` through `9` with the keyboard or on-screen number pad.
- Clear an editable cell with `0`, `Backspace`, `Delete`, or **Clear cell**.
- Move the selection with the arrow keys; movement stops at board edges.
- Use **Hint**, **Check**, **Undo**, **Reset**, **Solve**, or **New game** as needed.

Conflicting entries remain on the board and all cells in each duplicate row, column, or box are marked. Fixed clues cannot be changed.

## GitHub

Create an empty repository on GitHub without initializing it, then run from this directory:

```powershell
git add .
git commit -m "Build React Sudoku application"
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the example URL with the new repository URL. Review staged files before committing and do not commit local secrets.

## Vercel

The project uses Vite's standard production output and requires no custom `vercel.json`.

### Vercel dashboard

1. Import the GitHub repository at <https://vercel.com/new>.
2. Keep the detected framework preset as **Vite**.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Deploy. No environment variables are required.

### Vercel CLI

```powershell
npx vercel
npx vercel --prod
```

## Architecture

- `src/logic/` contains pure puzzle generation, validation, completion, and backtracking solver logic.
- `src/hooks/` owns immutable game state and action behavior.
- `src/components/` contains the accessible board, number pad, controls, and status UI.
- `src/*.test.tsx` and `src/logic/*.test.ts` contain Vitest and Testing Library coverage.
- `e2e/` contains Playwright desktop and mobile workflows.

The application is entirely client-side and stores no personal data, credentials, or progress outside browser memory.

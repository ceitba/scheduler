# CEITBA | Combinador de Horarios

Herramienta para combinar y planificar horarios académicos del ITBA, desarrollada por el IT Team de CEITBA.

## Stack

- **React 18** + **Vite 5** — fast dev server and optimized builds
- **TypeScript** — fully typed
- **React Router v6** — client-side routing
- **Tailwind CSS v3** — utility-first styles with the Editorial UI design system
- **@dnd-kit** — accessible drag-and-drop for course reordering
- **Fuse.js** — fuzzy search for course lookup
- **html2canvas + jsPDF** — schedule export as image or PDF

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set environment variable
cp .env.example .env.local
# Edit .env.local and set VITE_CEITBA_API_URL

# 3. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Environment variables

| Variable | Description |
|---|---|
| `VITE_CEITBA_API_URL` | Base URL for the CEITBA subjects API |

## Features

- Browse subjects by career and study plan
- Select commissions (course sections) with conflict detection
- Drag-and-drop course prioritization
- Automatic schedule combination generator
- Visual weekly calendar preview
- Export schedule as PDF, image, or `.ics` calendar file
- Import to Google Calendar

## Project structure

```
src/
├── components/    UI components
├── hooks/         Custom React hooks
├── pages/         Page-level components
├── services/      Scheduler algorithm
├── types/         TypeScript types
└── utils/         Utility functions
```

## Contributing

Issues and PRs welcome at [github.com/CEITBA-git/scheduler](https://github.com/CEITBA-git/scheduler).

---

Developed with care by the **IT Team CEITBA** — Ian Dalton, Lautaro Bonseñor, Camila Lee, Uriel Sosa Vázquez.

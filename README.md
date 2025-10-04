# Personal Training Bot

Personal Training Bot is a React + TypeScript application that helps coaches craft and share highly customised training programs. The app tracks thousands of training cards, organises them into themed decks, and makes it easy to assemble workout schedules for different athletes and goals.

## Features

- **Card catalogue** with advanced searching and filtering across martial arts, fitness, intelligence, and counter-psyops modules.
- **Schedule designer** that builds multi-week training plans with support for custom blocks, timers, and difficulty presets.
- **Coach workflows** including sharing decks, exporting summaries, and persisting preferences via local storage caches.
- **Offline-friendly data layer** powered by static JSON content and dynamic loader utilities.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on Vite with hot module replacement. Environment-specific values (such as API keys) should live in a local `.env` file that is not committed to version control.

## Build and test

- Production build: `npm run build`
- Unit tests: `npm run test`

Both commands should pass before cutting a release.

## Project structure

```
src/
  components/       # React components by feature area
  context/          # React context providers and hooks
  data/             # Static JSON decks and module metadata
  store/            # Local storage-backed state containers
  utils/            # Shared helpers and loaders
docs/               # Architecture notes and contributor guides
public/             # Static assets served by Vite
```

See `docs/` for detailed architecture notes, caching behaviour, and contribution guidelines.

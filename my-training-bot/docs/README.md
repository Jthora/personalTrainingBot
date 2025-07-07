# Personal Training Bot Documentation

## Overview

The Personal Training Bot is a comprehensive training management system designed to provide structured training programs across multiple specialized domains. This application combines modern web technologies with extensive training data to create an interactive, gamified learning experience.

## Project Structure

```
my-training-bot/
├── docs/                      # Documentation files
├── public/                    # Static assets
├── src/                       # Source code
│   ├── components/           # React components
│   ├── pages/               # Page components
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   ├── data/                # Training data and configurations
│   ├── assets/              # Images, fonts, sounds
│   ├── styles/              # CSS stylesheets
│   └── context/             # React context providers
├── templates/               # JSON templates for data structures
└── dist/                    # Build output
```

## Key Features

### Training Modules
The application supports 19 different training modules:
- **Agency Training** - Government agency procedures
- **Combat Training** - Military combat skills
- **Counter PsyOps** - Psychological operations defense
- **Cybersecurity** - Digital security practices
- **Dance Training** - Various dance styles
- **Fitness Training** - Physical conditioning
- **Intelligence** - Analysis and assessment
- **Investigation** - Forensic and detective skills
- **Martial Arts** - Combat disciplines
- **PsiOps** - Psychological operations
- **And more...**

### Architecture
- **Frontend**: React 19 with TypeScript
- **State Management**: Zustand for global state
- **Routing**: React Router DOM
- **Build Tool**: Vite for fast development
- **Styling**: Custom CSS with modern design patterns
- **Audio**: Howler.js for sound effects

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

## Documentation Index

- [API Documentation](./api.md)
- [Component Documentation](./components.md)
- [Data Structure Documentation](./data-structures.md)
- [Cache System Documentation](./cache-system.md)
- [Development Guide](./development.md)
- [Deployment Guide](./deployment.md)
- [Contributing Guidelines](./contributing.md)
- [Troubleshooting](./troubleshooting.md)

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

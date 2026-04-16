# Parallel Gospels Reader

A modern React + Tailwind CSS application for reading the four Gospels (Matthew, Mark, Luke, John) in parallel columns.

## Features

- **4-Column Parallel Layout**: View matching passages from all four Gospels side by side
- **Dark/Light Mode**: Toggle between dark and light themes
- **Section Navigation**: Jump between different events in Jesus' life
- **Responsive Design**: Works on mobile, tablet, and large screens
- **Modern UI**: Clean, accessible interface with Tailwind CSS

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Data Format

The parallel verses are stored in `src/data/parallelVerses.json` with the following structure:

```json
{
  "sections": [
    {
      "id": "unique-section-id",
      "title": "Section Title",
      "passages": [
        {
          "gospel": "matthew|mark|luke|john",
          "reference": "Matthew 1:1-5",
          "verses": [
            {"verse": 1, "text": "Verse text here"}
          ]
        }
      ]
    }
  ]
}
```

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tooling
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Gospel Color Coding

- **Matthew (Blue)** - The King
- **Mark (Red)** - The Servant  
- **Luke (Green)** - The Son of Man
- **John (Purple)** - The Son of God

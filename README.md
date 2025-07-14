# GliaCloud Frontend Homework

A React-based video highlight editing tool that allows users to upload videos, view AI-generated transcripts, and create highlight clips with transcript overlays.

## Live Demo

Visit the live demo at: [https://glia-cloud-frontend-homework.vercel.app/](https://glia-cloud-frontend-homework.vercel.app/)

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GliaCloud-Frontend-Homework
````

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Testing with Sample Video

For the complete demo experience, download the following open-source video file:

**Sample Video**: [Big Buck Bunny (10 minutes)](http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4)

### How to Test:

1. Visit the live demo or run the project locally
2. Download the Big Buck Bunny video file from the link above
3. Upload the video file through the upload interface
4. Wait for the AI processing simulation to complete
5. Explore the features:

   * **Left Panel**: Browse transcript sections and select sentences for highlights
   * **Right Panel**: Preview your highlight clips with transcript overlays
   * **Interactive Features**: Click timestamps to navigate, auto-scroll during playback

## Tech Stack

### Core Technologies

* **React** (v19.1.0) - Frontend framework
* **TypeScript** - Type safety and better developer experience
* **Vite** (v7.0.4) - Build tool and development server
* **Tailwind CSS** (v4.1.11) - Utility-first CSS framework

### UI Components & Styling

* **@radix-ui/react-dialog** - Modal/dialog components
* **Lucide React** - Icon components
* **class-variance-authority** - Component variant management
* **clsx** & **tailwind-merge** - Conditional CSS class handling

### State Management & API

* **TanStack Query** (v5.83.0) - Server state management and caching
* **Axios** (v1.10.0) - HTTP client for API requests
* **MSW** (v2.10.4) - Mock Service Worker for API mocking during development

### Media Processing

* **HLS.js** (v1.6.7) - HTTP Live Streaming support for video playback

### Development Tools

* **ESLint** - Code linting with TypeScript and React rules
* **TypeScript ESLint** - Enhanced TypeScript support
* **Autoprefixer** & **PostCSS** - CSS processing
* **tw-animate-css** - Tailwind CSS animation utilities

## Mock Data & API

This project uses **MSW (Mock Service Worker)** to simulate backend API responses during development.

### Mock Data Location

* `src/mocks/mocks.ts`: Main mock data
* `src/mocks/handlers.ts`: API route handlers
* `src/mocks/browser.ts`: Browser mock setup
* `src/mocks/server.ts`: Server mock setup

### Mock Data Structure

Includes:

* **Video metadata**: File info, duration, video ID
* **Transcript data**: Full transcript with timestamps and sections
* **Suggested highlights**: AI-generated recommendations
* **AI suggestions**: Tips for creating highlight clips

### API Endpoints (Mocked)

* `POST /api/video/process`: Video upload & processing
* `GET /api/video/data/:videoId`: Get video data & transcript
* `GET /api/health`: Health check

## Project Structure

```
src/
├── components/
│   ├── Transcript/
│   │   └── TranscriptItem.tsx
│   ├── VideoBlock/
│   │   ├── ErrorState.tsx
│   │   ├── ProcessingState.tsx
│   │   └── UploadPrompt.tsx
│   ├── VideoPlayer/
│   │   ├── ClipProgressBar.tsx
│   │   ├── ControlButton.tsx
│   │   ├── VideoDisplay.tsx
│   │   └── VideoPlayer.tsx
│   ├── dialog/
│   │   └── WelcomeDialog.tsx
│   ├── ui/
│   │   └── dialog.tsx
│   ├── TranscriptBlock.tsx
│   └── VideoPlayerBlock.tsx
├── hooks/
│   ├── useAutoScroll.ts
│   ├── useVideoPlayer.ts
│   └── useVideoUpload.tsx
├── mocks/
│   ├── browser.ts
│   ├── handlers.ts
│   ├── mocks.ts
│   └── server.ts
├── providers/
│   ├── HealthyCheckProvider.tsx
│   └── MSWProvider.tsx
├── services/
│   ├── check-health/
│   └── video/
├── types/
│   ├── api/
│   └── utils/
└── utils/
    ├── api-client.ts
    └── throttle.ts
```

## Core Features

### 1. Split-Screen Interface

* **Left Panel**: Transcript with section titles and selectable sentences
* **Right Panel**: Video player with highlight preview and transcript overlay

### 2. Bidirectional Synchronization

* Selecting transcript sentences updates the video preview
* Playback auto-scrolls and highlights the current sentence

### 3. Highlight Creation

* Users can select/deselect sentences to create highlight clips
* Visual timeline shows selected segments
* Seamless transition between highlight segments

### 4. Responsive Design

* Desktop: Windows & macOS on Chrome

## Available Scripts

```bash
# Development
npm run dev              # Start development server with HMR
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run type-check:watch # Watch mode for type checking
```

## License

This project is a homework assignment and is intended for educational purposes.

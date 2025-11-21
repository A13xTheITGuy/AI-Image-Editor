# Architecture Overview

This document provides a deeper look into the technical architecture of the AI Image Editor.

## 1. Frontend Stack

*   **React (v19)**: The core of our application is built with React, allowing us to create a declarative and component-driven user interface. We leverage functional components and hooks for state management and side effects.
*   **TypeScript**: We use TypeScript to add static typing to our JavaScript code. This improves developer experience, reduces runtime errors, and makes the codebase more self-documenting and maintainable.
*   **Tailwind CSS**: A utility-first CSS framework used for all styling. It is configured to use CSS variables to support dynamic theming.
*   **@google/genai SDK**: The official JavaScript SDK for the Google Gemini API, used to interact with the `gemini-2.5-flash-image` model.

## 2. Project Structure

The project is organized into logical directories to ensure a clean separation of concerns:

```
/
├── components/         # Reusable React components
│   ├── AboutModal.tsx     
│   ├── AIPrompt.tsx
│   ├── CanvasEditor.tsx
│   ├── ...
│   ├── SettingsModal.tsx
│   ├── TextControls.tsx
│   ├── ...
│   └── UploadButton.tsx
│
├── services/           # Modules for communicating with external APIs
│   └── geminiService.ts
│
├── utils/              # Helper functions and utilities
│   └── imageUtils.ts
│
├── types.ts            # Shared TypeScript type definitions
├── themes.ts           # Theme definitions
├── App.tsx             # Main application component (state management)
├── index.css           # Global styles and CSS variable definitions
├── index.tsx           # Application entry point
└── index.html          # Main HTML file
```

## 3. Component Breakdown

*   **`App.tsx`**: The main orchestrator. It holds all application state, including the array of images, the active image ID, tool states, layer management, and the current UI theme settings. It passes down data and callbacks to all child components.
*   **`CanvasEditor.tsx`**: The core of the editor. This component manages a stack of HTML5 canvas elements (one per layer), is responsible for rendering the composite image, applying filters, and handling all user interactions like zooming, panning, drawing, and selections.
*   **`SettingsModal.tsx`**: A modal component that provides the UI for customizing the application's theme.
*   **`AboutModal.tsx`**: A new modal component that provides a user guide and contact information.
*   **`LayersPanel.tsx`**: Provides the UI for managing the layer stack. Users can reorder layers, change opacity and blend modes, toggle visibility, rename, add, and delete layers.
*   **`HistoryPanel.tsx`**: Displays the list of edits for the currently active layer and allows the user to revert to a previous state.
*   **`Toolbar.tsx`**: Provides buttons to switch between available tools.
*   **Tool Control Components**: A set of contextual components that appear when their corresponding tool is active. (e.g., `PenControls.tsx`, `TextControls.tsx`)

## 4. State Management & Theming

The application's state is managed centrally in `App.tsx` using React Hooks.

*   **Image State**: Built around a non-destructive, layer-based architecture. The primary state is an array of `ImageState` objects, each containing an array of `Layer` objects with their own properties and edit history.
*   **Theme State**: A separate state, `themeSettings`, holds the current UI theme. This object contains hex color values for the application's background, panels, text, and accent colors.
*   **Dynamic Theming Engine**:
    1.  A global `index.css` file defines a set of CSS variables (`--color-bg-r`, `--color-accent-g`, etc.) that control the application's color scheme.
    2.  The `tailwind.config` is configured to use these variables, allowing for theme-aware utility classes (e.g., `bg-app-bg`, `text-app-text`).
    3.  A `useEffect` hook in `App.tsx` watches for changes to the `themeSettings` state.
    4.  When the theme changes, this effect updates the values of the root CSS variables on the `<html>` element, causing the entire application's UI to re-render with the new colors instantly.

## 5. Services and Utilities

*   **`services/geminiService.ts`**: This file abstracts all communication with the Gemini API, exposing a single `editImageWithAI` function.
*   **`utils/imageUtils.ts`**: Contains pure helper functions for file conversion, MIME type extraction, image downloading, and canvas-based transformations.
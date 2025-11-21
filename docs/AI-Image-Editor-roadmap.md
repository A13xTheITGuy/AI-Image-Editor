# AI Image Editor: Project Roadmap & Overview

## 1. Vision & Goals

**What are we building?**

We are creating a modern, web-based image editor that combines traditional manual editing tools with powerful, intuitive AI-driven features. The goal is to provide a seamless and creative experience for users, allowing them to make both precise adjustments and magical, prompt-based transformations to their images through a non-destructive, layer-based workflow.

**Core Philosophy:**

*   **User-Centric Design**: The interface should be clean, intuitive, and responsive, working beautifully on both desktop and mobile devices.
*   **Performance**: The application should feel fast and responsive, providing real-time feedback for manual adjustments and clear loading states for AI operations.
*   **Extensibility**: The architecture should be modular, allowing for the easy addition of new filters, AI features, and tools in the future.

---

## 2. Completed Features (MVP Status: Complete)

The application has reached a mature MVP state with a robust feature set:

*   **Advanced Layer System**:
    *   **Non-Destructive Workflow**: Full support for multiple layers with independent opacity, visibility, and **16 Blend Modes**.
    *   **Drag-and-Drop**: Intuitive reordering of layers via drag-and-drop.
    *   **Metadata Caching**: Optimized rendering engine ensures instant feedback when adjusting layer properties.

*   **History & State Management**:
    *   **Granular History**: Each layer maintains its own independent undo/redo stack.
    *   **Panel Organization**: A dedicated **History Panel** (positioned above Layers) allows easy navigation of past edits.

*   **Vector & Drawing Tools**:
    *   **Gradient Tool**: Linear and Radial gradients with customizable colors and opacity.
    *   **Text Tool**: Rich text support with font, size, color, bold/italic, and alignment controls.
    *   **Shapes Tool**: Vector shapes (Rectangle, Circle, Triangle, Rounded Rectangle, etc.) with fill/stroke options.
    *   **Pen/Eraser**: Freehand drawing tools with size, opacity, and hardness settings.

*   **Image Transformations**:
    *   **Crop**: Non-destructive cropping with interactive handles.
    *   **Canvas Size**: Adjust canvas dimensions with 9-point anchor control.
    *   **Resize/Rotate/Flip**: Global transformations applied to all layers.
    *   **Filters**: Real-time CSS filters (Brightness, Contrast, etc.) baked into history upon completion.

*   **AI-Powered Editing**:
    *   **Magic Edit**: Integrated Google Gemini API (`gemini-2.5-flash-image`) for prompt-based image manipulation.
    *   **Seamless Integration**: AI results are added as new history states, preserving the original content.

*   **UI/UX Polish**:
    *   **Dynamic Theming**: User-customizable Dark/Light themes with color pickers.
    *   **Responsive Design**: Collapsible panels for maximum workspace on smaller screens.
    *   **Multi-Image Gallery**: Switch between multiple open projects instantly.
    *   **Live Thumbnails**: Gallery thumbnails update in real-time to reflect composite edits (blending, opacity, drawing).

---

## 3. Architectural Decisions

**High-Level Choices:**

Our architecture is designed for simplicity, performance, and future scalability.

*   **Technology Stack**:
    *   **Frontend Framework**: **React 19** with **TypeScript**.
    *   **Styling**: **Tailwind CSS** with CSS variable-based theming.
    *   **AI Integration**: **Google Gemini API**.

*   **State Management**:
    *   Centralized state in `App.tsx` using React Hooks.
    *   `ImageState` contains an array of `Layer` objects.
    *   Rendering logic is isolated in `CanvasEditor.tsx`.

*   **Security & Performance**:
    *   **DoS Protection**: Limits on history stack size (20), file upload size (10MB), and canvas dimensions (4096px).
    *   **Sanitization**: Input truncation for filenames and text tools to prevent UI overflow.
    *   **Error Handling**: Robust error catching to prevent UI crashes (e.g., handling `[object Object]` errors).

---

## 4. Future Roadmap

*   **Export Options**: Support for exporting specific layers or different file formats (JPG, WEBP).
*   **Advanced Selection**: Magic Wand or Lasso tools for precise masking.
*   **Cloud Sync**: Optional integration with cloud storage for saving projects.
*   **PWA Support**: Offline capabilities and installation support.

<div align="center">

  <!-- PROJECT LOGO OR BANNER -->
  <!-- Replace the src below with a screenshot of your actual app once you have one! -->
  <img src="https://via.placeholder.com/1200x400.png?text=AI+Image+Editor+Project" alt="AI Image Editor Banner" width="100%" />

  <br />

  # 🎨 AI Image Editor
  
  **A professional-grade, layer-based image editor built for the web.**
  <br />
  Combines traditional vector tools with the generative power of Google Gemini.

  <p align="center">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License" />
  </p>

  [Report Bug](https://github.com/A13xTheITGuy/AI-Image-Editor/issues) · [Request Feature](https://github.com/A13xTheITGuy/AI-Image-Editor/issues)

</div>

---

## 📖 Overview

**AI Image Editor** is a robust web application that brings a "Photoshop-lite" experience directly to the browser. Unlike simple filter apps, this project implements a full **non-destructive layer engine**, allowing for complex compositions.

It integrates the **Google Gemini API** (`gemini-2.5-flash-image`) to perform "Magic Edits"—allowing users to modify specific image layers using natural language prompts.

### ✨ Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🤖 AI & Automation</h3>
      <ul>
        <li><strong>Magic Edit:</strong> Transform images via text prompts (e.g., "Turn the cat into a robot").</li>
        <li><strong>Smart Context:</strong> The AI understands the visual context of the specific layer selected.</li>
        <li><strong>Auto-History:</strong> AI generations are added as reversible history states.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>📚 Layer Management</h3>
      <ul>
        <li><strong>Full Layer Stack:</strong> Add, delete, rename, and reorder layers via Drag & Drop.</li>
        <li><strong>Blending Modes:</strong> Support for 16 CSS blend modes (Multiply, Overlay, Screen, etc.).</li>
        <li><strong>Opacity Control:</strong> Fine-tune transparency per layer.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🖌️ Creative Tools</h3>
      <ul>
        <li><strong>Vector Shapes:</strong> Rectangles, Circles, Triangles, and Rounded Rectangles with fill/stroke.</li>
        <li><strong>Drawing:</strong> Pen and Eraser tools with adjustable hardness and flow.</li>
        <li><strong>Typography:</strong> Rich text tool with font families, styles, and alignment.</li>
        <li><strong>Gradients:</strong> Linear and Radial gradient generator.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>🛠️ Image Manipulation</h3>
      <ul>
        <li><strong>Transform:</strong> Crop, Resize, Canvas Size, Rotate, and Flip.</li>
        <li><strong>Filters:</strong> Real-time CSS filters (Brightness, Contrast, Hue, etc.).</li>
        <li><strong>Non-Destructive:</strong> Every layer maintains its own independent Undo/Redo history stack.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

*   **Node.js** (v18 or higher)
*   **npm** (v9 or higher)
*   A **Google Cloud API Key** with access to Gemini API.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/A13xTheITGuy/AI-Image-Editor.git
    cd AI-Image-Editor
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_actual_google_api_key_here
    ```

4.  **Run the application**
    ```bash
    npm run dev
    ```

5.  Open `http://localhost:5173` in your browser.

---

## 🏗️ Architecture

The project follows a modern, component-driven architecture:

*   **Frontend:** React 19 with Hooks for state management.
*   **Rendering:** HTML5 Canvas API managed via a custom compositing engine (`CanvasEditor.tsx`).
*   **Styling:** Tailwind CSS with a dynamic CSS-variable based theming system (Dark/Light support).
*   **AI Integration:** Direct client-side integration with `@google/genai` SDK.

> **Note:** For production deployment, it is recommended to move the API calls to a backend (Node.js/Express) to secure your API keys. This repository demonstrates the frontend capabilities and logic.

---

## 🛡️ Security & Performance

*   **DoS Protection:** Implements limits on history stack size (20 states), canvas dimensions (4096px), and file upload size (10MB).
*   **Optimization:** Uses a custom caching engine to prevent unnecessary canvas redraws during metadata updates (opacity/blending changes).
*   **Sanitization:** Inputs for filenames and text tools are strictly validated and truncated.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 📬 Contact

**Alexandru Stan** - Developer  
Email: [alexandru.stan2@student.upt.ro](mailto:alexandru.stan2@student.upt.ro)  
GitHub: [A13xTheITGuy](https://github.com/A13xTheITGuy)

<div align="center">
  <br />
  <sub>Built with ❤️ using React 19 & Gemini</sub>
</div>

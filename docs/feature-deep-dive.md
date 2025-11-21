# Feature Deep Dive

This document details the implementation of the core features in the AI Image Editor.

## 1. Layer System & State Management

The application is built on a non-destructive layer system, which is the foundation for all editing.

*   **State Structure**: The core state in `App.tsx` is an array of `ImageState` objects. Each `ImageState` contains an array of `Layer` objects. A `Layer` object holds its own properties (`name`, `opacity`, `blendMode`, `isVisible`, `filters`) and, crucially, its own `history` array.
*   **Rendering**: The `CanvasEditor` component creates and manages a stack of `<canvas>` elements, one for each layer. CSS properties like `opacity`, `mix-blend-mode`, and `filter` are applied directly to these canvas elements to render the final composite image in real-time.
*   **Rendering Optimization**: To ensure performance and prevent flickering (or blank thumbnails) when changing layer metadata (like opacity or blend mode), the `CanvasEditor` implements a smart caching system. It tracks the source image string (`src`) currently drawn on each canvas. When the component updates, it only redraws a layer's canvas if the source image or canvas dimensions have effectively changed. This prevents unnecessary `clearRect` and `drawImage` calls during rapid state updates.
*   **Layer-Specific Edits**: All editing operations—drawing, applying filters, transformations—are directed only at the active layer. When an edit is finalized (e.g., `onMouseUp` after drawing), a new history state is generated and added exclusively to the active layer's history array.
*   **History**: The `HistoryPanel` displays the `history` array of the currently active layer. Selecting a previous state simply changes the `src` of that specific layer's canvas, leaving all other layers untouched.

## 2. Manual Filter History

To provide a good user experience, filter adjustments are handled with a combination of real-time previews and a debounced history commit.

*   **Live Preview**: As a user moves a filter slider in `FilterControls`, the `onFilterChange` callback in `App.tsx` is fired continuously. This callback immediately updates the `filters` object on the active layer's state. The `CanvasEditor` reads this state and applies the corresponding CSS `filter` property to the layer's canvas, giving the user an instant, smooth preview.
*   **Debounced Commit**: The same `onFilterChange` callback also starts a debounce timer (e.g., 800ms). If the user moves another slider, the timer is reset. Once the user stops making adjustments and the timer completes, a `commitFilterChange` function is executed.
*   **Baking Filters**: This function takes the current `src` of the layer and the final `filters` values. It uses a utility function (`applyFiltersToImage`) to draw the image onto a temporary canvas, apply the filters directly to the canvas context, and generate a new `dataURL`.
*   **Creating History State**: This new `dataURL` is then used to create a new state in the active layer's history, with a descriptive name like "Filter 1".
*   **Resetting Live Filters**: Crucially, once the new history state is created, the `filters` object on the layer is reset to its default values. This is because the filter effect is now "baked into" the image pixels, and resetting the live CSS filters prevents the effect from being applied twice.

## 3. AI Image Editing with Gemini

The "AI Magic Edit" feature is integrated seamlessly into the layer system.

**Workflow:**

1.  **User Input**: The user selects a layer and provides a text prompt.
2.  **Data Preparation**: The current visual state (the `src` data URL) of the active layer is used as the input image for the AI.
3.  **API Call**: The `editImageWithAI` function in `geminiService.ts` calls the `gemini-2.5-flash-image` model, sending the layer's image data and the text prompt.
4.  **Response Handling**: The AI-generated image is returned as a base64 string. This new image source is then added as a new, reversible step (e.g., "AI Generation") in the active layer's history, replacing the previous content.

### API Limitations & Safety

It's important to note that all requests to the Gemini API are subject to safety filters. A request may be blocked for various reasons, including:

*   **Safety**: The prompt or image violates Google's safety policies.
*   **Image Recitation**: The input image is too similar to a known copyrighted image, and the model is blocked to prevent recitation.

The application has been updated to provide clearer, more user-friendly error messages when these specific blocks occur, guiding the user to try a different image or prompt.

## 4. Crop Tool

The Crop tool allows for non-destructive cropping of the entire image canvas.

*   **Activation**: The user activates the crop mode from the "Image" controls. This sets the active tool to `'crop'`.
*   **Interaction Overlay**: When the `CanvasEditor` detects the crop tool is active, it renders a visual overlay. This includes a semi-transparent mask over the area to be removed and a dashed-line rectangle representing the crop area.
*   **Interactive Handles**: The crop rectangle features eight circular handles (corners and mid-points) and a body area. As the user hovers over these handles, the cursor changes to indicate the available action (resize or move).
*   **Adjusting the Area**: The user can click and drag any handle to resize the crop rectangle or click and drag the body of the rectangle to move it. The resizing logic is constrained to the image boundaries.
*   **Applying the Crop**: When the user clicks "Apply Crop", the `CanvasEditor` sends the final dimensions and position of the crop rectangle back to the `App` component.
*   **State Update**: The `App` component then processes this crop action. It iterates through every layer of the active image, creating a new, cropped version of each layer's canvas. This generates a new state in each layer's history, preserving the non-destructive workflow. Finally, the main image dimensions are updated, and the canvas re-fits to the screen.

## 5. Canvas Size Tool

The Canvas Size tool provides a way to adjust the canvas dimensions independently of the image content, either adding or removing space around the existing layers.

*   **Activation**: The user activates the tool via a button in the "Image" controls, which opens the "Canvas Size" modal.
*   **User Input**: Inside the modal, the user can set new pixel dimensions for the width and height.
*   **Anchor Control**: A critical feature is the 9-point anchor grid. This grid allows the user to specify where the existing image content should be positioned on the new canvas (e.g., top-left, middle-center, bottom-right).
*   **Applying the Change**: When the user clicks "OK", the application performs the following steps for every layer in the current image:
    1.  A new, blank canvas is created in memory with the specified dimensions.
    2.  The position (`x`, `y`) for the old content is calculated based on the selected anchor point.
    3.  The content from the existing layer is drawn onto the new canvas at the calculated position.
    4.  A new `dataURL` is generated from this new canvas.
*   **History Update**: This new `dataURL` is used to create a new "Canvas Size" state in each layer's history. Finally, the main image dimensions are updated to match the new canvas size, completing the non-destructive operation.

## 6. Text Tool

The Text tool provides an intuitive way to add typographic elements.

*   **Live Preview**: When the Text tool is active, the `CanvasEditor` listens for mouse movement. On each move, it clears the top-level interaction canvas and draws the text from the `TextControls` at the current cursor position. This provides a fluid, real-time preview of where the text will be placed.
*   **Stamping**: A single mouse click triggers the final placement. The text is rendered permanently onto the active layer's main canvas with the current settings.
*   **History**: Immediately after stamping, the active layer's canvas is exported to a `dataURL`, and this new source is used to create a new, reversible "Add Text" state in the layer's history.

## 7. Gradient Tool

The Gradient tool allows for applying smooth color transitions to a layer.

*   **Live Preview**: When the Gradient tool is active, the `CanvasEditor` listens for a click-and-drag motion. On each mouse move during the drag, it clears the top-level interaction canvas and draws the gradient defined by the settings in the `GradientControls`. The start and end points of the drag define the gradient's vector (for linear) or radius (for radial).
*   **Stamping**: When the user releases the mouse, the final gradient is rendered permanently onto the active layer's main canvas. Unlike the brush, the gradient fills the entire layer, with the drag motion controlling its properties.
*   **History**: Immediately after stamping, the active layer's canvas is exported to a `dataURL`, and this new source is used to create a new, reversible "Gradient" state in the layer's history.

## 8. Zoom, Pan & Drawing

These interactive features are handled within the `CanvasEditor` for a fluid experience.

*   **State Management**: The `zoom` (percentage), `baseScale` (fit-to-screen ratio), and `panOffset` (`{x, y}`) are stored in the `ImageState`.
*   **CSS Transform**: The entire stack of canvas elements is wrapped in a container `<div>`. The zoom and pan are applied via a single CSS `transform: translate(...) scale(...)` on this container, ensuring all layers move and scale together perfectly.
*   **Mouse-Centric Zooming**: The `onWheel` event handler calculates the new `panOffset` required to keep the point under the mouse cursor stationary relative to the viewport, creating an intuitive zoom experience.
*   **Auto-Fit & Centering**: On first load, the `CanvasEditor` calculates the optimal scale (`baseScale`) to fit the image within the viewport. This scale is then treated as the "100%" level for the zoom slider, making the zoom relative and consistent.

## 9. Image Upload & Validation

The application ensures a robust upload experience by performing client-side validation.

*   **File Picker Hinting**: The file input elements use the `accept="image/*"` attribute to instruct the browser to prioritize showing image files in the file selection dialog.
*   **MIME Type Validation**: After files are selected, the application iterates through them and validates that each file's MIME type begins with `image/`. Any non-image files are automatically discarded. If a user attempts to upload only unsupported file types, a clear error message is displayed. This prevents errors from attempting to process invalid files and provides helpful user feedback.
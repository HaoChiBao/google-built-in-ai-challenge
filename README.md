<div align="center">
  
<h3 align="center">101 Google Built In AI</h3>

  <p align="center">
    A Chrome extension that summarizes and highlights text using Google's AI.
    <br />
     <a href="#"></a>
  </p>
</div>

## Table of Contents

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
      </ul>
    </li>
    <li><a href="#architecture">Architecture</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#future-enhancements">Future Enhancements</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

The "101 Google Built In AI" Chrome extension allows users to highlight text on any webpage and receive a summarized version, powered by Google's AI. It provides concise and elaborate summaries, keyword highlighting, and options for saving and collaborating on highlights.

### Key Features

- **Text Summarization:** Condenses highlighted text into concise or elaborate summaries.
- **Keyword Highlighting:** Identifies and highlights key words and sentences within the selected text.
- **Copy/Paste Functionality:** Allows users to easily copy the generated summaries.
- **Highlight Management:** Provides a user interface to toggle between original highlights and summarized text, and eventually delete highlights.
- **Data Storage:** Option to save highlights locally or to a Google Doc.
- **Collaboration:** Planned feature for collaborative highlighting and summarization.

## Architecture

The extension's architecture consists of the following components:

- **Content Script (content.js):** Injects UI elements into webpages, handles text selection, and communicates with the background script.  Uses custom HTML elements (`gemini-dropdown`, `gemini-highlight`, etc.) and CSS for styling.
- **Background Script (background.js):** Listens for messages from the content script, interacts with the AI model to generate summaries and keywords, and sends the results back to the content script.
- **AI Response Module (AIResponse.js):** Contains the logic for interacting with the AI model to generate summaries and extract keywords.
- **Color Conversion Module (colorToFilterCSS.js):**  Calculates CSS filters based on the most common color in the highlighted text.
- **Manifest (manifest.json):**  Specifies the extension's metadata, permissions, and scripts.
- **Server (server.js):** A local server (Node.js with Express) used for markdown to HTML conversion.

## Getting Started

### Prerequisites

- Google Chrome or Chromium-based browser
- Node.js and npm (if you want to run the local markdown server)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [repository URL]
    cd [repository directory]
    ```
2.  **Load the extension in Chrome:**
    *   Open Chrome and go to `chrome://extensions/`.
    *   Enable "Developer mode" in the top right corner.
    *   Click "Load unpacked" and select the `extension` directory from the cloned repository.
3.  **(Optional) Start the local markdown server:**
    *   Navigate to the `server` directory: `cd server`
    *   Install dependencies: `npm install`
    *   Run the server: `npm start`

## Future Enhancements

Based on the `notes.txt` file, the following enhancements are planned:

*   Working copy/paste functionality with visual feedback.
*   A button to delete highlights.
*   Saving copied text to a Google Doc or similar service.
*   Saving highlights locally.
*   Adding collaboration features.
*   Highlighting only the key words in a paragraph.
*   Address the `NotSupportedError` by handling uncommon names or languages.

## Acknowledgments

- This README was created with [README Generator](https://github.com/owengretzinger/readme-generator) — an AI tool that understands your entire codebase.
- The color conversion logic is adapted from an open-source project (see `colorToFilterCSS.js` for details).

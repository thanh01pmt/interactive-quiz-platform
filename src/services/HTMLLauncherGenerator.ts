
import { QuizConfig } from '../types'; // Corrected path

const escapeAttribute = (unsafe: string | undefined): string => {
  if (typeof unsafe !== 'string') return '';
  return unsafe.replace(/"/g, '&quot;');
};

export const generateLauncherHTML = (
  quizConfig: QuizConfig,
  libraryJSPath: string = 'lib/interactive-quiz-kit.esm.js',
  quizDataPath: string = 'quiz_data.json', // This path is relative to the launcher in the ZIP
  blocklyCSSPath: string = 'blockly-styles.css', // This path is relative to the launcher
  title?: string
): string => {
  const pageTitle = escapeAttribute(title || quizConfig.title || 'Quiz');
  
  // Quiz data will be fetched from the relative quizDataPath
  // The import paths for React and the library are relative to the launcher in the SCORM package

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; background-color: #111827; /* slate-900 */ color: #f3f4f6; /* slate-100 */ display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding-top: 20px; box-sizing: border-box; }
    #root { width: 100%; max-width: 900px; }
    .loading-spinner {
      border: 4px solid #4b5563; /* slate-600 */ border-top: 4px solid #3b82f6; /* blue-500 */
      border-radius: 50%; width: 40px; height: 40px;
      animation: spin 1s linear infinite;
      position: absolute; top: calc(50% - 20px); left: calc(50% - 20px);
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .status-message { text-align: center; padding: 20px; margin-top: 60px; background-color: #1f2937; border: 1px solid #374151; color: #9ca3af; border-radius: 8px; }
  </style>
  <link rel="stylesheet" href="${escapeAttribute(blocklyCSSPath)}">
  <script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@^19.1.0",
      "react-dom/client": "https://esm.sh/react-dom@^19.1.0/client"
    }
  }
  </script>
</head>
<body>
  <div id="root">
    <div class="loading-spinner" aria-label="Loading quiz content"></div>
    <p class="status-message" role="status">Loading Quiz...</p>
  </div>

  <script type="module">
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    // Assuming libraryJSPath is relative to this HTML file in the SCORM package
    import { QuizPlayer } from './${escapeAttribute(libraryJSPath)}';

    async function loadQuizData() {
      try {
        const response = await fetch('./${escapeAttribute(quizDataPath)}');
        if (!response.ok) {
          throw new Error('Failed to load quiz data: ' + response.statusText);
        }
        return await response.json();
      } catch (error) {
        console.error("Error loading quiz data:", error);
        const rootEl = document.getElementById('root');
        if (rootEl) {
            rootEl.innerHTML = '<p class="status-message" role="alert">Error: Could not load quiz configuration. Please check package integrity.</p>';
        }
        return null;
      }
    }
    
    function showStatusMessage(message, isError = false) {
        const rootEl = document.getElementById('root');
        if (rootEl) {
            rootEl.innerHTML = ''; // Clear previous content
            const messageEl = document.createElement('p');
            messageEl.textContent = message;
            messageEl.className = 'status-message';
            if(isError) messageEl.style.color = '#ef4444'; // red-500
            rootEl.appendChild(messageEl);
        }
    }

    async function main() {
      const quizConfigData = await loadQuizData();
      if (!quizConfigData) {
        return; // Error message already shown
      }

      const App = () => {
        const handleQuizComplete = (result) => {
          console.log("Quiz Complete (SCORM Launcher):", result);
          showStatusMessage('Quiz completed. You may close this window or the LMS will manage navigation.');
        };

        const handleExitQuiz = () => {
          console.log("Quiz Exited (SCORM Launcher)");
          showStatusMessage('Quiz exited. You may close this window or the LMS will manage navigation.');
        };

        return React.createElement(QuizPlayer, {
          quizConfig: quizConfigData,
          onQuizComplete: handleQuizComplete,
          onExitQuiz: handleExitQuiz
        });
      };

      const rootElement = document.getElementById('root');
      if (rootElement) {
        // Clear loading message before rendering React app
        rootElement.innerHTML = ''; 
        const reactRoot = ReactDOM.createRoot(rootElement);
        reactRoot.render(React.createElement(React.StrictMode, null, React.createElement(App)));
      } else {
        console.error('Root element not found for SCORM launcher.');
      }
    }

    main();
  </script>
</body>
</html>`;
};

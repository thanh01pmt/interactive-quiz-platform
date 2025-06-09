
import { QuizConfig } from '../types';

const escapeAttribute = (unsafe: string): string => {
  return unsafe.replace(/"/g, '&quot;');
};

export const generateLauncherHTML = (
  quizConfig: QuizConfig,
  libraryJSPath: string = 'lib/interactive-quiz-kit.esm.js',
  quizDataPath: string = 'quiz_data.json',
  blocklyCSSPath: string = 'blockly-styles.css',
  title?: string
): string => {
  const pageTitle = escapeAttribute(title || quizConfig.title || 'Quiz');
  const quizConfigJsonString = JSON.stringify(quizConfig); // Embed directly for simplicity

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    body { margin: 0; font-family: sans-serif; background-color: #f0f4f8; display: flex; justify-content: center; align-items: flex-start; min-height: 100vh; padding-top: 20px; box-sizing: border-box; }
    #root { width: 100%; max-width: 900px; /* Adjust max-width as needed */ }
    /* Basic loading spinner */
    .loading-spinner {
      border: 4px solid #f3f3f3; border-top: 4px solid #3498db;
      border-radius: 50%; width: 40px; height: 40px;
      animation: spin 1s linear infinite;
      position: absolute; top: 50%; left: 50%;
      margin-left: -20px; margin-top: -20px;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
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
    <div class="loading-spinner"></div>
    <p style="text-align: center; margin-top: 80px;">Loading Quiz...</p>
  </div>

  <script type="module">
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    // The library will be imported from its path within the SCORM package
    import { QuizPlayer } from './${escapeAttribute(libraryJSPath)}';

    const quizData = ${quizConfigJsonString}; // Embed quiz data directly

    const App = () => {
      const handleQuizComplete = (result) => {
        console.log("Quiz Complete (SCORM Launcher):", result);
        // SCORMService within QuizEngine should handle LMS communication.
        // Optionally, window.close() or a message can be shown here if allowed by LMS.
        // LMS usually controls the window.
        const completionMessage = document.createElement('p');
        completionMessage.textContent = 'Quiz completed. You may close this window or the LMS will manage navigation.';
        completionMessage.style.textAlign = 'center';
        completionMessage.style.padding = '20px';
        completionMessage.style.backgroundColor = '#e6fffa';
        completionMessage.style.border = '1px solid #38b2ac';
        completionMessage.style.color = '#234e52';
        document.getElementById('root').innerHTML = ''; // Clear spinner/loading
        document.getElementById('root').appendChild(completionMessage);
      };

      const handleExitQuiz = () => {
        console.log("Quiz Exited (SCORM Launcher)");
        // Similar to onQuizComplete, SCORMService handles termination.
         const exitMessage = document.createElement('p');
        exitMessage.textContent = 'Quiz exited. You may close this window or the LMS will manage navigation.';
        exitMessage.style.textAlign = 'center';
        exitMessage.style.padding = '20px';
        document.getElementById('root').innerHTML = ''; // Clear spinner/loading
        document.getElementById('root').appendChild(exitMessage);
        // LMS might close the window or navigate away.
      };
      
      // Remove loading indicator once React app takes over
      const loadingRoot = document.getElementById('root');
      if (loadingRoot && loadingRoot.firstChild && loadingRoot.firstChild.nodeName !== 'DIV' /* not the quiz player root */) {
        // More robust check might be needed if QuizPlayer renders a div immediately
        // For now, assume if it's not the spinner, it's React's content
      } else if (loadingRoot) {
          // If only spinner/loading text is there, clear it.
          // This logic might need refinement based on how QuizPlayer initializes.
          // A safer bet is to have QuizPlayer itself remove the spinner.
          // For now, this is a simple approach.
          // loadingRoot.innerHTML = ''; // Let React manage the root's content.
      }


      return React.createElement(QuizPlayer, {
        quizConfig: quizData,
        onQuizComplete: handleQuizComplete,
        onExitQuiz: handleExitQuiz
      });
    };

    const rootElement = document.getElementById('root');
    if (rootElement) {
      // Clear loading message before rendering React app
      const loadingSpinner = rootElement.querySelector('.loading-spinner');
      const loadingText = rootElement.querySelector('p');
      if (loadingSpinner) loadingSpinner.remove();
      if (loadingText) loadingText.remove();
      
      const reactRoot = ReactDOM.createRoot(rootElement);
      reactRoot.render(React.createElement(App));
    } else {
      console.error('Root element not found for SCORM launcher.');
    }
  </script>
</body>
</html>`;
};

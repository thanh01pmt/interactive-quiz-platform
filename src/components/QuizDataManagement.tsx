
import React, { useState, useCallback } from 'react';
import { QuizConfig } from '../../types'; // Corrected path
import { Button } from './shared/Button';
import { Card } from './shared/Card';
import { generateIMSManifestXML } from '../../services/SCORMManifestGenerator'; // Corrected path
import { generateLauncherHTML } from '../../services/HTMLLauncherGenerator'; // Corrected path
import JSZip from 'jszip'; 

interface QuizDataManagementProps {
  onQuizLoad: (quiz: QuizConfig) => void;
  currentQuiz: QuizConfig | null;
}

export const QuizDataManagement: React.FC<QuizDataManagementProps> = ({ onQuizLoad, currentQuiz }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);


  const handleFileImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setExportMessage(null);
    setIsLoading(true);
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const quizData = JSON.parse(text) as QuizConfig;
            if (quizData && quizData.id && quizData.title && Array.isArray(quizData.questions)) {
              onQuizLoad(quizData);
            } else {
              setError("Invalid quiz JSON format. Missing required fields (id, title, questions array).");
            }
          } else {
            setError("Failed to read file content.");
          }
        } catch (err) {
          console.error("Error parsing JSON:", err);
          setError("Failed to parse JSON. Please ensure the file is a valid quiz JSON.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Error reading file.");
        setIsLoading(false);
      }
      reader.readAsText(file);
    } else {
      setIsLoading(false);
    }
    event.target.value = '';
  }, [onQuizLoad]);

  const handleExportQuiz = useCallback(() => {
    if (!currentQuiz) {
      setError("No quiz loaded to export.");
      setExportMessage(null);
      return;
    }
    try {
      const jsonString = JSON.stringify(currentQuiz, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentQuiz.id.replace(/\s+/g, '_')}_quiz.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setError(null);
      setExportMessage("Quiz JSON exported successfully.");
    } catch (err) {
      console.error("Error exporting quiz:", err);
      setError("Failed to export quiz data.");
      setExportMessage(null);
    }
  }, [currentQuiz]);

  const handleExportSCORMPackage = useCallback(async () => {
    if (!currentQuiz) {
      setError("No quiz loaded to export as SCORM package.");
      setExportMessage(null);
      return;
    }
    setError(null);
    setExportMessage("Generating SCORM package...");
    setIsLoading(true);

    try {
      const zip = new JSZip();

      const libraryJSPath = 'lib/interactive-quiz-kit.esm.js'; 
      const quizDataPath = 'quiz_data.json';
      const launcherPath = 'quiz_launcher.html';
      const blocklyCSSPath = 'blockly-styles.css';

      const manifestXML = generateIMSManifestXML(currentQuiz, libraryJSPath, quizDataPath, launcherPath, blocklyCSSPath);
      const launcherHTML = generateLauncherHTML(currentQuiz, libraryJSPath, quizDataPath, blocklyCSSPath);
      const quizDataJSON = JSON.stringify(currentQuiz, null, 2);

      zip.file('imsmanifest.xml', manifestXML);
      zip.file(launcherPath, launcherHTML);
      zip.file(quizDataPath, quizDataJSON);
      
      zip.folder('lib'); // Create lib folder

      // Attempt to fetch blockly-styles.css. This assumes the app serving this component
      // (e.g., the example app) makes blockly-styles.css available at its root public path.
      try {
        const response = await fetch('/blockly-styles.css'); 
        if (!response.ok) {
          throw new Error(`Failed to fetch blockly-styles.css: ${response.statusText}`);
        }
        const blocklyCSSContent = await response.text();
        zip.file(blocklyCSSPath, blocklyCSSContent);
      } catch (fetchError) {
        console.error("Error fetching blockly-styles.css for SCORM package:", fetchError);
        // Add a note about this to the export message, but still proceed.
        let currentError = error ? `${error}\n` : "";
        currentError += `Could not fetch blockly-styles.css from /blockly-styles.css. The SCORM package will be generated without it. This file is necessary for Blockly/Scratch questions. Please ensure it is manually added to the ZIP or made available in the LMS environment. Error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`;
        setError(currentError);
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentQuiz.id.replace(/\s+/g, '_')}_SCORM_package.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportMessage(
        `SCORM package ZIP downloaded. IMPORTANT: You MUST manually add your library's JS bundle ` +
        `(e.g., 'interactive-quiz-kit.esm.js' from your 'dist/' or 'dist/lib/' folder) ` +
        `into the 'lib/' directory within the downloaded ZIP file for it to function correctly in an LMS.` +
        (error && error.includes("blockly-styles.css") ? "\nAlso, remember to address the 'blockly-styles.css' issue mentioned above." : "")
      );
      // Clear only fetch-related error if other parts succeeded
      if (error && error.includes("blockly-styles.css") && !error.includes("Failed to generate SCORM package ZIP")) {
        setError(null); 
      }


    } catch (err) {
      console.error("Error generating SCORM package ZIP:", err);
      setError(`Failed to generate SCORM package ZIP: ${err instanceof Error ? err.message : String(err)}`);
      setExportMessage(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuiz, error]); // Added 'error' to dependency array of useCallback because it's read inside.
  

  return (
    <Card title="Quiz Data Management" className="mb-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="quiz-file-input" className="block text-sm font-medium text-slate-300 mb-1">
            Import Quiz JSON
          </label>
          <input
            id="quiz-file-input"
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 disabled:opacity-50"
            disabled={isLoading}
          />
          {isLoading && !exportMessage?.startsWith("Generating") && <p className="text-sm text-sky-400 mt-1">Loading quiz...</p>}
        </div>
        
        {currentQuiz && (
          <div className="flex flex-wrap gap-4">
            <Button onClick={handleExportQuiz} variant="secondary" disabled={isLoading}>
              Export Current Quiz JSON
            </Button>
            <Button onClick={handleExportSCORMPackage} variant="secondary" disabled={isLoading}>
              {isLoading && exportMessage?.startsWith("Generating") ? 'Generating ZIP...' : 'Export SCORM Package ZIP'}
            </Button>
          </div>
        )}

        {error && <p className="text-sm text-red-400 mt-2 p-2 bg-red-900 bg-opacity-30 rounded whitespace-pre-wrap">{error}</p>}
        {exportMessage && !error && ( // Only show export message if there's no critical error
            <p className={`text-sm mt-2 p-2 rounded ${exportMessage.includes("IMPORTANT") ? 'bg-yellow-900 bg-opacity-50 text-yellow-300' : 'text-green-400 bg-green-900 bg-opacity-30'}`}>
                {exportMessage.split("IMPORTANT:")[0]}
                {exportMessage.includes("IMPORTANT:") && (
                    <>
                        <strong className="font-bold block mt-1">IMPORTANT:</strong>
                        <span>{exportMessage.split("IMPORTANT:")[1]}</span>
                    </>
                )}
            </p>
        )}

      </div>
    </Card>
  );
};

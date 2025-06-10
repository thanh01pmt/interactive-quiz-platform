
import React, { useState, useCallback, useEffect } from 'react';
import { QuizConfig, QuizResult as QuizResultType } from 'interactive-quiz-kit/types';
import { QuizPlayer } from 'interactive-quiz-kit/components/QuizPlayer';
import { QuizDataManagement } from 'interactive-quiz-kit/components/QuizDataManagement';
import { sampleQuiz } from 'interactive-quiz-kit/services/sampleQuiz';
import { Button } from 'interactive-quiz-kit/components/shared/Button';
import { Card } from 'interactive-quiz-kit/components/shared/Card';
import { QuizAuthoringTool } from 'interactive-quiz-kit/components/authoring/QuizAuthoringTool';

type AppState = 'welcome' | 'playing' | 'authoring' | 'results_overview';

const App: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizConfig | null>(null);
  const [appState, setAppState] = useState<AppState>('welcome');
  const [lastQuizResult, setLastQuizResult] = useState<QuizResultType | null>(null);

  const handleQuizLoad = useCallback((quizData: QuizConfig) => {
    setCurrentQuiz(quizData);
    setAppState('playing');
    setLastQuizResult(null);
  }, []);

  const handleLoadSampleQuiz = useCallback(() => {
    handleQuizLoad(sampleQuiz);
  }, [handleQuizLoad]);

  const handleQuizComplete = useCallback((result: QuizResultType) => {
    setLastQuizResult(result);
    // QuizPlayer shows detailed results. App state can remain 'playing' 
    // as QuizPlayer itself transitions to QuizResult component.
    // If a separate overview was needed: setAppState('results_overview');
    console.log("Quiz completed in root App, result: ", result);
  }, []);
  
  const handleExitQuiz = useCallback(() => {
    // If exiting from player or results, go to welcome
    setCurrentQuiz(null); // Clear the current quiz if exiting player
    setAppState('welcome');
    setLastQuizResult(null); 
  }, []);

  const handleStartAuthoring = useCallback(() => {
    // If currentQuiz exists, it will be passed for editing.
    // Otherwise, QuizAuthoringTool will start with a new/empty quiz.
    setAppState('authoring');
  }, []);

  const handleSaveAuthoredQuiz = useCallback((authoredQuiz: QuizConfig) => {
    setCurrentQuiz(authoredQuiz);
    setAppState('welcome'); // Go to welcome screen, user can choose to play or export
    alert("Quiz saved! You can now play or export it from the main screen.");
  }, []);
  
  const handleExitAuthoring = useCallback(() => {
    setAppState('welcome');
  }, []);


  useEffect(() => {
    if (!currentQuiz && (appState === 'playing' || appState === 'results_overview')) {
        setAppState('welcome');
    }
  }, [currentQuiz, appState]);


  const renderContent = () => {
    switch (appState) {
      case 'playing':
        if (currentQuiz) {
          return <QuizPlayer quizConfig={currentQuiz} onQuizComplete={handleQuizComplete} onExitQuiz={handleExitQuiz} />;
        }
        setAppState('welcome'); 
        return null; 
      case 'authoring':
        return (
          <QuizAuthoringTool 
            initialQuizConfig={currentQuiz} // Pass loaded quiz for editing, or null for new
            onSaveQuiz={handleSaveAuthoredQuiz}
            onExitAuthoring={handleExitAuthoring}
          />
        );
      case 'welcome':
      default:
        return (
          <div className="space-y-8 max-w-xl mx-auto">
            <Card title="Welcome to the Interactive Quiz Platform!">
              <p className="text-slate-300 mb-6">
                Load a quiz from a JSON file, try our sample quiz, or create your own!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-center">
                <Button onClick={handleLoadSampleQuiz} variant="primary" size="lg">
                  Play Sample Quiz
                </Button>
                <Button onClick={handleStartAuthoring} variant="secondary" size="lg">
                  {currentQuiz ? 'Edit Current Quiz' : 'Create New Quiz'}
                </Button>
              </div>
            </Card>
            <QuizDataManagement onQuizLoad={handleQuizLoad} currentQuiz={currentQuiz} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 flex flex-col items-center">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-600">
          Interactive Quiz Platform
        </h1>
      </header>
      <main className="w-full container mx-auto">
        {renderContent()}
      </main>
      <footer className="mt-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Interactive Quiz Platform. Built with React & Tailwind CSS.</p>
      </footer>
    </div>
  );
};

export default App;

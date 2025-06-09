import React, { useState, useCallback, useEffect } from 'react';
// When using the library (after npm link or npm install)
import { 
  QuizConfig, 
  QuizResult as QuizResultType, // Renamed to avoid conflict with component
  QuizPlayer, 
  QuizDataManagement,
  // sampleQuiz // If you decide to export it from the library for easy demo
} from 'interactive-quiz-kit'; 

// For local development *before* library structure is fully linked,
// or if sampleQuiz is not exported from the library's main entry:
import { sampleQuiz } from '../../src/services/sampleQuiz'; // Adjust path if sampleQuiz is not exported by lib
import { Button } from '../../src/components/shared/Button'; // Adjust path
import { Card } from '../../src/components/shared/Card';   // Adjust path


type AppState = 'welcome' | 'playing' | 'results_overview';

const App: React.FC = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizConfig | null>(null);
  const [appState, setAppState] = useState<AppState>('welcome');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // The QuizPlayer already shows detailed results. 
    // App.tsx could show a summary or just transition.
  }, []);
  
  const handleExitQuiz = useCallback(() => {
    setCurrentQuiz(null);
    setAppState('welcome');
    setLastQuizResult(null);
  }, []);

  useEffect(() => {
    if (!currentQuiz && appState !== 'welcome') {
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
      case 'welcome':
      default:
        return (
          <div className="space-y-8 max-w-xl mx-auto">
            <Card title="Welcome to the Interactive Quiz Platform!">
              <p className="text-slate-300 mb-6">
                Load a quiz from a JSON file or try our sample quiz to get started.
                Create engaging quizzes with various question types and challenge yourself or others!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={handleLoadSampleQuiz} variant="primary" size="lg">
                  Play Sample Quiz
                </Button>
              </div>
            </Card>
            {/* 
              When using the library, QuizDataManagement would be imported like this:
              <QuizDataManagement onQuizLoad={handleQuizLoad} currentQuiz={currentQuiz} />
              
              For now, using relative path for the example to work during transition:
            */}
            <QuizDataManagement onQuizLoad={handleQuizLoad} currentQuiz={currentQuiz} />
            <Card title="Quiz Authoring (Coming Soon)">
                <p className="text-slate-400">
                    Soon you'll be able to create and edit quizzes directly within the platform!
                    For now, please use the JSON import feature with a pre-formatted quiz file.
                </p>
            </Card>
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
        <p>This is the example app.</p>
      </footer>
    </div>
  );
};

export default App;
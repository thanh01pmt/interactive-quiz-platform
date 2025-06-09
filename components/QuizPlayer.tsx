import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuizConfig, QuizQuestion as QuizQuestionType, UserAnswerType, QuizResult as QuizResultType, QuizEngineCallbacks } from '../types';
import { QuizEngine } from '../services/QuizEngine';
import { QuestionRenderer } from './QuestionRenderer';
import { QuizResult } from './QuizResult';
import { Button } from './shared/Button';
import { Card } from './shared/Card';

interface QuizPlayerProps {
  quizConfig: QuizConfig;
  onQuizComplete: (result: QuizResultType) => void;
  onExitQuiz: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quizConfig, onQuizComplete, onExitQuiz }) => {
  const [quizEngine, setQuizEngine] = useState<QuizEngine | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestionType | null>(null);
  const [userAnswer, setUserAnswer] = useState<UserAnswerType | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [quizResults, setQuizResults] = useState<QuizResultType | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Keep a ref to the engine to ensure cleanup uses the correct instance
  const engineRef = useRef<QuizEngine | null>(null);

  const handleFinishQuiz = useCallback(() => {
    if (engineRef.current) {
      const results = engineRef.current.calculateResults(); // This will also trigger onQuizFinish callback
      setQuizResults(results);
      setShowResults(true);
      onQuizComplete(results); // For App.tsx if needed
    }
  }, [onQuizComplete]);

  useEffect(() => {
    // Cleanup previous engine instance if it exists
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    const callbacks: QuizEngineCallbacks = {
      onQuizStart: (initialData) => {
        console.log("Quiz Started (via callback)", initialData);
        setCurrentQuestion(initialData.initialQuestion);
        // For a new engine instance, the answer for the initial question is null.
        // The main useEffect body (after newEngine is created) will sync state from the engine.
        setUserAnswer(null);
        setTimeLeft(initialData.timeLimitInSeconds);
      },
      onQuestionChange: (question, cqNum, tqNum) => {
        console.log(`Question Changed (via callback): ${cqNum}/${tqNum}`, question);
        setCurrentQuestion(question);
        // If 'question' is null, userAnswer should be null.
        // If 'question' is not null:
        //   - For the *initial* call from QuizEngine constructor, engineRef.current might be stale or null.
        //     In this case, userAnswer will effectively be null. The main useEffect body handles the true initial state.
        //   - For *subsequent* calls (user navigation), engineRef.current is valid.
        if (question && engineRef.current && engineRef.current.questions[cqNum-1]?.id === question.id) {
          // Check if engineRef.current is the relevant engine instance for this question
          setUserAnswer(engineRef.current.getUserAnswer(question.id) || null);
        } else {
          // Fallback for initial constructor call, or if question is null, or engineRef not aligned
          setUserAnswer(null);
        }
      },
      onAnswerSubmit: (question, answer) => {
        console.log(`Answer Submitted (via callback) for Q ID:${question.id}, Prompt: "${question.prompt.substring(0,30)}..."`, answer);
        // Example of using the richer question object for custom logic:
        // if (question.points && question.points >= 15) {
        //   console.log(`High-value question answered: ${question.prompt.substring(0,50)}...`);
        // }
      },
      onQuizFinish: (results) => {
        console.log("Quiz Finished (via callback)", results);
        // This callback is good for external logging or side effects.
        // QuizPlayer already handles setting state for results internally via handleFinishQuiz.
      },
      onTimeTick: (timeLeftInSeconds) => {
        setTimeLeft(timeLeftInSeconds);
      },
      onQuizTimeUp: () => {
        console.log("Quiz Time Up (via callback)!");
        alert("Time's up!"); // Basic notification
        handleFinishQuiz();
      }
    };

    const newEngine = new QuizEngine({ config: quizConfig, callbacks });
    setQuizEngine(newEngine);
    engineRef.current = newEngine; // Update ref

    // Initial state setup based on the new engine
    const initialQ = newEngine.getCurrentQuestion();
    setCurrentQuestion(initialQ); // This might be redundant if callbacks already set it, but harmless and ensures sync.
    setUserAnswer(initialQ ? newEngine.getUserAnswer(initialQ.id) || null : null); // Correctly gets initial answer (null for new engine)
    setShowResults(false);
    setQuizResults(null);
    setTimeLeft(newEngine.getTimeLeftInSeconds()); // Ensures timeLeft is synced from the new engine.

    // Cleanup function for this effect
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizConfig]); // handleFinishQuiz is not needed here as its definition is stable


  const handleAnswerChange = useCallback((answer: UserAnswerType) => {
    setUserAnswer(answer); // Local UI update
    if (engineRef.current && currentQuestion) {
      engineRef.current.submitAnswer(currentQuestion.id, answer); // Engine handles its state + onAnswerSubmit callback
    }
  }, [currentQuestion]);

  const navigate = (direction: 'next' | 'prev') => {
    if (!engineRef.current) return;
    // Engine's next/prev methods will trigger onQuestionChange callback
    if (direction === 'next') {
      engineRef.current.nextQuestion();
    } else {
      engineRef.current.previousQuestion();
    }
  };

  const handleNext = () => navigate('next');
  const handlePrev = () => navigate('prev');
  
  const handleRestartQuiz = useCallback(() => {
    if (engineRef.current) {
        engineRef.current.destroy();
    }
    // Define callbacks for the new engine instance.
    // These are similar to the main useEffect, but ensure engineRef.current is used where appropriate.
    const callbacks: QuizEngineCallbacks = {
        onQuizStart: (initialData) => {
            setCurrentQuestion(initialData.initialQuestion);
            setUserAnswer(null);
            setTimeLeft(initialData.timeLimitInSeconds);
        },
        onQuestionChange: (q, cqNum, tqNum) => {
            setCurrentQuestion(q);
            // engineRef.current will point to the new engine by the time this is called by user actions.
            // If called by constructor, it's fine for userAnswer to be null as main block below will set it.
            if (q && engineRef.current && engineRef.current.questions[cqNum-1]?.id === q.id) {
                 setUserAnswer(engineRef.current.getUserAnswer(q.id) || null);
            } else {
                 setUserAnswer(null);
            }
        },
        onAnswerSubmit: (question, answer) => { // Updated signature
           console.log(`(Restart) Answer Submitted (via callback) for Q ID:${question.id}`, answer);
        },
        onTimeTick: (seconds) => setTimeLeft(seconds),
        onQuizTimeUp: () => { alert("Time's up!"); handleFinishQuiz(); },
        // other callbacks like onQuizFinish can be added if their behavior during restart needs specific handling.
    };

    const newEngine = new QuizEngine({ config: quizConfig, callbacks });
    setQuizEngine(newEngine);
    engineRef.current = newEngine;

    const initialQ = newEngine.getCurrentQuestion();
    setCurrentQuestion(initialQ);
    setUserAnswer(initialQ ? newEngine.getUserAnswer(initialQ.id) || null : null);
    setShowResults(false);
    setQuizResults(null);
    setTimeLeft(newEngine.getTimeLeftInSeconds());
  }, [quizConfig, handleFinishQuiz]);


  if (showResults && quizResults && quizConfig) {
    return (
        <QuizResult 
            result={quizResults} 
            quizConfig={quizConfig}
            onRestartQuiz={handleRestartQuiz}
            onLoadNewQuiz={onExitQuiz}
        />
    );
  }

  if (!quizEngine || !currentQuestion) {
    return (
      <Card title="Quiz Status" className="w-full max-w-3xl mx-auto">
        <p className="text-slate-400">{!quizEngine ? "Initializing Quiz Engine..." : "Loading question..."}</p>
        <Button onClick={onExitQuiz} variant="secondary" className="mt-4">Return to Home</Button>
      </Card>
    );
  }
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card title={quizConfig.title} className="mb-6">
        {quizConfig.description && <p className="text-slate-300 mb-4">{quizConfig.description}</p>}
         {timeLeft !== null && (
          <div className={`text-right font-semibold mb-4 text-lg ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : 'text-sky-400'}`}>
            Time Left: {formatTime(timeLeft)}
          </div>
        )}
      </Card>

      <QuestionRenderer
        question={currentQuestion}
        onAnswerChange={handleAnswerChange}
        userAnswer={userAnswer}
        questionNumber={quizEngine.getCurrentQuestionNumber()}
        totalQuestions={quizEngine.getTotalQuestions()}
        showCorrectAnswer={quizConfig.settings?.showCorrectAnswers === 'immediately'}
        shuffleOptions={quizConfig.settings?.shuffleOptions}
      />

      <div className="mt-8 flex justify-between items-center">
        <Button
          onClick={handlePrev}
          disabled={quizEngine.getCurrentQuestionNumber() <= 1}
          variant="secondary"
        >
          Previous
        </Button>
        
        {quizEngine.isQuizFinished() ? (
           <Button onClick={handleFinishQuiz} variant="primary" size="lg">
            Finish Quiz
          </Button>
        ) : (
          <Button onClick={handleNext} variant="primary">
            Next
          </Button>
        )}
      </div>
       <Button onClick={onExitQuiz} variant="ghost" className="mt-8 w-full">
        Exit Quiz
      </Button>
    </div>
  );
};
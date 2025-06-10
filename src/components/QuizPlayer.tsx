
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuizConfig, QuizQuestion as QuizQuestionType, UserAnswerType, QuizResult as QuizResultType, QuizEngineCallbacks } from '../types'; // Corrected
import { QuizEngine } from '../services/QuizEngine'; // Corrected
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
  const [studentNameFromLMS, setStudentNameFromLMS] = useState<string | undefined>(undefined);


  const engineRef = useRef<QuizEngine | null>(null);

  const handleFinishQuiz = useCallback(async () => {
    if (engineRef.current) {
      const results = await engineRef.current.calculateResults();
      setQuizResults(results);
      setShowResults(true);
      onQuizComplete(results);
    }
  }, [onQuizComplete]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    const callbacks: QuizEngineCallbacks = {
      onQuizStart: (initialData) => {
        console.log("Quiz Started (via callback)", initialData);
        setCurrentQuestion(initialData.initialQuestion);
        setUserAnswer(null);
        setTimeLeft(initialData.timeLimitInSeconds);
        setStudentNameFromLMS(initialData.studentName);
        if(initialData.scormStatus && initialData.scormStatus !== 'idle'){
            console.log("Initial SCORM Status:", initialData.scormStatus, "Student:", initialData.studentName);
        }
      },
      onQuestionChange: (question, cqNum, _tqNum) => { // tqNum changed to _tqNum
        console.log(`Question Changed (via callback): ${cqNum}/${_tqNum}`, question);
        setCurrentQuestion(question);
        if (question && engineRef.current && engineRef.current.questions[cqNum-1]?.id === question.id) {
          setUserAnswer(engineRef.current.getUserAnswer(question.id) || null);
        } else {
          setUserAnswer(null);
        }
      },
      onAnswerSubmit: (question, answer) => {
        console.log(`Answer Submitted (via callback) for Q ID:${question.id}, Prompt: "${question.prompt.substring(0,30)}..."`, answer);
      },
      onQuizFinish: (resultsWithAllStatus) => {
        console.log("Quiz Finished (via callback with all statuses)", resultsWithAllStatus);
        setQuizResults(resultsWithAllStatus); // Ensure results from callback are also set
      },
      onTimeTick: (timeLeftInSeconds) => {
        setTimeLeft(timeLeftInSeconds);
      },
      onQuizTimeUp: async () => {
        console.log("Quiz Time Up (via callback)!");
        alert("Time's up!");
        await handleFinishQuiz();
      }
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

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
        engineRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizConfig]); 


  const handleAnswerChange = useCallback((answer: UserAnswerType) => {
    setUserAnswer(answer);
    if (engineRef.current && currentQuestion) {
      engineRef.current.submitAnswer(currentQuestion.id, answer);
    }
  }, [currentQuestion]);

  const navigate = (direction: 'next' | 'prev') => {
    if (!engineRef.current) return;
    if (direction === 'next') {
      engineRef.current.nextQuestion();
    } else {
      engineRef.current.previousQuestion();
    }
  };

  const handleNext = () => navigate('next');
  const handlePrev = () => navigate('prev');

  const handleRestartQuiz = useCallback(async () => {
    if (engineRef.current) {
        engineRef.current.destroy();
    }
    const callbacks: QuizEngineCallbacks = {
        onQuizStart: (initialData) => {
            setCurrentQuestion(initialData.initialQuestion);
            setUserAnswer(null);
            setTimeLeft(initialData.timeLimitInSeconds);
            setStudentNameFromLMS(initialData.studentName);
        },
        onQuestionChange: (q, cqNum, _tqNum) => { // tqNum changed to _tqNum
            setCurrentQuestion(q);
            if (q && engineRef.current && engineRef.current.questions[cqNum-1]?.id === q.id) {
                 setUserAnswer(engineRef.current.getUserAnswer(q.id) || null);
            } else {
                 setUserAnswer(null);
            }
        },
        onAnswerSubmit: (question, answer) => {
           console.log(`(Restart) Answer Submitted (via callback) for Q ID:${question.id}`, answer);
        },
        onQuizFinish: (resultsWithAllStatus) => {
           console.log("Quiz (Restart) Finished (via callback)", resultsWithAllStatus);
           setQuizResults(resultsWithAllStatus);
        },
        onTimeTick: (seconds) => setTimeLeft(seconds),
        onQuizTimeUp: async () => { alert("Time's up!"); await handleFinishQuiz(); },
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
        {studentNameFromLMS && (
            <p className="text-sm text-sky-300 mb-1">Student: {studentNameFromLMS}</p>
        )}
        {quizConfig.description && <p className="text-slate-300 mb-4">{quizConfig.description}</p>}
         {timeLeft !== null && (
          <div className={`text-right font-semibold mb-4 text-lg ${timeLeft <= 60 && timeLeft > 0 ? 'text-red-500 animate-pulse' : (timeLeft === 0 ? 'text-red-500' : 'text-sky-400')}`}>
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
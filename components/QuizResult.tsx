
import React from 'react';
import { QuizResult as QuizResultType, QuizConfig, QuizQuestion, UserAnswerType } from '../types';
import { Button } from './shared/Button';
import { Card } from './shared/Card';
import { QuestionRenderer } from './QuestionRenderer'; // To display questions with answers

interface QuizResultProps {
  result: QuizResultType;
  quizConfig: QuizConfig;
  onRestartQuiz: () => void;
  onLoadNewQuiz: () => void;
}

export const QuizResult: React.FC<QuizResultProps> = ({ result, quizConfig, onRestartQuiz, onLoadNewQuiz }) => {
  const getQuestionById = (id: string): QuizQuestion | undefined => {
    return quizConfig.questions.find(q => q.id === id);
  }

  return (
    <Card title="Quiz Results" className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-sky-400">
          Your Score: {result.score} / {result.maxScore} ({result.percentage.toFixed(2)}%)
        </h3>
        {result.passed !== undefined && (
          <p className={`text-2xl font-semibold mt-2 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
            {result.passed ? 'Congratulations, you passed!' : 'You did not pass this time.'}
          </p>
        )}
      </div>

      {quizConfig.settings?.showCorrectAnswers === 'end_of_quiz' && (
        <div className="space-y-6 mb-8">
          <h4 className="text-xl font-semibold text-slate-200">Review Your Answers:</h4>
          {result.questionResults.map((qr, index) => {
            const question = getQuestionById(qr.questionId);
            if (!question) return null;
            return (
              <div key={qr.questionId} className="border border-slate-700 rounded-lg p-4">
                 <div className="flex justify-between items-center mb-2">
                    <p className={`font-semibold ${qr.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      Question {index + 1}: {qr.isCorrect ? `Correct (+${question.points || 0} pts)` : `Incorrect (0 pts)`}
                    </p>
                 </div>
                <QuestionRenderer
                  question={question}
                  userAnswer={qr.userAnswer}
                  onAnswerChange={() => {}} // Read-only display
                  questionNumber={index + 1}
                  totalQuestions={quizConfig.questions.length}
                  showCorrectAnswer={true} // Always show correct answer in review
                />
              </div>
            );
          })}
        </div>
      )}


      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
        <Button onClick={onRestartQuiz} variant="primary" size="lg">
          Restart Quiz
        </Button>
        <Button onClick={onLoadNewQuiz} variant="secondary" size="lg">
          Load New Quiz
        </Button>
      </div>
    </Card>
  );
};

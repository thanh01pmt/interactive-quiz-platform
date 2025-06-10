
import React, { useState, useEffect } from 'react';
import { NumericQuestion, UserAnswerType } from '../types';

interface NumericQuestionUIProps {
  question: NumericQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const NumericQuestionUI: React.FC<NumericQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
}) => {
  const [currentAnswer, setCurrentAnswer] = useState<string>(
    typeof userAnswer === 'string' ? userAnswer : ''
  );

  useEffect(() => {
    setCurrentAnswer(typeof userAnswer === 'string' ? userAnswer : '');
  }, [userAnswer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string, numbers, decimal points, and negative sign
    if (value === '' || value === '-' || /^-?\d*\.?\d*$/.test(value)) {
        setCurrentAnswer(value);
        onAnswerChange(value);
    }
  };

  let borderColor = 'border-slate-600 focus:border-sky-500';
  let isCorrect = false;
  if (typeof userAnswer === 'string') {
    const userAnswerNum = parseFloat(userAnswer);
    if (!isNaN(userAnswerNum)) {
      if (question.tolerance !== undefined && question.tolerance !== null) {
        isCorrect = Math.abs(userAnswerNum - question.answer) <= question.tolerance;
      } else {
        isCorrect = userAnswerNum === question.answer;
      }
    }
  }

  if (showCorrectAnswer) {
    borderColor = isCorrect ? 'border-green-500' : 'border-red-500';
  }


  return (
    <div>
      <input
        type="text" // Using text to allow more flexible input before parsing
        inputMode="decimal" // Hint for mobile keyboards
        value={currentAnswer}
        onChange={handleChange}
        className={`block w-full md:w-1/2 px-3 py-2 border bg-slate-700 ${borderColor} rounded-md text-slate-100 placeholder-slate-400 focus:outline-none sm:text-sm`}
        placeholder="Enter a number"
        disabled={showCorrectAnswer}
        aria-label={question.prompt}
      />
      {showCorrectAnswer && (
        <div className="mt-2 text-sm">
          <p className="text-slate-400">
            Correct answer: {question.answer}
            {question.tolerance !== undefined && question.tolerance > 0 && ` (tolerance: ±${question.tolerance})`}
          </p>
        </div>
      )}
    </div>
  );
};

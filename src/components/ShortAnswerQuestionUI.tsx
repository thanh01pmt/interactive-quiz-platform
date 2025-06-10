
import React, { useState, useEffect } from 'react';
import { ShortAnswerQuestion, UserAnswerType } from '../types';

interface ShortAnswerQuestionUIProps {
  question: ShortAnswerQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const ShortAnswerQuestionUI: React.FC<ShortAnswerQuestionUIProps> = ({
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
    setCurrentAnswer(value);
    onAnswerChange(value);
  };

  let borderColor = 'border-slate-600 focus:border-sky-500';
  if (showCorrectAnswer) {
    const userAnswerTrimmed = currentAnswer.trim();
    const isCorrect = question.acceptedAnswers.some(accAns =>
        question.isCaseSensitive ? accAns.trim() === userAnswerTrimmed : accAns.trim().toLowerCase() === userAnswerTrimmed.toLowerCase()
    );
    borderColor = isCorrect ? 'border-green-500' : 'border-red-500';
  }

  return (
    <div>
      <input
        type="text"
        value={currentAnswer}
        onChange={handleChange}
        className={`block w-full px-3 py-2 border bg-slate-700 ${borderColor} rounded-md text-slate-100 placeholder-slate-400 focus:outline-none sm:text-sm`}
        placeholder="Type your answer here"
        disabled={showCorrectAnswer}
        aria-label={question.prompt}
      />
      {showCorrectAnswer && (
        <div className="mt-2 text-sm">
          <p className="text-slate-400">Accepted answer(s): {question.acceptedAnswers.join(', ')}</p>
        </div>
      )}
    </div>
  );
};

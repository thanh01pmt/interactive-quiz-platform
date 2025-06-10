
import React from 'react';
import { TrueFalseQuestion, UserAnswerType } from '../types';

interface TrueFalseQuestionUIProps {
  question: TrueFalseQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const TrueFalseQuestionUI: React.FC<TrueFalseQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
}) => {
  const options = [
    { id: 'true', text: 'True' },
    { id: 'false', text: 'False' },
  ];

  const handleChange = (value: string) => {
    onAnswerChange(value); // 'true' or 'false'
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = userAnswer === option.id;
        const isCorrectChoice = (option.id === 'true' && question.correctAnswer === true) || (option.id === 'false' && question.correctAnswer === false);
        let bgColor = 'bg-slate-700 hover:bg-slate-600';

        if (showCorrectAnswer) {
          if (isCorrectChoice) bgColor = 'bg-green-600';
          else if (isSelected && !isCorrectChoice) bgColor = 'bg-red-600';
        } else if (isSelected) {
          bgColor = 'bg-sky-700';
        }

        return (
          <label
            key={option.id}
            className={`block p-4 rounded-md cursor-pointer transition-colors ${bgColor}`}
          >
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={isSelected}
              onChange={() => handleChange(option.id)}
              className="sr-only"
              disabled={showCorrectAnswer}
              aria-label={option.text}
            />
            <span className="text-slate-100">{option.text}</span>
          </label>
        );
      })}
    </div>
  );
};

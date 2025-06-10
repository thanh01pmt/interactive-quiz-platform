
import React from 'react';
import { MultipleChoiceQuestion, UserAnswerType } from '../types';

interface MultipleChoiceQuestionUIProps {
  question: MultipleChoiceQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
  shuffleOptions?: boolean; // Added shuffleOptions prop
}

export const MultipleChoiceQuestionUI: React.FC<MultipleChoiceQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
  shuffleOptions, // Use passed shuffleOptions
}) => {
  const options = React.useMemo(() => {
    // Use the passed shuffleOptions prop
    if (question.options && question.options.length > 0 && shuffleOptions) {
        return [...question.options].sort(() => Math.random() - 0.5);
    }
    return question.options;
  }, [question.options, shuffleOptions]); // Dependency updated


  const handleChange = (optionId: string) => {
    onAnswerChange(optionId);
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = userAnswer === option.id;
        const isCorrect = option.id === question.correctAnswerId;
        let bgColor = 'bg-slate-700 hover:bg-slate-600';
        if (showCorrectAnswer) {
          if (isCorrect) bgColor = 'bg-green-600';
          else if (isSelected) bgColor = 'bg-red-600';
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
              className="sr-only" // Hide actual radio, style label
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

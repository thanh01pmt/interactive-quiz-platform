
import React from 'react';
import { MultipleResponseQuestion, UserAnswerType } from '../types';

interface MultipleResponseQuestionUIProps {
  question: MultipleResponseQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
  shuffleOptions?: boolean; // Added shuffleOptions prop
}

export const MultipleResponseQuestionUI: React.FC<MultipleResponseQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
  shuffleOptions, // Use passed shuffleOptions
}) => {
  const selectedAnswers = Array.isArray(userAnswer) ? new Set(userAnswer as string[]) : new Set<string>();

  const options = React.useMemo(() => {
    // Use the passed shuffleOptions prop
    if (question.options && question.options.length > 0 && shuffleOptions) {
        return [...question.options].sort(() => Math.random() - 0.5);
    }
    return question.options;
  }, [question.options, shuffleOptions]); // Dependency updated

  const handleChange = (optionId: string) => {
    const newSelectedAnswers = new Set(selectedAnswers);
    if (newSelectedAnswers.has(optionId)) {
      newSelectedAnswers.delete(optionId);
    } else {
      newSelectedAnswers.add(optionId);
    }
    onAnswerChange(Array.from(newSelectedAnswers));
  };

  return (
    <div className="space-y-3">
      {options.map((option) => {
        const isSelected = selectedAnswers.has(option.id);
        const isCorrect = question.correctAnswerIds.includes(option.id);
        let bgColor = 'bg-slate-700 hover:bg-slate-600';

        if (showCorrectAnswer) {
          if (isCorrect && isSelected) bgColor = 'bg-green-600'; // Correctly selected
          else if (isCorrect && !isSelected) bgColor = 'bg-green-600 opacity-70'; // Correct, not selected (highlight correct)
          else if (!isCorrect && isSelected) bgColor = 'bg-red-600'; // Incorrectly selected
        } else if (isSelected) {
          bgColor = 'bg-sky-700';
        }

        return (
          <label
            key={option.id}
            className={`block p-4 rounded-md cursor-pointer transition-colors ${bgColor}`}
          >
            <input
              type="checkbox"
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

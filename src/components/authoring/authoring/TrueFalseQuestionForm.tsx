
import React, { useState, useEffect } from 'react';
import { TrueFalseQuestion, BaseQuestion } from '../../../../types';
import { BaseQuestionFormFields } from './BaseQuestionFormFields';

interface TrueFalseQuestionFormProps {
  question: TrueFalseQuestion;
  onQuestionChange: (updatedQuestion: TrueFalseQuestion) => void;
}

export const TrueFalseQuestionForm: React.FC<TrueFalseQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);

  useEffect(() => {
    setCorrectAnswer(question.correctAnswer);
  }, [question.correctAnswer]);

  const handleBaseChange = <K extends keyof BaseQuestion>(
    field: K,
    value: BaseQuestion[K]
  ) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const handleCorrectAnswerChange = (value: boolean) => {
    setCorrectAnswer(value);
    onQuestionChange({ ...question, correctAnswer: value });
  };

  return (
    <div className="space-y-4 text-sm">
      <BaseQuestionFormFields
        question={question}
        onBaseChange={handleBaseChange}
      />

      <div className="pt-4 border-t border-slate-700">
        <span className="block font-medium text-sky-300 mb-1">Correct Answer*</span>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name={`${question.id}_correctAnswer`}
              checked={correctAnswer === true}
              onChange={() => handleCorrectAnswerChange(true)}
              className="h-4 w-4 text-sky-600 border-slate-500 focus:ring-sky-500"
            />
            <span className="ml-2 text-slate-200">True</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name={`${question.id}_correctAnswer`}
              checked={correctAnswer === false}
              onChange={() => handleCorrectAnswerChange(false)}
              className="h-4 w-4 text-sky-600 border-slate-500 focus:ring-sky-500"
            />
            <span className="ml-2 text-slate-200">False</span>
          </label>
        </div>
      </div>
    </div>
  );
};

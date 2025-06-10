
import React, { useState, useEffect } from 'react';
import { NumericQuestion, BaseQuestion } from '../../../../types';
import { BaseQuestionFormFields } from './BaseQuestionFormFields';

interface NumericQuestionFormProps {
  question: NumericQuestion;
  onQuestionChange: (updatedQuestion: NumericQuestion) => void;
}

export const NumericQuestionForm: React.FC<NumericQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [answer, setAnswer] = useState(question.answer !== undefined ? String(question.answer) : '0');
  const [tolerance, setTolerance] = useState(question.tolerance !== undefined ? String(question.tolerance) : '0');

  useEffect(() => {
    setAnswer(question.answer !== undefined ? String(question.answer) : '0');
    setTolerance(question.tolerance !== undefined ? String(question.tolerance) : '0');
  }, [question]);

  const handleBaseChange = <K extends keyof BaseQuestion>(field: K, value: BaseQuestion[K]) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAnswer(val);
    const numVal = parseFloat(val);
    onQuestionChange({ ...question, answer: isNaN(numVal) ? 0 : numVal });
  };
  
  const handleToleranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTolerance(val);
    const numVal = parseFloat(val);
    onQuestionChange({ ...question, tolerance: isNaN(numVal) || numVal < 0 ? 0 : numVal });
  };

  return (
    <div className="space-y-4">
      <BaseQuestionFormFields question={question} onBaseChange={handleBaseChange} />
      <div className="pt-4 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${question.id}_numericAnswer`} className="block font-medium text-sky-300 mb-1 text-sm">Correct Answer*</label>
          <input
            type="text" // Use text for more flexible input, parse to number
            inputMode="decimal"
            id={`${question.id}_numericAnswer`}
            value={answer}
            onChange={handleAnswerChange}
            required
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor={`${question.id}_tolerance`} className="block font-medium text-sky-300 mb-1 text-sm">Tolerance (Optional, e.g., 0.1)</label>
          <input
            type="text" // Use text for more flexible input
            inputMode="decimal"
            id={`${question.id}_tolerance`}
            value={tolerance}
            onChange={handleToleranceChange}
            min="0"
            step="any"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>
    </div>
  );
};

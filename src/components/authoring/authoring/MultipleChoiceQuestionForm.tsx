
import React, { useState, useEffect } from 'react';
import { MultipleChoiceQuestion, BaseQuestion } from '../../../../types';
import { BaseQuestionFormFields } from './BaseQuestionFormFields';
import { Button } from '../shared/Button';
import { generateUniqueId } from '../../utils/idGenerators';

interface MultipleChoiceQuestionFormProps {
  question: MultipleChoiceQuestion;
  onQuestionChange: (updatedQuestion: MultipleChoiceQuestion) => void;
}

export const MultipleChoiceQuestionForm: React.FC<MultipleChoiceQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [options, setOptions] = useState(question.options || [{ id: generateUniqueId('mcq_opt_'), text: '' }]);
  const [correctAnswerId, setCorrectAnswerId] = useState(question.correctAnswerId || '');

  useEffect(() => {
    setOptions(question.options || [{ id: generateUniqueId('mcq_opt_'), text: '' }]);
    setCorrectAnswerId(question.correctAnswerId || '');
  }, [question]);

  const handleBaseChange = <K extends keyof BaseQuestion>(field: K, value: BaseQuestion[K]) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], text };
    setOptions(newOptions);
    onQuestionChange({ ...question, options: newOptions });
  };

  const handleAddOption = () => {
    const newOpt = { id: generateUniqueId('mcq_opt_'), text: '' };
    const newOptions = [...options, newOpt];
    setOptions(newOptions);
    onQuestionChange({ ...question, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) {
      alert("A multiple choice question must have at least one option.");
      return;
    }
    const optionToRemove = options[index];
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    // If the removed option was the correct answer, clear correctAnswerId
    const newCorrectAnswerId = optionToRemove.id === correctAnswerId ? '' : correctAnswerId;
    setCorrectAnswerId(newCorrectAnswerId);
    onQuestionChange({ ...question, options: newOptions, correctAnswerId: newCorrectAnswerId });
  };
  
  const handleSetCorrectAnswer = (optionId: string) => {
    setCorrectAnswerId(optionId);
    onQuestionChange({ ...question, correctAnswerId: optionId });
  };

  return (
    <div className="space-y-4">
      <BaseQuestionFormFields question={question} onBaseChange={handleBaseChange} />
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <label className="block font-medium text-sky-300 mb-1 text-sm">Options & Correct Answer*</label>
        {options.map((opt, index) => (
          <div key={opt.id || index} className="flex items-center space-x-2 bg-slate-750 p-2 rounded">
            <input
              type="radio"
              name={`${question.id}_correctAnswer`}
              checked={correctAnswerId === opt.id}
              onChange={() => handleSetCorrectAnswer(opt.id)}
              className="h-5 w-5 text-sky-500 border-slate-500 focus:ring-sky-400 shrink-0"
              title="Set as correct answer"
            />
            <input
              type="text"
              value={opt.text}
              onChange={(e) => handleOptionTextChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
              className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
            />
            {options.length > 1 && (
              <Button type="button" onClick={() => handleRemoveOption(index)} variant="danger" size="sm" className="!p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={handleAddOption} variant="secondary" size="sm">Add Option</Button>
         {options.length > 0 && !correctAnswerId && (
            <p className="text-xs text-yellow-400">Please select a correct answer.</p>
        )}
      </div>
    </div>
  );
};

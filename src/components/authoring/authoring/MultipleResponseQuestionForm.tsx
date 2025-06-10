
import React, { useState, useEffect } from 'react';
import { MultipleResponseQuestion, BaseQuestion } from '../../../../types';
import { BaseQuestionFormFields } from './BaseQuestionFormFields';
import { Button } from '../shared/Button';
import { generateUniqueId } from '../../utils/idGenerators';

interface MultipleResponseQuestionFormProps {
  question: MultipleResponseQuestion;
  onQuestionChange: (updatedQuestion: MultipleResponseQuestion) => void;
}

export const MultipleResponseQuestionForm: React.FC<MultipleResponseQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [options, setOptions] = useState(question.options || [{ id: generateUniqueId('mrq_opt_'), text: '' }]);
  const [correctAnswerIds, setCorrectAnswerIds] = useState(new Set(question.correctAnswerIds || []));

  useEffect(() => {
    setOptions(question.options || [{ id: generateUniqueId('mrq_opt_'), text: '' }]);
    setCorrectAnswerIds(new Set(question.correctAnswerIds || []));
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
    const newOpt = { id: generateUniqueId('mrq_opt_'), text: '' };
    const newOptions = [...options, newOpt];
    setOptions(newOptions);
    onQuestionChange({ ...question, options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
     if (options.length <= 1) { // Typically MRQ needs at least 2 options, but rule might vary
      alert("A multiple response question should have at least one option.");
      return;
    }
    const optionToRemove = options[index];
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    
    const newCorrectAnswerIds = new Set(correctAnswerIds);
    newCorrectAnswerIds.delete(optionToRemove.id);
    setCorrectAnswerIds(newCorrectAnswerIds);

    onQuestionChange({ ...question, options: newOptions, correctAnswerIds: Array.from(newCorrectAnswerIds) });
  };
  
  const handleToggleCorrectAnswer = (optionId: string) => {
    const newCorrectAnswerIds = new Set(correctAnswerIds);
    if (newCorrectAnswerIds.has(optionId)) {
      newCorrectAnswerIds.delete(optionId);
    } else {
      newCorrectAnswerIds.add(optionId);
    }
    setCorrectAnswerIds(newCorrectAnswerIds);
    onQuestionChange({ ...question, correctAnswerIds: Array.from(newCorrectAnswerIds) });
  };

  return (
    <div className="space-y-4">
      <BaseQuestionFormFields question={question} onBaseChange={handleBaseChange} />
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <label className="block font-medium text-sky-300 mb-1 text-sm">Options & Correct Answers* (Select all that apply)</label>
        {options.map((opt, index) => (
          <div key={opt.id || index} className="flex items-center space-x-2 bg-slate-750 p-2 rounded">
            <input
              type="checkbox"
              id={`${question.id}_opt_${opt.id}`}
              checked={correctAnswerIds.has(opt.id)}
              onChange={() => handleToggleCorrectAnswer(opt.id)}
              className="h-5 w-5 text-sky-500 border-slate-500 focus:ring-sky-400 rounded shrink-0"
              title="Toggle as a correct answer"
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
        {options.length > 0 && correctAnswerIds.size === 0 && (
            <p className="text-xs text-yellow-400">Please select at least one correct answer.</p>
        )}
      </div>
    </div>
  );
};

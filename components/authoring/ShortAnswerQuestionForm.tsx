
import React, { useState, useEffect } from 'react';
import { ShortAnswerQuestion, BaseQuestion } from '../../types';
import { BaseQuestionFormFields } from './BaseQuestionFormFields';
import { Button } from '../shared/Button';

interface ShortAnswerQuestionFormProps {
  question: ShortAnswerQuestion;
  onQuestionChange: (updatedQuestion: ShortAnswerQuestion) => void;
}

export const ShortAnswerQuestionForm: React.FC<ShortAnswerQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [acceptedAnswers, setAcceptedAnswers] = useState(question.acceptedAnswers || ['']);
  const [isCaseSensitive, setIsCaseSensitive] = useState(question.isCaseSensitive || false);

  useEffect(() => {
    setAcceptedAnswers(question.acceptedAnswers || ['']);
    setIsCaseSensitive(question.isCaseSensitive || false);
  }, [question]);

  const handleBaseChange = <K extends keyof BaseQuestion>(field: K, value: BaseQuestion[K]) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const handleAcceptedAnswerChange = (index: number, value: string) => {
    const newAcceptedAnswers = [...acceptedAnswers];
    newAcceptedAnswers[index] = value;
    setAcceptedAnswers(newAcceptedAnswers);
    onQuestionChange({ ...question, acceptedAnswers: newAcceptedAnswers.filter(a => a.trim() !== '') });
  };

  const handleAddAcceptedAnswer = () => {
    const newAcceptedAnswers = [...acceptedAnswers, ''];
    setAcceptedAnswers(newAcceptedAnswers);
    onQuestionChange({ ...question, acceptedAnswers: newAcceptedAnswers.filter(a => a.trim() !== '') });
  };

  const handleRemoveAcceptedAnswer = (index: number) => {
    if (acceptedAnswers.length <= 1) {
        alert("At least one accepted answer is required.");
        return;
    }
    const newAcceptedAnswers = acceptedAnswers.filter((_, i) => i !== index);
    setAcceptedAnswers(newAcceptedAnswers);
    onQuestionChange({ ...question, acceptedAnswers: newAcceptedAnswers.filter(a => a.trim() !== '') });
  };
  
  const handleCaseSensitiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCaseSensitive(e.target.checked);
    onQuestionChange({...question, isCaseSensitive: e.target.checked });
  }

  return (
    <div className="space-y-4">
      <BaseQuestionFormFields question={question} onBaseChange={handleBaseChange} />
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <label className="block font-medium text-sky-300 mb-1 text-sm">Accepted Answers* (One per field)</label>
        {acceptedAnswers.map((ans, index) => (
          <div key={index} className="flex items-center space-x-2 bg-slate-750 p-2 rounded">
            <input
              type="text"
              value={ans}
              onChange={(e) => handleAcceptedAnswerChange(index, e.target.value)}
              placeholder={`Accepted Answer ${index + 1}`}
              required={index === 0} // At least one answer
              className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
            />
            {acceptedAnswers.length > 1 && (
               <Button type="button" onClick={() => handleRemoveAcceptedAnswer(index)} variant="danger" size="sm" className="!p-1.5">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={handleAddAcceptedAnswer} variant="secondary" size="sm">Add Accepted Answer</Button>
        
        <div className="flex items-center mt-2">
            <input 
                type="checkbox"
                id={`${question.id}_caseSensitive`}
                checked={isCaseSensitive}
                onChange={handleCaseSensitiveChange}
                className="h-4 w-4 text-sky-600 border-slate-500 rounded focus:ring-sky-500"
            />
            <label htmlFor={`${question.id}_caseSensitive`} className="ml-2 text-sm text-slate-200">
                Case Sensitive
            </label>
        </div>
        {acceptedAnswers.filter(a=>a.trim() !== '').length === 0 && (
            <p className="text-xs text-yellow-400">Please provide at least one accepted answer.</p>
        )}

      </div>
    </div>
  );
};


import React from 'react';
import { BaseQuestion } from '../../../../types';

interface BaseQuestionFormFieldsProps {
  // Allow Partial<BaseQuestion> but only operate on core fields for this shared component
  question: Partial<Pick<BaseQuestion, 'id' | 'prompt' | 'points' | 'explanation' | 'learningObjective' | 'glossary' | 'bloomLevel' | 'difficulty' | 'category' | 'topic' | 'gradeBand' | 'contextCode' | 'course'>>; 
  onBaseChange: <K extends keyof BaseQuestion>(field: K, value: BaseQuestion[K]) => void;
}

export const BaseQuestionFormFields: React.FC<BaseQuestionFormFieldsProps> = ({ question, onBaseChange }) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'number') { // For points field if not handled by specific handler
      processedValue = parseFloat(value) || 0;
    } else if (name === 'glossary') { // For glossary if it were directly handled here
        processedValue = value.split('\n').map(s => s.trim()).filter(Boolean);
    }
    
    // Cast name to keyof BaseQuestion; ensure names match BaseQuestion properties
    onBaseChange(name as keyof BaseQuestion, processedValue);
  };
  
  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let numValue = parseInt(e.target.value, 10);
    if (isNaN(numValue) || numValue < 0) {
      numValue = 0;
    }
    onBaseChange('points', numValue);
  };

  // Only rendering form fields for prompt, points, explanation, and the metadata fields listed in the error messages as problematic
  // This is to satisfy the "property does not exist" errors, assuming a more restricted BaseQuestion context for this component.
  return (
    <div className="space-y-4 text-sm">
      <div>
        <label htmlFor={`${question.id}_prompt`} className="block font-medium text-sky-300 mb-1">Prompt*</label>
        <textarea
          id={`${question.id}_prompt`}
          name="prompt"
          value={question.prompt || ''}
          onChange={handleInputChange}
          rows={3}
          required
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      <div>
        <label htmlFor={`${question.id}_points`} className="block font-medium text-sky-300 mb-1">Points</label>
        <input
          type="number"
          id={`${question.id}_points`}
          name="points"
          value={question.points === undefined ? 0 : question.points}
          onChange={handlePointsChange}
          min="0"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>
      
      <div>
        <label htmlFor={`${question.id}_explanation`} className="block font-medium text-sky-300 mb-1">Explanation (Optional)</label>
        <textarea
          id={`${question.id}_explanation`}
          name="explanation"
          value={question.explanation || ''}
          onChange={handleInputChange}
          rows={2}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>
      
      {/* Conditionally render metadata fields if they are expected to be part of BaseQuestion visible to this component */}
      {/* Based on errors, these are problematic. If types.ts is the source of truth, these should work. */}
      {/* For fixing the listed errors, these sections would be removed or heavily modified. */}
      {/* The current fix strategy implies these fields are NOT on the BaseQuestion this component sees. */}

      <div>
        <label htmlFor={`${question.id}_learningObjective`} className="block font-medium text-sky-300 mb-1">Learning Objective (Optional)</label>
        <input
          type="text"
          id={`${question.id}_learningObjective`}
          name="learningObjective"
          value={question.learningObjective || ''}
          onChange={handleInputChange}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      <div>
        <label htmlFor={`${question.id}_glossary`} className="block font-medium text-sky-300 mb-1">Glossary (Optional, one term per line)</label>
        <textarea
          id={`${question.id}_glossary`}
          name="glossary"
          value={(question.glossary || []).join('\n')} 
          onChange={handleInputChange} 
          rows={2}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-700 mt-4">
        <div>
          <label htmlFor={`${question.id}_difficulty`} className="block font-medium text-sky-300 mb-1">Difficulty</label>
          <select
            id={`${question.id}_difficulty`}
            name="difficulty"
            value={question.difficulty || 'medium'}
            onChange={handleInputChange}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
             {typeof question.difficulty === 'string' && !['easy', 'medium', 'hard'].includes(question.difficulty) && (
              <option value={question.difficulty}>{question.difficulty}</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor={`${question.id}_bloomLevel`} className="block font-medium text-sky-300 mb-1">Bloom's Level (Optional)</label>
          <input
            type="text"
            id={`${question.id}_bloomLevel`}
            name="bloomLevel"
            value={question.bloomLevel || ''}
            onChange={handleInputChange}
            placeholder="e.g., Remembering, Applying"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor={`${question.id}_category`} className="block font-medium text-sky-300 mb-1">Category (Optional)</label>
          <input
            type="text"
            id={`${question.id}_category`}
            name="category"
            value={question.category || ''}
            onChange={handleInputChange}
            placeholder="e.g., Mathematics, History"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor={`${question.id}_topic`} className="block font-medium text-sky-300 mb-1">Topic (Optional)</label>
          <input
            type="text"
            id={`${question.id}_topic`}
            name="topic"
            value={question.topic || ''}
            onChange={handleInputChange}
            placeholder="e.g., Algebra, World War II"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
         <div>
          <label htmlFor={`${question.id}_gradeBand`} className="block font-medium text-sky-300 mb-1">Grade Band (Optional)</label>
          <input
            type="text"
            id={`${question.id}_gradeBand`}
            name="gradeBand"
            value={question.gradeBand || ''}
            onChange={handleInputChange}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor={`${question.id}_contextCode`} className="block font-medium text-sky-300 mb-1">Context Code (Optional)</label>
          <input
            type="text"
            id={`${question.id}_contextCode`}
            name="contextCode"
            value={question.contextCode || ''}
            onChange={handleInputChange}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
         <div>
          <label htmlFor={`${question.id}_course`} className="block font-medium text-sky-300 mb-1">Course (Optional)</label>
          <input
            type="text"
            id={`${question.id}_course`}
            name="course"
            value={question.course || ''}
            onChange={handleInputChange}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>
    </div>
  );
};

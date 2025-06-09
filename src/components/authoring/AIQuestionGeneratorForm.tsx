
import React, { useState } from 'react';
import { QuestionTypeStrings } from '../../types';
import { Button } from '../shared/Button';

export interface AIQuestionFormState {
  topic: string;
  questionType: QuestionTypeStrings;
  difficulty: string;
}

interface AIQuestionGeneratorFormProps {
  onSubmit: (formData: AIQuestionFormState) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

// Initially, only True/False is fully supported by the AIGenerationService.
// Others can be added here as the service expands.
const supportedQuestionTypes: { value: QuestionTypeStrings; label: string }[] = [
  { value: 'true_false', label: 'True/False' },
  // { value: 'multiple_choice', label: 'Multiple Choice (Experimental)' },
];

export const AIQuestionGeneratorForm: React.FC<AIQuestionGeneratorFormProps> = ({
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [topic, setTopic] = useState('');
  const [questionType, setQuestionType] = useState<QuestionTypeStrings>('true_false');
  const [difficulty, setDifficulty] = useState('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      alert("Please enter a topic for the question.");
      return;
    }
    await onSubmit({ topic, questionType, difficulty });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div>
        <label htmlFor="ai_topic" className="block font-medium text-sky-300 mb-1">
          Topic / Context for the Question*
        </label>
        <textarea
          id="ai_topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          required
          placeholder="e.g., Photosynthesis, The French Revolution, Basic Python loops"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:ring-sky-500 focus:border-sky-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="ai_questionType" className="block font-medium text-sky-300 mb-1">
          Question Type
        </label>
        <select
          id="ai_questionType"
          value={questionType}
          onChange={(e) => setQuestionType(e.target.value as QuestionTypeStrings)}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          disabled={isLoading || supportedQuestionTypes.length <= 1}
        >
          {supportedQuestionTypes.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.label.includes("(Experimental)") || opt.label.includes("(Coming Soon)")}>
              {opt.label}
            </option>
          ))}
        </select>
        {questionType !== 'true_false' && (
            <p className="text-xs text-yellow-400 mt-1">Note: AI generation for '{supportedQuestionTypes.find(q => q.value === questionType)?.label}' is experimental and may not yield optimal results.</p>
        )}
      </div>

      <div>
        <label htmlFor="ai_difficulty" className="block font-medium text-sky-300 mb-1">
          Difficulty
        </label>
        <select
          id="ai_difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          disabled={isLoading}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>


      <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-slate-700">
        <Button type="button" onClick={onCancel} variant="secondary" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading || !topic.trim()}>
          {isLoading ? 'Generating...' : 'Generate Question'}
        </Button>
      </div>
    </form>
  );
};

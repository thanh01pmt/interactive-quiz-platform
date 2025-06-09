
import React, { useState } from 'react';
import { QuizQuestion, QuestionTypeStrings } from '../../types';
import { Button } from '../shared/Button';

interface QuestionListProps {
  questions: QuizQuestion[];
  onAddNewQuestion: (type: QuestionTypeStrings) => void;
  onEditQuestion: (question: QuizQuestion, index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onOrderChange: (newOrderedQuestions: QuizQuestion[]) => void;
  onOpenAIGenerator: () => void; 
}

const questionTypeOptions: { value: QuestionTypeStrings; label: string }[] = [
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'multiple_response', label: 'Multiple Response' },
  { value: 'true_false', label: 'True/False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'fill_in_the_blanks', label: 'Fill In The Blanks' },
  { value: 'sequence', label: 'Sequence' },
  { value: 'matching', label: 'Matching' },
  { value: 'drag_and_drop', label: 'Drag and Drop' },
  { value: 'hotspot', label: 'Hotspot' },
  { value: 'blockly_programming', label: 'Blockly Programming' },
  { value: 'scratch_programming', label: 'Scratch Programming' },
];

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onAddNewQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onOpenAIGenerator,
  onOrderChange, 
}) => {
  const [selectedNewQuestionType, setSelectedNewQuestionType] = useState<QuestionTypeStrings>('multiple_choice');

  const handleAddClick = () => {
    onAddNewQuestion(selectedNewQuestionType);
  };

  // Simple drag-and-drop handlers (could be enhanced with a library)
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newQuestions = [...questions];
      const draggedItemContent = newQuestions.splice(dragItem.current, 1)[0];
      newQuestions.splice(dragOverItem.current, 0, draggedItemContent);
      onOrderChange(newQuestions);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 p-4 bg-slate-800 rounded-lg">
        <div className="flex-grow">
          <label htmlFor="newQuestionType" className="block text-sm font-medium text-sky-300 mb-1">
            Select Question Type to Add Manually:
          </label>
          <select
            id="newQuestionType"
            value={selectedNewQuestionType}
            onChange={(e) => setSelectedNewQuestionType(e.target.value as QuestionTypeStrings)}
            className="block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          >
            {questionTypeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <Button onClick={handleAddClick} variant="primary" className="sm:self-end">Add Manually</Button>
        <Button onClick={onOpenAIGenerator} variant="secondary" className="sm:self-end">
          ✨ Generate with AI
        </Button>
      </div>

      {questions.length === 0 ? (
        <p className="text-slate-400 italic text-center py-4">No questions yet. Add one manually or generate with AI.</p>
      ) : (
        <ul className="space-y-3">
          {questions.map((q, index) => (
            <li 
              key={q.id || `q-${index}`} 
              className="p-4 bg-slate-700 rounded-md shadow flex justify-between items-center cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()} // Important for drop to work
            >
              <div className="flex items-center space-x-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                <div>
                  <p className="font-semibold text-slate-100 truncate max-w-md" title={q.prompt}>
                    {index + 1}. {q.prompt || `Question ${index + 1}`}
                  </p>
                  <p className="text-xs text-sky-400">{questionTypeOptions.find(opt => opt.value === q.questionType)?.label || q.questionType}</p>
                </div>
              </div>
              <div className="space-x-2 flex-shrink-0">
                <Button onClick={() => onEditQuestion(q, index)} size="sm" variant="ghost">Edit</Button>
                <Button onClick={() => onDeleteQuestion(index)} size="sm" variant="danger">Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

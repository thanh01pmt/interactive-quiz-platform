
import React, { useState, useEffect, useMemo } from 'react';
import { MatchingQuestion, MatchPromptItem, MatchOptionItem, UserAnswerType } from '../types';

interface MatchingQuestionUIProps {
  question: MatchingQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // Record<promptId, optionId>
  showCorrectAnswer?: boolean;
  shuffleOptions?: boolean;
}

export const MatchingQuestionUI: React.FC<MatchingQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
  shuffleOptions,
}) => {
  // { promptId: optionId | null }
  const initialAssignments = useMemo(() => {
    const assignments: Record<string, string | null> = {};
    question.prompts.forEach(p => assignments[p.id] = null);
    if (typeof userAnswer === 'object' && userAnswer !== null && !Array.isArray(userAnswer)) {
      const currentAns = userAnswer as Record<string, string>;
      Object.keys(currentAns).forEach(promptId => {
        if (assignments.hasOwnProperty(promptId)) {
          assignments[promptId] = currentAns[promptId];
        }
      });
    }
    return assignments;
  }, [userAnswer, question.prompts]);

  const [promptAssignments, setPromptAssignments] = useState<Record<string, string | null>>(initialAssignments);
  const [draggedOption, setDraggedOption] = useState<MatchOptionItem | null>(null);

  const availableOptions = useMemo(() => {
    const assignedOptionIds = new Set(Object.values(promptAssignments).filter(Boolean));
    let options = question.options.filter(opt => !assignedOptionIds.has(opt.id));
    if (shuffleOptions && !showCorrectAnswer) { // Only shuffle if not showing answers and enabled
        options = [...options].sort(() => Math.random() - 0.5);
    }
    return options;
  }, [promptAssignments, question.options, shuffleOptions, showCorrectAnswer]);

  useEffect(() => {
     setPromptAssignments(initialAssignments);
  }, [initialAssignments]);

  const handleDragStart = (option: MatchOptionItem) => {
    if (showCorrectAnswer) return;
    setDraggedOption(option);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    if (showCorrectAnswer) return;
    e.currentTarget.classList.add('bg-sky-800'); // Highlight drop target
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-sky-800');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, promptId: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-sky-800');
    if (showCorrectAnswer || !draggedOption) return;

    const newAssignments = { ...promptAssignments };

    // If this prompt already had an item, that item becomes available again (handled by availableOptions memo)
    // If the dragged item was previously assigned to another prompt, unassign it from there
    Object.keys(newAssignments).forEach(pId => {
        if(newAssignments[pId] === draggedOption.id) {
            newAssignments[pId] = null;
        }
    });

    newAssignments[promptId] = draggedOption.id;
    setPromptAssignments(newAssignments);

    const finalAnswer: Record<string, string> = {};
    Object.entries(newAssignments).forEach(([pId, oId]: [string, string | null]) => {
      if (oId) finalAnswer[pId] = oId;
    });
    onAnswerChange(finalAnswer);
    setDraggedOption(null);
  };

  const handleRemoveMatch = (promptId: string) => {
    if (showCorrectAnswer) return;
    const newAssignments = { ...promptAssignments, [promptId]: null };
    setPromptAssignments(newAssignments);
    const finalAnswer: Record<string, string> = {};
    Object.entries(newAssignments).forEach(([pId, oId]: [string, string | null]) => {
      if (oId) finalAnswer[pId] = oId;
    });
    onAnswerChange(finalAnswer);
  };


  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Prompts (Drop Zones) */}
      <div className="w-full md:w-1/2 space-y-3" aria-label="Matching prompts area">
        <h3 className="text-lg font-semibold text-sky-400" id="matching-prompts-title">Match Prompts To:</h3>
        {question.prompts.map(prompt => {
          const assignedOptionId = promptAssignments[prompt.id];
          const assignedOption = assignedOptionId ? question.options.find(opt => opt.id === assignedOptionId) : null;

          let borderColor = 'border-slate-600';
          let promptBg = 'bg-slate-700';
          let isCorrectMatch = false;

          if (showCorrectAnswer && assignedOption) {
            isCorrectMatch = question.correctAnswerMap.some(m => m.promptId === prompt.id && m.optionId === assignedOption.id);
            borderColor = isCorrectMatch ? 'border-green-500' : 'border-red-500';
            promptBg = isCorrectMatch ? 'bg-green-800' : 'bg-red-800';
          } else if (showCorrectAnswer && !assignedOption) { // Unanswered but should have an answer
             borderColor = 'border-red-500'; // Mark as incorrect if not answered
          }


          return (
            <div
              key={prompt.id}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, prompt.id)}
              className={`p-3 border-2 border-dashed ${borderColor} ${promptBg} rounded-md min-h-[60px] flex items-center justify-between transition-colors`}
              tabIndex={0}
              role="group"
              aria-labelledby={`prompt-text-${prompt.id}`}
              aria-describedby={assignedOption ? `assigned-option-${prompt.id}` : `empty-drop-target-${prompt.id}`}
            >
              <span id={`prompt-text-${prompt.id}`} className="text-slate-200">{prompt.content}</span>
              {assignedOption && (
                <div id={`assigned-option-${prompt.id}`} className={`ml-2 p-2 rounded text-sm ${showCorrectAnswer && isCorrectMatch ? 'bg-green-600' : (showCorrectAnswer && !isCorrectMatch ? 'bg-red-600' : 'bg-sky-600')}`}>
                  {assignedOption.content}
                  {!showCorrectAnswer && (
                    <button
                      onClick={() => handleRemoveMatch(prompt.id)}
                      className="ml-2 text-xs text-red-300 hover:text-red-200"
                      aria-label={`Remove match for ${prompt.content}`}
                    >
                      (X)
                    </button>
                  )}
                </div>
              )}
              {!assignedOption && !showCorrectAnswer && <span id={`empty-drop-target-${prompt.id}`} className="text-xs text-slate-500 italic">Drop option here</span>}
              {!assignedOption && showCorrectAnswer &&
                <span className="text-xs text-yellow-400 italic">
                  Correct: {question.options.find(o => question.correctAnswerMap.find(m => m.promptId === prompt.id)?.optionId === o.id)?.content || 'N/A'}
                </span>
              }
            </div>
          );
        })}
      </div>

      {/* Options (Draggable Items) */}
      <div className="w-full md:w-1/2 p-3 bg-slate-800 rounded-lg space-y-2" aria-label="Available options to match">
        <h3 className="text-lg font-semibold text-sky-400" id="matching-options-title">Available Options:</h3>
        {availableOptions.length > 0 ? availableOptions.map(option => (
          <div
            key={option.id}
            draggable={!showCorrectAnswer}
            onDragStart={() => handleDragStart(option)}
            onDragEnd={() => setDraggedOption(null)}
            className={`p-2.5 bg-slate-600 rounded shadow ${!showCorrectAnswer ? 'cursor-grab active:cursor-grabbing hover:bg-slate-500' : 'opacity-70'} ${draggedOption?.id === option.id ? 'opacity-50 ring-2 ring-sky-500' : ''}`}
            tabIndex={showCorrectAnswer ? -1 : 0}
            aria-grabbed={draggedOption?.id === option.id}
            role="listitem"
          >
            {option.content}
          </div>
        )) : <p className="text-slate-400 italic">All options placed.</p>}
         {showCorrectAnswer && availableOptions.length > 0 &&
            <p className="text-xs text-slate-500 mt-2"> (These items were not matched or incorrectly matched) </p>
         }
      </div>
    </div>
  );
};

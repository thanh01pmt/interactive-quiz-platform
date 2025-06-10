
import React, { useState, useEffect, useCallback } from 'react';
import { SequenceQuestion, SequenceItem, UserAnswerType } from '../types';

interface SequenceQuestionUIProps {
  question: SequenceQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // Array of item IDs
  showCorrectAnswer?: boolean;
}

export const SequenceQuestionUI: React.FC<SequenceQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
}) => {
  const initialItems = React.useMemo(() => {
    if (Array.isArray(userAnswer) && userAnswer.length === question.items.length) {
      // Reconstruct order from userAnswer if available
      const userAnswerIds = userAnswer as string[];
      return userAnswerIds.map(id => question.items.find(item => item.id === id)).filter(Boolean) as SequenceItem[];
    }
    // Otherwise, shuffle initial items (or use original order if not shuffling by default)
    return [...question.items].sort(() => Math.random() - 0.5);
  }, [question.items, userAnswer]); // Only re-shuffle if question.items change, or on initial load with no user answer

  const [sequencedItems, setSequencedItems] = useState<SequenceItem[]>(initialItems);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  useEffect(() => {
    // If userAnswer is externally reset or question changes, update sequencedItems
     if (Array.isArray(userAnswer) && userAnswer.length > 0) {
        const orderedItems = (userAnswer as string[]).map(id => question.items.find(item => item.id === id)).filter(Boolean) as SequenceItem[];
        if (orderedItems.length === question.items.length) {
            setSequencedItems(orderedItems);
        } else {
             // Fallback to initial shuffle if userAnswer is incomplete/invalid
            setSequencedItems([...question.items].sort(() => Math.random() - 0.5));
        }
    } else if (userAnswer === null) { // Explicitly handle reset
        setSequencedItems([...question.items].sort(() => Math.random() - 0.5));
    }
  }, [userAnswer, question.items]);


  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, itemId: string) => {
    if (showCorrectAnswer) return;
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId); // Necessary for Firefox
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>, targetItemId: string) => {
    e.preventDefault();
    if (showCorrectAnswer || !draggedItemId || draggedItemId === targetItemId) return;
    
    const draggedItemIndex = sequencedItems.findIndex(item => item.id === draggedItemId);
    const targetItemIndex = sequencedItems.findIndex(item => item.id === targetItemId);

    if (draggedItemIndex === -1 || targetItemIndex === -1) return;

    const newItems = [...sequencedItems];
    const [draggedItem] = newItems.splice(draggedItemIndex, 1);
    newItems.splice(targetItemIndex, 0, draggedItem);
    setSequencedItems(newItems);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => { // Changed e type here
    e.preventDefault();
    if (showCorrectAnswer || !draggedItemId) return;

    // The actual reordering happens in handleDragOver for immediate feedback
    // Here we finalize by calling onAnswerChange
    const newAnswer = sequencedItems.map(item => item.id);
    onAnswerChange(newAnswer);
    setDraggedItemId(null);
  };
  
  const handleDragEnd = () => {
    if (showCorrectAnswer) return;
    // Ensure onAnswerChange is called even if drop target wasn't an item (e.g. dropped outside)
    // but items were reordered by DragOver
    const newAnswer = sequencedItems.map(item => item.id);
    onAnswerChange(newAnswer);
    setDraggedItemId(null);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-slate-400 mb-2">Drag and drop the items into the correct order.</p>
      <ul 
        className="list-none p-0 m-0"
        onDragOver={(e) => e.preventDefault()} 
        onDrop={handleDrop} 
      >
        {sequencedItems.map((item, index) => {
          let itemStyle = 'bg-slate-700 hover:bg-slate-600';
          let orderIndicator: string | JSX.Element = `#${index + 1}`; // Corrected type
          let isCorrectPosition = false; // Declare and initialize here

          if (showCorrectAnswer) {
            // const userAnswerForThisItem = Array.isArray(userAnswer) ? (userAnswer as string[])[index] : null; // Not directly used for isCorrectPosition check here
            isCorrectPosition = question.correctOrder[index] === item.id; // Assign value
            const originalCorrectItem = question.items.find(i => i.id === question.correctOrder[index]);

            if (isCorrectPosition) {
              itemStyle = 'bg-green-700';
            } else {
              itemStyle = 'bg-red-700';
            }
            orderIndicator = (
                <span className="flex items-center">
                  <span className={`mr-2 font-bold ${isCorrectPosition ? 'text-green-200' : 'text-red-200'}`}>
                    Your #{index + 1}:
                  </span>
                  {isCorrectPosition ? null : (
                    <span className="text-xs text-yellow-300 line-through mr-1">
                      (Correct for this pos: {originalCorrectItem?.content || 'N/A'})
                    </span>
                  )}
                </span>
            );
          }


          return (
            <li
              key={item.id}
              draggable={!showCorrectAnswer}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={handleDrop} 
              onDragEnd={handleDragEnd}
              className={`p-3 my-1.5 rounded-md shadow ${itemStyle} ${!showCorrectAnswer ? 'cursor-grab active:cursor-grabbing' : 'opacity-90'} transition-all duration-150 ease-in-out ${draggedItemId === item.id ? 'opacity-50 scale-105' : ''}`}
              aria-roledescription="sortable item"
            >
              <div className="flex items-center justify-between">
                <span className="text-slate-100">{item.content}</span>
                {showCorrectAnswer ? (
                  <span className={`text-sm font-medium ${isCorrectPosition ? 'text-green-200' : 'text-red-200'}`}>{orderIndicator}</span>
                ): (
                   <span className="text-sm text-slate-400">{`#${index + 1}`}</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {showCorrectAnswer && (
         <div className="mt-4 p-3 bg-slate-800 rounded-md">
            <h5 className="font-semibold text-sky-300">Correct Sequence:</h5>
            <ol className="list-decimal list-inside text-slate-300">
                {question.correctOrder.map(id => {
                    const item = question.items.find(i => i.id === id);
                    return <li key={`correct-${id}`}>{item?.content || 'Unknown Item'}</li>;
                })}
            </ol>
         </div>
      )}
    </div>
  );
};
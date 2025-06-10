
import React, { useState, useEffect } from 'react';
import { DragAndDropQuestion, UserAnswerType, DraggableItem, DropZone } from '../types';

interface DragAndDropQuestionUIProps {
  question: DragAndDropQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null; // Record<draggableId, dropZoneId>
  showCorrectAnswer?: boolean;
}

export const DragAndDropQuestionUI: React.FC<DragAndDropQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
}) => {
  // state: { draggableId: dropZoneId | null }
  const initialAssignments = React.useMemo(() => {
    const assignments: Record<string, string | null> = {};
    question.draggableItems.forEach(item => assignments[item.id] = null);

    if (typeof userAnswer === 'object' && userAnswer !== null) {
      const currentAnswerMap = userAnswer as Record<string, string>;
      Object.keys(currentAnswerMap).forEach(draggableId => {
        assignments[draggableId] = currentAnswerMap[draggableId];
      });
    }
    return assignments;
  }, [userAnswer, question.draggableItems]);

  const [itemAssignments, setItemAssignments] = useState<Record<string, string | null>>(initialAssignments);
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);

  useEffect(() => {
    setItemAssignments(initialAssignments);
  }, [initialAssignments]);


  const handleDragStart = (item: DraggableItem) => {
    if (showCorrectAnswer) return;
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (zone: DropZone) => {
    if (showCorrectAnswer || !draggedItem) return;

    const newAssignments = { ...itemAssignments };

    // If the item was already in another zone, free that zone
    Object.keys(newAssignments).forEach(key => {
      if (newAssignments[key] === zone.id && key !== draggedItem.id) {
        newAssignments[key] = null; // Remove item previously in this target zone if it's not the dragged one
      }
    });

    newAssignments[draggedItem.id] = zone.id;
    setItemAssignments(newAssignments);

    // Prepare answer for QuizEngine: only include actual assignments
    const finalAnswer: Record<string, string> = {};
    Object.entries(newAssignments).forEach(([draggableId, dropZoneId]: [string, string | null]) => {
      if (dropZoneId) {
        finalAnswer[draggableId] = dropZoneId;
      }
    });
    onAnswerChange(finalAnswer);
    setDraggedItem(null);
  };

  const handleUndropItem = (itemId: string) => {
    if (showCorrectAnswer) return;
    const newAssignments = {...itemAssignments, [itemId]: null};
    setItemAssignments(newAssignments);
    const finalAnswer: Record<string, string> = {};
    Object.entries(newAssignments).forEach(([draggableId, dropZoneId]: [string, string | null]) => {
      if (dropZoneId) {
        finalAnswer[draggableId] = dropZoneId;
      }
    });
    onAnswerChange(finalAnswer);
  };

  const unassignedItems = question.draggableItems.filter(item => !itemAssignments[item.id]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Draggable Items Pool */}
      <div className="w-full md:w-1/3 p-4 bg-slate-700 rounded-lg space-y-3 min-h-[150px]" aria-label="Draggable items pool">
        <h3 className="text-lg font-semibold text-sky-400 mb-2" id="draggable-items-title">Draggable Items</h3>
        {unassignedItems.length > 0 ? unassignedItems.map(item => (
          <div
            key={item.id}
            draggable={!showCorrectAnswer}
            onDragStart={() => handleDragStart(item)}
            className={`p-3 bg-slate-600 rounded shadow cursor-grab active:cursor-grabbing ${showCorrectAnswer ? 'opacity-70' : 'hover:bg-slate-500'}`}
            tabIndex={showCorrectAnswer ? -1 : 0}
            aria-grabbed={draggedItem?.id === item.id}
            aria-roledescription="draggable item"
          >
            {item.content}
          </div>
        )) : <p className="text-slate-400 italic">All items placed.</p>}
      </div>

      {/* Drop Zones */}
      <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Drop zones container">
        {question.dropZones.map(zone => {
          const assignedItem = question.draggableItems.find(item => itemAssignments[item.id] === zone.id);
          const isCorrectDrop = showCorrectAnswer && question.answerMap.some(am => am.dropZoneId === zone.id && am.draggableId === assignedItem?.id);
          let zoneBg = 'bg-slate-700';
          let zoneBorder = 'border-slate-600';

          if (showCorrectAnswer && assignedItem) {
             zoneBorder = isCorrectDrop ? 'border-green-500' : 'border-red-500';
          } else if (draggedItem) {
             zoneBg = 'bg-slate-600'; // Highlight when dragging over
          }

          return (
            <div
              key={zone.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(zone)}
              className={`p-4 border-2 border-dashed ${zoneBorder} ${zoneBg} rounded-lg min-h-[80px] flex flex-col justify-center items-center transition-colors`}
              aria-label={`Drop zone: ${zone.label}. ${assignedItem ? `Currently contains ${assignedItem.content}.` : 'Empty.'}`}
              tabIndex={0}
              role="group" // Semantically a group for related content
            >
              <span className="text-sm font-medium text-slate-400 mb-2">{zone.label}</span>
              {assignedItem && (
                <div className={`p-3 rounded shadow w-full text-center ${showCorrectAnswer && isCorrectDrop ? 'bg-green-700' : (showCorrectAnswer && !isCorrectDrop ? 'bg-red-700' : 'bg-sky-700')}`}>
                  {assignedItem.content}
                  {!showCorrectAnswer &&
                    <button
                      onClick={() => handleUndropItem(assignedItem.id)}
                      className="ml-2 text-red-400 hover:text-red-300 text-xs"
                      title={`Remove ${assignedItem.content} from ${zone.label}`}
                      aria-label={`Remove ${assignedItem.content} from ${zone.label}`}
                    >
                      (remove)
                    </button>
                  }
                </div>
              )}
              {!assignedItem && <span className="text-slate-500 italic">Drop here</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

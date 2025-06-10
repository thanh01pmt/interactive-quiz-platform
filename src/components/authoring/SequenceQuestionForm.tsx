
import React, { useState, useEffect } from 'react';
import { SequenceQuestion, SequenceItem, BaseQuestion } from '../../types'; // Corrected path
import { BaseQuestionFormFields } from './BaseQuestionFormFields';
import { Button } from '../shared/Button'; // Corrected path
import { generateUniqueId } from '../../utils/idGenerators'; // Corrected path

interface SequenceQuestionFormProps {
  question: SequenceQuestion;
  onQuestionChange: (updatedQuestion: SequenceQuestion) => void;
}

export const SequenceQuestionForm: React.FC<SequenceQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [items, setItems] = useState<SequenceItem[]>(question.items || [{ id: generateUniqueId('seq_item_'), content: '' }]);
  // correctOrder will be derived from items for editing, and then stored
  // The UI will allow reordering of 'items', and that order becomes 'correctOrder'

  useEffect(() => {
    // If items are empty or undefined from prop, initialize with one item.
    // The correctOrder is implicitly the order of `items` as displayed in the form.
    const currentItems = question.items && question.items.length > 0 
      ? question.items 
      : [{ id: generateUniqueId('seq_item_'), content: 'First Item' }];
    setItems(currentItems);
  }, [question.items]);

  const handleBaseChange = <K extends keyof BaseQuestion>(field: K, value: BaseQuestion[K]) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const handleItemContentChange = (index: number, content: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], content };
    setItems(newItems);
    onQuestionChange({ ...question, items: newItems, correctOrder: newItems.map(item => item.id) });
  };

  const handleAddItem = () => {
    const newItem = { id: generateUniqueId('seq_item_'), content: '' };
    const newItems = [...items, newItem];
    setItems(newItems);
    onQuestionChange({ ...question, items: newItems, correctOrder: newItems.map(item => item.id) });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 2) { // Sequence usually needs at least 2 items to be meaningful
      alert("A sequence question should have at least two items.");
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onQuestionChange({ ...question, items: newItems, correctOrder: newItems.map(item => item.id) });
  };
  
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) {
      return; // Cannot move further
    }
    const newItems = [...items];
    const itemToMove = newItems.splice(index, 1)[0];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newItems.splice(newIndex, 0, itemToMove);
    setItems(newItems);
    onQuestionChange({ ...question, items: newItems, correctOrder: newItems.map(item => item.id) });
  };


  return (
    <div className="space-y-4">
      <BaseQuestionFormFields question={question} onBaseChange={handleBaseChange} />
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <label className="block font-medium text-sky-300 mb-1 text-sm">Items (Arrange in correct sequence)*</label>
        {items.map((item, index) => (
          <div key={item.id || index} className="flex items-center space-x-2 bg-slate-750 p-2 rounded">
            <div className="flex flex-col space-y-0.5">
                 <Button type="button" onClick={() => moveItem(index, 'up')} disabled={index === 0} size="sm" variant="ghost" className="!p-0.5 h-5 w-5 leading-none text-xs disabled:opacity-30" aria-label={`Move item ${index + 1} up`}>▲</Button>
                 <Button type="button" onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} size="sm" variant="ghost" className="!p-0.5 h-5 w-5 leading-none text-xs disabled:opacity-30" aria-label={`Move item ${index + 1} down`}>▼</Button>
            </div>
            <span className="text-slate-400 text-xs w-6 text-center">{index + 1}.</span>
            <input
              type="text"
              value={item.content}
              onChange={(e) => handleItemContentChange(index, e.target.value)}
              placeholder={`Item ${index + 1} content`}
              required
              className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
            />
            {items.length > 2 && (
              <Button type="button" onClick={() => handleRemoveItem(index)} variant="danger" size="sm" className="!p-1.5" aria-label={`Remove item ${index + 1}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={handleAddItem} variant="secondary" size="sm">Add Item</Button>
        {items.length < 2 && (
            <p className="text-xs text-yellow-400">A sequence question needs at least two items.</p>
        )}
      </div>
    </div>
  );
};

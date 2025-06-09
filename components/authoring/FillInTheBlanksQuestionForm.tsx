
import React, { useState, useEffect } from 'react';
import { FillInTheBlanksQuestion, BaseQuestion } from '../../types';
import { BaseQuestionFormFields } from './BaseQuestionFormFields';
import { Button } from '../shared/Button';
import { generateUniqueId } from '../../utils/idGenerators';

interface FillInTheBlanksQuestionFormProps {
  question: FillInTheBlanksQuestion;
  onQuestionChange: (updatedQuestion: FillInTheBlanksQuestion) => void;
}

export const FillInTheBlanksQuestionForm: React.FC<FillInTheBlanksQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [segments, setSegments] = useState<Array<FillInTheBlanksQuestion['segments'][0]>>(question.segments || [{ type: 'text' as const, content: '' }]);
  const [answers, setAnswers] = useState(question.answers || []);
  const [isCaseSensitive, setIsCaseSensitive] = useState(question.isCaseSensitive || false);

  useEffect(() => {
    setSegments(question.segments || [{ type: 'text' as const, content: '' }]);
    setAnswers(question.answers || []);
    setIsCaseSensitive(question.isCaseSensitive || false);
  }, [question]);

  const handleBaseChange = <K extends keyof BaseQuestion>(field: K, value: BaseQuestion[K]) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const handleSegmentChange = (index: number, field: 'type' | 'content', value: string) => {
    const newSegments = [...segments];
    const segmentToUpdate = { ...newSegments[index] };
    
    if (field === 'type') {
      const newType = value as 'text' | 'blank';
      if (segmentToUpdate.type === 'text' && newType === 'blank') {
        const newBlankId = segmentToUpdate.id || generateUniqueId('fitb_blank_');
        newSegments[index] = { type: 'blank' as const, id: newBlankId };
        if (!answers.find(a => a.blankId === newBlankId)) {
            setAnswers(prevAns => [...prevAns, { blankId: newBlankId, acceptedValues: [''] }]);
        }
      } else if (segmentToUpdate.type === 'blank' && newType === 'text') {
         const blankIdToRemove = segmentToUpdate.id;
         newSegments[index] = { type: 'text' as const, content: '' };
         if (blankIdToRemove) {
            setAnswers(prevAns => prevAns.filter(ans => ans.blankId !== blankIdToRemove));
         }
      } else if (segmentToUpdate.type === newType) {
        // Type hasn't changed, do nothing specific here, content is handled below or not applicable
      }
    } else if (field === 'content' && newSegments[index].type === 'text') {
      (newSegments[index] as { type: 'text', content?: string }).content = value;
    }
    
    setSegments(newSegments);
    const currentValidAnswers = answers.filter(ans => newSegments.some(seg => seg.type === 'blank' && seg.id === ans.blankId));
    // When segments change, ensure onQuestionChange is called with the latest segments and potentially updated answers
    onQuestionChange({ ...question, segments: newSegments, answers: currentValidAnswers, isCaseSensitive });
  };

  const handleAddSegment = () => {
    const newSegArray = [...segments, { type: 'text' as const, content: '' }];
    setSegments(newSegArray);
    onQuestionChange({ ...question, segments: newSegArray });
  };

  const handleRemoveSegment = (index: number) => {
    if (segments.length <= 1) {
        alert("Question must have at least one segment.");
        return;
    }
    const segmentToRemove = segments[index];
    const newSegments = segments.filter((_, i) => i !== index);
    setSegments(newSegments);
    
    let newAnswers = answers;
    if (segmentToRemove.type === 'blank' && segmentToRemove.id) {
        newAnswers = answers.filter(ans => ans.blankId !== segmentToRemove.id);
        setAnswers(newAnswers);
    }
    onQuestionChange({ ...question, segments: newSegments, answers: newAnswers });
  };

  const handleAnswerChange = (blankId: string, value: string) => {
    const newAnswers = answers.map(ans => 
      ans.blankId === blankId ? { ...ans, acceptedValues: value.split(',').map(s => s.trim()).filter(Boolean) } : ans
    );
    setAnswers(newAnswers);
    onQuestionChange({ ...question, answers: newAnswers });
  };

  const handleCaseSensitiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCaseSensitive(e.target.checked);
    onQuestionChange({...question, isCaseSensitive: e.target.checked });
  }

  return (
    <div className="space-y-4">
      <BaseQuestionFormFields question={question} onBaseChange={handleBaseChange} />
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <label className="block font-medium text-sky-300 mb-1 text-sm">Segments & Blanks*</label>
        {segments.map((seg, index) => (
          <div key={seg.id || `seg-${index}`} className="flex items-center space-x-2 bg-slate-750 p-2 rounded">
            <select
              value={seg.type}
              onChange={(e) => handleSegmentChange(index, 'type', e.target.value)}
              className="p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="text">Text</option>
              <option value="blank">Blank</option>
            </select>
            {seg.type === 'text' ? (
              <input
                type="text"
                value={seg.content || ''}
                onChange={(e) => handleSegmentChange(index, 'content', e.target.value)}
                placeholder="Text content"
                className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
              />
            ) : (
              <div className="flex-grow p-2 bg-slate-600 rounded-md text-slate-300 text-sm italic">
                Blank ID: {seg.id || 'New Blank'}
              </div>
            )}
             {segments.length > 1 && (
              <Button type="button" onClick={() => handleRemoveSegment(index)} variant="danger" size="sm" className="!p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={handleAddSegment} variant="secondary" size="sm">Add Segment</Button>
      </div>

      {answers.length > 0 && (
        <div className="pt-4 border-t border-slate-700 space-y-3">
          <label className="block font-medium text-sky-300 mb-1 text-sm">Accepted Answers for Blanks* (Comma-separated for multiple)</label>
          {answers.map((ans) => (
            <div key={ans.blankId} className="space-y-1">
              <label htmlFor={`ans_${ans.blankId}`} className="text-xs text-slate-400">Answers for Blank ID: {ans.blankId}</label>
              <input
                type="text"
                id={`ans_${ans.blankId}`}
                value={ans.acceptedValues.join(', ')}
                onChange={(e) => handleAnswerChange(ans.blankId, e.target.value)}
                placeholder="e.g., answer1, answer2"
                required
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          ))}
           <div className="flex items-center mt-2">
                <input 
                    type="checkbox"
                    id={`${question.id}_caseSensitiveFITB`}
                    checked={isCaseSensitive}
                    onChange={handleCaseSensitiveChange}
                    className="h-4 w-4 text-sky-600 border-slate-500 rounded focus:ring-sky-500"
                />
                <label htmlFor={`${question.id}_caseSensitiveFITB`} className="ml-2 text-sm text-slate-200">
                    Case Sensitive for Blanks
                </label>
            </div>
        </div>
      )}
       {segments.filter(s => s.type === 'blank').length === 0 && (
         <p className="text-xs text-yellow-400">Add at least one 'blank' segment to define answers.</p>
       )}
       {segments.filter(s => s.type === 'blank').length > 0 && answers.some(a => a.acceptedValues.length === 0) && (
         <p className="text-xs text-yellow-400">Ensure all blanks have at least one accepted answer.</p>
       )}
    </div>
  );
};

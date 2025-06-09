
import React, { useState, useEffect } from 'react';
import { MatchingQuestion, MatchPromptItem, MatchOptionItem, BaseQuestion } from '../../types';
import { BaseQuestionFormFields } from './BaseQuestionFormFields';
import { Button } from '../shared/Button';
import { generateUniqueId } from '../../utils/idGenerators';

interface MatchingQuestionFormProps {
  question: MatchingQuestion;
  onQuestionChange: (updatedQuestion: MatchingQuestion) => void;
}

export const MatchingQuestionForm: React.FC<MatchingQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [prompts, setPrompts] = useState<MatchPromptItem[]>(question.prompts || [{ id: generateUniqueId('match_p_'), content: '' }]);
  const [options, setOptions] = useState<MatchOptionItem[]>(question.options || [{ id: generateUniqueId('match_o_'), content: '' }]);
  // correctAnswerMap stores { promptId: string, optionId: string }
  const [correctAnswerMap, setCorrectAnswerMap] = useState(question.correctAnswerMap || []);
  const [shuffleOptions, setShuffleOptions] = useState(question.shuffleOptions === undefined ? true : question.shuffleOptions);


  useEffect(() => {
    setPrompts(question.prompts || [{ id: generateUniqueId('match_p_'), content: 'Prompt 1' }]);
    setOptions(question.options || [{ id: generateUniqueId('match_o_'), content: 'Option A' }]);
    setCorrectAnswerMap(question.correctAnswerMap || []);
    setShuffleOptions(question.shuffleOptions === undefined ? true : question.shuffleOptions);
  }, [question]);

  const handleBaseChange = <K extends keyof BaseQuestion>(field: K, value: BaseQuestion[K]) => {
    onQuestionChange({ ...question, [field]: value });
  };

  const updateQuestion = (updatedFields: Partial<MatchingQuestion>) => {
    onQuestionChange({ ...question, ...updatedFields });
  };

  // Prompts Management
  const handlePromptChange = (index: number, content: string) => {
    const newPrompts = [...prompts];
    newPrompts[index].content = content;
    setPrompts(newPrompts);
    updateQuestion({ prompts: newPrompts });
  };
  const handleAddPrompt = () => {
    const newPrompts = [...prompts, { id: generateUniqueId('match_p_'), content: '' }];
    setPrompts(newPrompts);
    updateQuestion({ prompts: newPrompts });
  };
  const handleRemovePrompt = (index: number) => {
    if (prompts.length <= 1) return;
    const promptIdToRemove = prompts[index].id;
    const newPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(newPrompts);
    const newMap = correctAnswerMap.filter(m => m.promptId !== promptIdToRemove);
    setCorrectAnswerMap(newMap);
    updateQuestion({ prompts: newPrompts, correctAnswerMap: newMap });
  };

  // Options Management
  const handleOptionChange = (index: number, content: string) => {
    const newOptions = [...options];
    newOptions[index].content = content;
    setOptions(newOptions);
    updateQuestion({ options: newOptions });
  };
  const handleAddOption = () => {
    const newOptions = [...options, { id: generateUniqueId('match_o_'), content: '' }];
    setOptions(newOptions);
    updateQuestion({ options: newOptions });
  };
  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const optionIdToRemove = options[index].id;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    const newMap = correctAnswerMap.map(m => m.optionId === optionIdToRemove ? { ...m, optionId: '' } : m).filter(m => m.optionId !== ''); // Clear or remove mappings
    setCorrectAnswerMap(newMap);
    updateQuestion({ options: newOptions, correctAnswerMap: newMap });
  };
  
  // Answer Map Management
  const handleMapChange = (promptId: string, selectedOptionId: string) => {
    const existingMapIndex = correctAnswerMap.findIndex(m => m.promptId === promptId);
    let newMap = [...correctAnswerMap];
    if (selectedOptionId === "") { // User selected "Select Option"
        newMap = newMap.filter(m => m.promptId !== promptId);
    } else if (existingMapIndex > -1) {
        newMap[existingMapIndex] = { promptId, optionId: selectedOptionId };
    } else {
        newMap.push({ promptId, optionId: selectedOptionId });
    }
    setCorrectAnswerMap(newMap);
    updateQuestion({ correctAnswerMap: newMap });
  };

  const handleShuffleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShuffleOptions(e.target.checked);
    updateQuestion({ shuffleOptions: e.target.checked });
  }


  return (
    <div className="space-y-6">
      <BaseQuestionFormFields question={question} onBaseChange={handleBaseChange} />
      
      {/* Prompts Section */}
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <h4 className="font-medium text-sky-300 text-sm">Prompts (e.g., Terms, Questions)</h4>
        {prompts.map((prompt, index) => (
          <div key={prompt.id} className="flex items-center space-x-2 bg-slate-750 p-2 rounded">
            <input
              type="text" value={prompt.content} onChange={(e) => handlePromptChange(index, e.target.value)}
              placeholder={`Prompt ${index + 1}`} required
              className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
            />
            {prompts.length > 1 && <Button type="button" onClick={() => handleRemovePrompt(index)} variant="danger" size="sm" className="!p-1.5">X</Button>}
          </div>
        ))}
        <Button type="button" onClick={handleAddPrompt} variant="secondary" size="sm">Add Prompt</Button>
      </div>

      {/* Options Section */}
      <div className="pt-4 border-t border-slate-700 space-y-3">
        <h4 className="font-medium text-sky-300 text-sm">Options (e.g., Definitions, Answers)</h4>
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center space-x-2 bg-slate-750 p-2 rounded">
            <input
              type="text" value={option.content} onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`} required
              className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
            />
            {options.length > 1 && <Button type="button" onClick={() => handleRemoveOption(index)} variant="danger" size="sm" className="!p-1.5">X</Button>}
          </div>
        ))}
        <Button type="button" onClick={handleAddOption} variant="secondary" size="sm">Add Option</Button>
      </div>

      {/* Answer Mapping Section */}
      {prompts.length > 0 && options.length > 0 && (
        <div className="pt-4 border-t border-slate-700 space-y-3">
          <h4 className="font-medium text-sky-300 text-sm">Correct Matches*</h4>
          {prompts.map(prompt => (
            <div key={`map-${prompt.id}`} className="grid grid-cols-2 gap-2 items-center bg-slate-750 p-2 rounded">
              <span className="text-slate-300 text-xs truncate" title={prompt.content}>{prompt.content || `(Prompt ${prompt.id.slice(-4)})`}</span>
              <select
                value={correctAnswerMap.find(m => m.promptId === prompt.id)?.optionId || ""}
                onChange={(e) => handleMapChange(prompt.id, e.target.value)}
                className="p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="">Select Matching Option</option>
                {options.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.content || `(Option ${opt.id.slice(-4)})`}</option>
                ))}
              </select>
            </div>
          ))}
          {correctAnswerMap.length < prompts.length && (
             <p className="text-xs text-yellow-400">Ensure all prompts are matched to an option.</p>
          )}
        </div>
      )}
       <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center">
                <input 
                    type="checkbox"
                    id={`${question.id}_shuffleMatchOpts`}
                    checked={shuffleOptions}
                    onChange={handleShuffleOptionsChange}
                    className="h-4 w-4 text-sky-600 border-slate-500 rounded focus:ring-sky-500"
                />
                <label htmlFor={`${question.id}_shuffleMatchOpts`} className="ml-2 text-sm text-slate-200">
                    Shuffle Options for student view
                </label>
            </div>
        </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { TrueFalseQuestion, BaseQuestion } from '../../types';
// import { BaseQuestionFormFields } from './BaseQuestionFormFields'; // Not using if managing all fields locally

interface TrueFalseQuestionFormProps {
  question: TrueFalseQuestion; 
  onQuestionChange: (updatedQuestion: TrueFalseQuestion) => void;
}

// Define editable fields for TrueFalseQuestion.
// To align with fixes for "property does not exist" errors, BaseQuestion-derived fields
// might be simplified here if those errors imply a globally simpler BaseQuestion.
// However, this form targets TrueFalseQuestion, which *does* extend the full BaseQuestion from types.ts.
type EditableBaseKeysTrueFalse = keyof Omit<BaseQuestion, 'id' | 'questionType'>;
type TrueFalseSpecificEditableFields = 'correctAnswer';
// Special handling for glossary input as a single string
type TrueFalseFormField = EditableBaseKeysTrueFalse | TrueFalseSpecificEditableFields | 'glossary_string';


export const TrueFalseQuestionForm: React.FC<TrueFalseQuestionFormProps> = ({
  question,
  onQuestionChange,
}) => {
  const [prompt, setPrompt] = useState(question.prompt || '');
  const [points, setPoints] = useState(question.points === undefined ? 10 : question.points);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer || false);
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [learningObjective, setLearningObjective] = useState(question.learningObjective || '');
  const [glossary, setGlossary] = useState((question.glossary || []).join('\n'));
  const [bloomLevel, setBloomLevel] = useState(question.bloomLevel || '');
  const [difficulty, setDifficulty] = useState(question.difficulty || 'medium');
  const [category, setCategory] = useState(question.category || '');
  const [topic, setTopic] = useState(question.topic || '');
  const [gradeBand, setGradeBand] = useState(question.gradeBand || '');
  const [contextCode, setContextCode] = useState(question.contextCode || '');
  const [course, setCourse] = useState(question.course || '');


  useEffect(() => {
    setPrompt(question.prompt || '');
    setPoints(question.points === undefined ? 10 : question.points);
    setCorrectAnswer(question.correctAnswer || false);
    setExplanation(question.explanation || '');
    setLearningObjective(question.learningObjective || '');
    setGlossary((question.glossary || []).join('\n'));
    setBloomLevel(question.bloomLevel || '');
    setDifficulty(question.difficulty || 'medium');
    setCategory(question.category || '');
    setTopic(question.topic || '');
    setGradeBand(question.gradeBand || '');
    setContextCode(question.contextCode || '');
    setCourse(question.course || '');
  }, [question]);

  const handleQuestionPropertyChange = (field: TrueFalseFormField, value: any) => {
    const updatedQuestion: TrueFalseQuestion = { ...question };

    switch (field) {
        case 'prompt': updatedQuestion.prompt = String(value); break;
        case 'points': updatedQuestion.points = Number(value) >= 0 ? Number(value) : 0; break;
        case 'explanation': updatedQuestion.explanation = String(value); break;
        case 'learningObjective': updatedQuestion.learningObjective = String(value); break;
        case 'glossary_string': updatedQuestion.glossary = typeof value === 'string' ? value.split('\n').map(s => s.trim()).filter(Boolean) : []; break;
        case 'bloomLevel': updatedQuestion.bloomLevel = String(value); break;
        case 'difficulty': updatedQuestion.difficulty = value as BaseQuestion['difficulty']; break;
        case 'category': updatedQuestion.category = String(value); break;
        case 'topic': updatedQuestion.topic = String(value); break;
        case 'gradeBand': updatedQuestion.gradeBand = String(value); break;
        case 'contextCode': updatedQuestion.contextCode = String(value); break;
        case 'course': updatedQuestion.course = String(value); break; 
        case 'correctAnswer': updatedQuestion.correctAnswer = typeof value === 'boolean' ? value : false; break;
        default:
            const _exhaustiveCheck: never = field;
            console.warn(`Unhandled field in TrueFalseQuestionForm: ${_exhaustiveCheck}`);
            return; 
    }
    onQuestionChange(updatedQuestion);
  };
  
  const handleLocalStateChange = (
    stateSetter: React.Dispatch<React.SetStateAction<any>>, 
    fieldName: TrueFalseFormField, 
    newValue: any
  ) => {
    stateSetter(newValue); 
    handleQuestionPropertyChange(fieldName, newValue); 
  };


  return (
    <div className="space-y-4 text-sm">
      <div>
        <label htmlFor={`${question.id}_prompt`} className="block font-medium text-sky-300 mb-1">Prompt</label>
        <textarea
          id={`${question.id}_prompt`}
          value={prompt}
          onChange={(e) => handleLocalStateChange(setPrompt, 'prompt', e.target.value)}
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
          value={points}
          onChange={(e) => handleLocalStateChange(setPoints, 'points', parseInt(e.target.value, 10))}
          min="0"
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      <div>
        <span className="block font-medium text-sky-300 mb-1">Correct Answer</span>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input type="radio" name={`${question.id}_correctAnswer`} checked={correctAnswer === true} onChange={() => handleLocalStateChange(setCorrectAnswer, 'correctAnswer', true)} className="h-4 w-4 text-sky-600 border-slate-500 focus:ring-sky-500" />
            <span className="ml-2 text-slate-200">True</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name={`${question.id}_correctAnswer`} checked={correctAnswer === false} onChange={() => handleLocalStateChange(setCorrectAnswer, 'correctAnswer', false)} className="h-4 w-4 text-sky-600 border-slate-500 focus:ring-sky-500" />
            <span className="ml-2 text-slate-200">False</span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor={`${question.id}_explanation`} className="block font-medium text-sky-300 mb-1">Explanation (Optional)</label>
        <textarea
          id={`${question.id}_explanation`}
          value={explanation}
          onChange={(e) => handleLocalStateChange(setExplanation, 'explanation', e.target.value)}
          rows={2}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>
      
      <div>
        <label htmlFor={`${question.id}_learningObjective`} className="block font-medium text-sky-300 mb-1">Learning Objective (Optional)</label>
        <input
          type="text"
          id={`${question.id}_learningObjective`}
          value={learningObjective}
          onChange={(e) => handleLocalStateChange(setLearningObjective, 'learningObjective', e.target.value)}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      <div>
        <label htmlFor={`${question.id}_glossary`} className="block font-medium text-sky-300 mb-1">Glossary (Optional, one term per line)</label>
        <textarea
          id={`${question.id}_glossary`}
          value={glossary}
          onChange={(e) => handleLocalStateChange(setGlossary, 'glossary_string', e.target.value)}
          rows={2}
          className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-700 mt-4">
        <div>
          <label htmlFor={`${question.id}_difficulty`} className="block font-medium text-sky-300 mb-1">Difficulty</label>
          <select
            id={`${question.id}_difficulty`}
            value={difficulty}
            onChange={(e) => handleLocalStateChange(setDifficulty, 'difficulty', e.target.value as BaseQuestion['difficulty'])}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            {typeof difficulty === 'string' && !['easy', 'medium', 'hard'].includes(difficulty) && (
              <option value={difficulty}>{difficulty}</option>
            )}
          </select>
        </div>
        <div>
          <label htmlFor={`${question.id}_bloomLevel`} className="block font-medium text-sky-300 mb-1">Bloom's Level (Optional)</label>
          <input
            type="text"
            id={`${question.id}_bloomLevel`}
            value={bloomLevel}
            onChange={(e) => handleLocalStateChange(setBloomLevel, 'bloomLevel', e.target.value)}
            placeholder="e.g., Remembering, Applying"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor={`${question.id}_category`} className="block font-medium text-sky-300 mb-1">Category (Optional)</label>
          <input
            type="text"
            id={`${question.id}_category`}
            value={category}
            onChange={(e) => handleLocalStateChange(setCategory, 'category', e.target.value)}
            placeholder="e.g., Mathematics, History"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor={`${question.id}_topic`} className="block font-medium text-sky-300 mb-1">Topic (Optional)</label>
          <input
            type="text"
            id={`${question.id}_topic`}
            value={topic}
            onChange={(e) => handleLocalStateChange(setTopic, 'topic', e.target.value)}
            placeholder="e.g., Algebra, World War II"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
         <div>
          <label htmlFor={`${question.id}_gradeBand`} className="block font-medium text-sky-300 mb-1">Grade Band (Optional)</label>
          <input
            type="text"
            id={`${question.id}_gradeBand`}
            value={gradeBand}
            onChange={(e) => handleLocalStateChange(setGradeBand, 'gradeBand', e.target.value)}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor={`${question.id}_contextCode`} className="block font-medium text-sky-300 mb-1">Context Code (Optional)</label>
          <input
            type="text"
            id={`${question.id}_contextCode`}
            value={contextCode}
            onChange={(e) => handleLocalStateChange(setContextCode, 'contextCode', e.target.value)}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        <div>
          <label htmlFor={`${question.id}_course`} className="block font-medium text-sky-300 mb-1">Course (Optional)</label>
          <input
            type="text"
            id={`${question.id}_course`}
            value={course}
            onChange={(e) => handleLocalStateChange(setCourse, 'course', e.target.value)}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>

    </div>
  );
};

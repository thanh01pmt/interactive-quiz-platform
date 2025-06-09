
import React from 'react';
import { QuizQuestion, UserAnswerType } from '../types';
import { MultipleChoiceQuestionUI } from './MultipleChoiceQuestionUI';
import { MultipleResponseQuestionUI } from './MultipleResponseQuestionUI';
import { FillInTheBlanksQuestionUI } from './FillInTheBlanksQuestionUI';
import { DragAndDropQuestionUI } from './DragAndDropQuestionUI';
import { TrueFalseQuestionUI } from './TrueFalseQuestionUI';
import { ShortAnswerQuestionUI } from './ShortAnswerQuestionUI';
import { NumericQuestionUI } from './NumericQuestionUI';
import { SequenceQuestionUI } from './SequenceQuestionUI';
import { MatchingQuestionUI } from './MatchingQuestionUI';
import { HotspotQuestionUI } from './HotspotQuestionUI';
import { BlocklyProgrammingQuestionUI } from './BlocklyProgrammingQuestionUI'; // Renamed import
import { ScratchProgrammingQuestionUI } from './ScratchProgrammingQuestionUI'; // Added import
import { Card } from './shared/Card';

interface QuestionRendererProps {
  question: QuizQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  questionNumber: number;
  totalQuestions: number;
  showCorrectAnswer?: boolean;
  shuffleOptions?: boolean; 
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  questionNumber,
  totalQuestions,
  showCorrectAnswer,
  shuffleOptions,
}) => {
  const renderQuestionSpecificUI = () => {
    switch (question.questionType) {
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
            shuffleOptions={shuffleOptions}
          />
        );
      case 'multiple_response':
        return (
          <MultipleResponseQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
            shuffleOptions={shuffleOptions}
          />
        );
      case 'fill_in_the_blanks':
        return (
          <FillInTheBlanksQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case 'drag_and_drop':
        return (
          <DragAndDropQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case 'true_false':
        return (
          <TrueFalseQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case 'short_answer':
        return (
          <ShortAnswerQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case 'numeric':
        return (
          <NumericQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case 'sequence':
        return (
          <SequenceQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case 'matching':
        return (
          <MatchingQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
            shuffleOptions={shuffleOptions && question.shuffleOptions}
          />
        );
      case 'hotspot':
        return (
          <HotspotQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case 'blockly_programming': // Renamed case
        return (
          <BlocklyProgrammingQuestionUI // Renamed component
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      case 'scratch_programming': // Added case
        return (
          <ScratchProgrammingQuestionUI
            question={question}
            onAnswerChange={onAnswerChange}
            userAnswer={userAnswer}
            showCorrectAnswer={showCorrectAnswer}
          />
        );
      default:
        // This default case helps catch unhandled question types during development
        const _exhaustiveCheck: never = question;
        console.warn("Unsupported question type in QuestionRenderer:", _exhaustiveCheck);
        return <p className="text-red-400">Error: Unsupported question type.</p>;
    }
  };

  const metadataFields: Array<{ label: string; value?: string | string[] }> = [
    { label: "Bloom's Level", value: question.bloomLevel },
    { label: "Difficulty", value: question.difficulty },
    { label: "Category", value: question.category },
    { label: "Topic", value: question.topic },
    { label: "Course", value: question.course },
    { label: "Grade Band", value: question.gradeBand },
    { label: "Context Code", value: question.contextCode },
  ].filter(field => field.value !== undefined && field.value !== null && (Array.isArray(field.value) ? field.value.length > 0 : String(field.value).trim() !== ''));


  return (
    <Card className="w-full">
      <div className="mb-4">
        <p className="text-sm text-slate-400">Question {questionNumber} of {totalQuestions}</p>
        {question.points && <p className="text-sm text-sky-400">Points: {question.points}</p>}
      </div>
      <h2 className="text-xl font-semibold text-slate-100 mb-6">{question.prompt}</h2>
      {renderQuestionSpecificUI()}
      {showCorrectAnswer && (
        <div className="mt-6 space-y-3">
          {question.learningObjective && (
            <div className="p-3 bg-slate-700 rounded-md">
              <h4 className="font-semibold text-sky-300">Learning Objective:</h4>
              <p className="text-slate-300 text-sm">{question.learningObjective}</p>
            </div>
          )}
          {question.explanation && (
            <div className="p-3 bg-slate-700 rounded-md">
              <h4 className="font-semibold text-sky-300">Explanation:</h4>
              <p className="text-slate-300 text-sm">{question.explanation}</p>
            </div>
          )}
          {question.glossary && question.glossary.length > 0 && (
            <div className="p-3 bg-slate-700 rounded-md">
              <h4 className="font-semibold text-sky-300">Glossary:</h4>
              <ul className="list-disc list-inside text-slate-300 text-sm">
                {question.glossary.map((term, index) => (
                  <li key={`glossary-${index}`}>{term}</li>
                ))}
              </ul>
            </div>
          )}
          {metadataFields.length > 0 && (
            <div className="p-3 bg-slate-700 rounded-md">
              <h4 className="font-semibold text-sky-300 mb-2">Additional Information:</h4>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {metadataFields.map(field => (
                  <div key={field.label} className="flex">
                    <dt className="font-medium text-slate-400 w-1/3 pr-2">{field.label}:</dt>
                    <dd className="text-slate-300 w-2/3">
                      {Array.isArray(field.value) ? field.value.join(', ') : field.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

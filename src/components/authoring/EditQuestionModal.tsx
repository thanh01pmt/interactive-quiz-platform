
import React from 'react';
import { 
    QuizQuestion, 
    TrueFalseQuestion, 
    MultipleChoiceQuestion, 
    MultipleResponseQuestion,
    ShortAnswerQuestion,
    NumericQuestion,
    FillInTheBlanksQuestion,
    SequenceQuestion,
    MatchingQuestion,
    HotspotQuestion, // Added
    BlocklyProgrammingQuestion, // Added
    ScratchProgrammingQuestion // Added
} from '../../types'; // Corrected path
import { Button } from '../shared/Button'; // Corrected path
import { Card } from '../shared/Card';   // Corrected path
import { TrueFalseQuestionForm } from './TrueFalseQuestionForm';
import { MultipleChoiceQuestionForm } from './MultipleChoiceQuestionForm';
import { MultipleResponseQuestionForm } from './MultipleResponseQuestionForm';
import { ShortAnswerQuestionForm } from './ShortAnswerQuestionForm';
import { NumericQuestionForm } from './NumericQuestionForm';
import { FillInTheBlanksQuestionForm } from './FillInTheBlanksQuestionForm';
import { SequenceQuestionForm } from './SequenceQuestionForm';
import { MatchingQuestionForm } from './MatchingQuestionForm';
// Import other question form components here if/when they are created
// e.g., import { HotspotQuestionForm } from './HotspotQuestionForm';

interface EditQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionData: QuizQuestion;
  onSaveQuestion: (question: QuizQuestion) => void;
  isNewQuestion: boolean;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({
  isOpen,
  onClose,
  questionData,
  onSaveQuestion,
  isNewQuestion,
}) => {
  if (!isOpen) return null;

  const [currentQuestion, setCurrentQuestion] = React.useState<QuizQuestion>(questionData);

  React.useEffect(() => {
    setCurrentQuestion(questionData);
  }, [questionData]);


  const handleSave = () => {
    if (!currentQuestion.prompt || currentQuestion.prompt.trim() === '') {
        alert('Question prompt cannot be empty.');
        return;
    }
    // Add more specific validations per question type if needed
    onSaveQuestion(currentQuestion);
  };

  const renderQuestionForm = () => {
    switch (currentQuestion.questionType) {
      case 'true_false':
        return (
          <TrueFalseQuestionForm
            question={currentQuestion as TrueFalseQuestion}
            onQuestionChange={setCurrentQuestion}
          />
        );
      case 'multiple_choice':
        return (
            <MultipleChoiceQuestionForm
                question={currentQuestion as MultipleChoiceQuestion}
                onQuestionChange={setCurrentQuestion}
            />
        );
      case 'multiple_response':
        return (
            <MultipleResponseQuestionForm
                question={currentQuestion as MultipleResponseQuestion}
                onQuestionChange={setCurrentQuestion}
            />
        );
      case 'short_answer':
        return (
            <ShortAnswerQuestionForm
                question={currentQuestion as ShortAnswerQuestion}
                onQuestionChange={setCurrentQuestion}
            />
        );
      case 'numeric':
        return (
            <NumericQuestionForm
                question={currentQuestion as NumericQuestion}
                onQuestionChange={setCurrentQuestion}
            />
        );
      case 'fill_in_the_blanks':
        return (
            <FillInTheBlanksQuestionForm
                question={currentQuestion as FillInTheBlanksQuestion}
                onQuestionChange={setCurrentQuestion}
            />
        );
        case 'sequence':
        return (
            <SequenceQuestionForm
                question={currentQuestion as SequenceQuestion}
                onQuestionChange={setCurrentQuestion}
            />
        );
        case 'matching':
        return (
            <MatchingQuestionForm
                question={currentQuestion as MatchingQuestion}
                onQuestionChange={setCurrentQuestion}
            />
        );
      // Placeholder for future forms - currently only True/False and basic MCQ forms exist in provided files
      case 'drag_and_drop':
      case 'hotspot':
      case 'blockly_programming':
      case 'scratch_programming':
      default:
        const questionTypeLabel = currentQuestion.questionType.replace(/_/g, ' ');
        return <p className="text-yellow-400 text-center p-4">Editing for '{questionTypeLabel}' questions is not yet fully implemented or the specific form component is missing.</p>;
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
        onClick={onClose} 
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-question-modal-title"
    >
      <Card 
        title={isNewQuestion ? `Add New ${currentQuestion.questionType.replace(/_/g, ' ')} Question` : `Edit ${currentQuestion.questionType.replace(/_/g, ' ')} Question`} 
        className="w-full max-w-3xl bg-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]"
        id="edit-question-modal-title"
      >
        <div onClick={(e) => e.stopPropagation()} className="space-y-6 p-1 sm:p-3 md:p-4"> {/* Add padding inside the card content area */}
          {renderQuestionForm()}
          <div className="mt-8 flex justify-end space-x-3 border-t border-slate-700 pt-4">
            <Button onClick={onClose} variant="secondary">Cancel</Button>
            <Button onClick={handleSave} variant="primary">
              {isNewQuestion ? 'Add Question' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

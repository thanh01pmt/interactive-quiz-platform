
// Core Logic
export { QuizEngine } from './services/QuizEngine';

// Question Type Interfaces & Core Types
export * from './types';

// UI Components
export { QuizPlayer } from './components/QuizPlayer';
export { QuestionRenderer } from './components/QuestionRenderer';
export { QuizResult } from './components/QuizResult';
export { QuizDataManagement } from './components/QuizDataManagement'; 

// Authoring Tool Components
export { QuizAuthoringTool } from './components/authoring/QuizAuthoringTool';
export { QuizSettingsForm } from './components/authoring/QuizSettingsForm';
export { QuestionList } from './components/authoring/QuestionList';
export { EditQuestionModal } from './components/authoring/EditQuestionModal';
export { BaseQuestionFormFields } from './components/authoring/BaseQuestionFormFields';
export { TrueFalseQuestionForm } from './components/authoring/TrueFalseQuestionForm';
export { MultipleChoiceQuestionForm } from './components/authoring/MultipleChoiceQuestionForm';
export { MultipleResponseQuestionForm } from './components/authoring/MultipleResponseQuestionForm';
export { ShortAnswerQuestionForm } from './components/authoring/ShortAnswerQuestionForm';
export { NumericQuestionForm } from './components/authoring/NumericQuestionForm';
export { FillInTheBlanksQuestionForm } from './components/authoring/FillInTheBlanksQuestionForm';
export { SequenceQuestionForm } from './components/authoring/SequenceQuestionForm';
export { MatchingQuestionForm } from './components/authoring/MatchingQuestionForm';
export { AIQuestionGeneratorModal } from './components/authoring/AIQuestionGeneratorModal';
export { AIQuestionGeneratorForm } from './components/authoring/AIQuestionGeneratorForm';
export { getNewQuestionTemplate } from './components/authoring/questionTemplates'; 

// Individual Question UI Components (Optional - for more granular usage)
export { MultipleChoiceQuestionUI } from './components/MultipleChoiceQuestionUI';
export { MultipleResponseQuestionUI } from './components/MultipleResponseQuestionUI';
export { FillInTheBlanksQuestionUI } from './components/FillInTheBlanksQuestionUI';
export { DragAndDropQuestionUI } from './components/DragAndDropQuestionUI';
export { TrueFalseQuestionUI } from './components/TrueFalseQuestionUI';
export { ShortAnswerQuestionUI } from './components/ShortAnswerQuestionUI';
export { NumericQuestionUI } from './components/NumericQuestionUI';
export { SequenceQuestionUI } from './components/SequenceQuestionUI';
export { MatchingQuestionUI } from './components/MatchingQuestionUI';
export { HotspotQuestionUI } from './components/HotspotQuestionUI';
export { BlocklyProgrammingQuestionUI } from './components/BlocklyProgrammingQuestionUI';
export { ScratchProgrammingQuestionUI } from './components/ScratchProgrammingQuestionUI';

// Shared UI Components (Optional)
export { Button } from './components/shared/Button';
export { Card } from './components/shared/Card';

// Utilities
export { generateUniqueId } from './utils/idGenerators';

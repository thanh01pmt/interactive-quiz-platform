// Base interface for all questions
export interface BaseQuestion {
  id: string;
  questionType: string;
  prompt: string; // Question text or main instruction
  points?: number;
  explanation?: string; // Optional explanation shown after answering
}

// 1. Multiple Choice Question (Single Correct Answer)
export interface MultipleChoiceQuestion extends BaseQuestion {
  questionType: 'multiple_choice';
  options: { id: string; text: string }[];
  correctAnswerId: string;
}

// 2. Multiple Response Question (Multiple Correct Answers)
export interface MultipleResponseQuestion extends BaseQuestion {
  questionType: 'multiple_response';
  options: { id: string; text: string }[];
  correctAnswerIds: string[];
}

// 3. Fill In The Blanks Question
export interface FillInTheBlanksQuestion extends BaseQuestion {
  questionType: 'fill_in_the_blanks';
  segments: { type: 'text' | 'blank'; content?: string; id?: string }[]; // 'id' for blank segments
  answers: { blankId: string; acceptedValues: string[] }[]; // Accepted values are case-insensitive
  isCaseSensitive?: boolean; // Added to control case sensitivity
}

// 4. Drag and Drop Question
export interface DraggableItem {
  id: string;
  content: string; // Text or path to image
}
export interface DropZone {
  id: string;
  label: string; // Displayed label for the drop zone
}
export interface DragAndDropQuestion extends BaseQuestion {
  questionType: 'drag_and_drop';
  draggableItems: DraggableItem[];
  dropZones: DropZone[];
  answerMap: { draggableId: string; dropZoneId: string }[]; // Correct pairings
  backgroundImageUrl?: string; // Optional background for context
}

// 5. True/False Question
export interface TrueFalseQuestion extends BaseQuestion {
  questionType: 'true_false';
  correctAnswer: boolean; // true or false
}

// 6. Short Answer Question
export interface ShortAnswerQuestion extends BaseQuestion {
  questionType: 'short_answer';
  acceptedAnswers: string[]; // Array of acceptable string answers
  isCaseSensitive?: boolean;
}

// 7. Numeric Question
export interface NumericQuestion extends BaseQuestion {
  questionType: 'numeric';
  answer: number;
  tolerance?: number; // Optional tolerance for the answer (e.g., answer is 10, tolerance 1, accepts 9, 10, 11)
}

// 8. Sequence Question
export interface SequenceItem {
  id: string;
  content: string;
}
export interface SequenceQuestion extends BaseQuestion {
  questionType: 'sequence';
  items: SequenceItem[]; // Items to be ordered, initially shuffled for the user
  correctOrder: string[]; // Array of item IDs in the correct order
}

// 9. Matching Question
export interface MatchPromptItem { // Renamed from MatchItem to avoid conflict, specific to prompts
  id: string;
  content: string;
}
export interface MatchOptionItem { // Renamed from MatchItem to avoid conflict, specific to options
  id: string;
  content: string;
}
export interface MatchingQuestion extends BaseQuestion {
  questionType: 'matching';
  prompts: MatchPromptItem[]; // e.g., Column A (fixed)
  options: MatchOptionItem[]; // e.g., Column B (draggable/selectable to match with prompts)
  correctAnswerMap: { promptId: string; optionId: string }[];
  shuffleOptions?: boolean; // Whether to shuffle the "options" list
}

// 10. Hotspot Question
export interface HotspotArea {
  id: string; // Unique ID for the hotspot area
  shape: 'rect' | 'circle';
  coords: number[]; // For rect: [x, y, width, height], For circle: [cx, cy, radius] (all as percentages of image dimensions)
  description?: string; // Optional description for accessibility or label
}
export interface HotspotQuestion extends BaseQuestion {
  questionType: 'hotspot';
  imageUrl: string;
  imageAltText?: string;
  hotspots: HotspotArea[]; // Defined clickable areas
  correctHotspotIds: string[]; // IDs of the correct hotspot(s) to click
}

// 11. Blockly Programming Question
export interface BlocklyProgrammingQuestion extends BaseQuestion {
  questionType: 'blockly_programming'; // Renamed type literal
  toolboxDefinition: string; // XML string defining the Blockly toolbox
  initialWorkspace?: string; // Optional XML string for the initial state of the workspace
  solutionWorkspaceXML?: string; // XML string of the target solution (for basic comparison)
}

// 12. Scratch Programming Question
export interface ScratchProgrammingQuestion extends BaseQuestion {
  questionType: 'scratch_programming';
  toolboxDefinition: string; // XML string defining the Scratch-like toolbox (still Blockly XML)
  initialWorkspace?: string; // Optional XML string for the initial state of the workspace
  solutionWorkspaceXML?: string; // XML string of the target solution
}


// Union type for all possible question types
export type QuizQuestion =
  | MultipleChoiceQuestion
  | MultipleResponseQuestion
  | FillInTheBlanksQuestion
  | DragAndDropQuestion
  | TrueFalseQuestion
  | ShortAnswerQuestion
  | NumericQuestion
  | SequenceQuestion
  | MatchingQuestion
  | HotspotQuestion
  | BlocklyProgrammingQuestion // Renamed
  | ScratchProgrammingQuestion; // Added new type

// Structure for the entire quiz
export interface QuizConfig {
  id:string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings?: QuizSettings;
}

export interface QuizSettings {
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean; // For MCQs, MRQs, Matching
  timeLimitMinutes?: number;
  showCorrectAnswers?: 'immediately' | 'end_of_quiz' | 'never';
  passingScorePercent?: number;
  webhookUrl?: string; // URL to send quiz results
}

// Type for user answers stored in QuizEngine
// Key is questionId
export type UserAnswers = Map<string, UserAnswerType>;

// Union type for different answer formats
export type UserAnswerType =
  | string // For MultipleChoice (optionId), TrueFalse ('true'/'false'), ShortAnswer (user's text), Numeric (user's input as string), Hotspot (clicked hotspotId), BlocklyProgramming (workspace XML), ScratchProgramming (workspace XML)
  | string[] // For MultipleResponse (array of optionIds), Sequence (array of itemIds in user's order)
  | Record<string, string> // For FillInTheBlanks (blankId: userAnswer), DragAndDrop (draggableId: dropZoneId), Matching (promptId: optionId)
  | null; // For unanswered questions


export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  answers: UserAnswers;
  passed?: boolean; // If passingScorePercent is defined
  questionResults: Array<{
    questionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    userAnswer: UserAnswerType;
    correctAnswer: any; // Could be string, string[], boolean, Record<string,string>, XML string etc. based on question type
  }>;
  webhookStatus?: 'idle' | 'sending' | 'success' | 'error';
  webhookError?: string;
}

// Callbacks for QuizEngine events
export interface QuizEngineCallbacks {
  onQuizStart?: (initialData: {
    initialQuestion: QuizQuestion | null;
    currentQuestionNumber: number;
    totalQuestions: number;
    timeLimitInSeconds: number | null;
  }) => void;
  onQuestionChange?: (question: QuizQuestion | null, currentQuestionNumber: number, totalQuestions: number) => void;
  onAnswerSubmit?: (question: QuizQuestion, userAnswer: UserAnswerType) => void; // Changed questionId to question
  onQuizFinish?: (results: QuizResult) => void;
  onTimeTick?: (timeLeftInSeconds: number) => void;
  onQuizTimeUp?: () => void;
}

// Options for QuizEngine constructor
export interface QuizEngineConstructorOptions {
  config: QuizConfig;
  callbacks?: QuizEngineCallbacks;
}
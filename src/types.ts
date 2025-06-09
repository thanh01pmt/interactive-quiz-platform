
// Base interface for all questions
export type QuestionTypeStrings =
  | 'multiple_choice'
  | 'multiple_response'
  | 'fill_in_the_blanks'
  | 'drag_and_drop'
  | 'true_false'
  | 'short_answer'
  | 'numeric'
  | 'sequence'
  | 'matching'
  | 'hotspot'
  | 'blockly_programming'
  | 'scratch_programming';

export interface BaseQuestion {
  id: string;
  questionType: QuestionTypeStrings;
  prompt: string;
  points?: number;
  explanation?: string;
  learningObjective?: string;
  glossary?: string[];
  bloomLevel?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string; // Allow custom string for flexibility
  contextCode?: string;
  gradeBand?: string;
  course?: string;
  category?: string;
  topic?: string;
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
  segments: { type: 'text' | 'blank'; content?: string; id?: string }[];
  answers: { blankId: string; acceptedValues: string[] }[];
  isCaseSensitive?: boolean;
}

// 4. Drag and Drop Question
export interface DraggableItem {
  id: string;
  content: string;
}
export interface DropZone {
  id: string;
  label: string;
}
export interface DragAndDropQuestion extends BaseQuestion {
  questionType: 'drag_and_drop';
  draggableItems: DraggableItem[];
  dropZones: DropZone[];
  answerMap: { draggableId: string; dropZoneId: string }[];
  backgroundImageUrl?: string;
}

// 5. True/False Question
export interface TrueFalseQuestion extends BaseQuestion {
  questionType: 'true_false';
  correctAnswer: boolean;
}

// 6. Short Answer Question
export interface ShortAnswerQuestion extends BaseQuestion {
  questionType: 'short_answer';
  acceptedAnswers: string[];
  isCaseSensitive?: boolean;
}

// 7. Numeric Question
export interface NumericQuestion extends BaseQuestion {
  questionType: 'numeric';
  answer: number;
  tolerance?: number;
}

// 8. Sequence Question
export interface SequenceItem {
  id: string;
  content: string;
}
export interface SequenceQuestion extends BaseQuestion {
  questionType: 'sequence';
  items: SequenceItem[];
  correctOrder: string[];
}

// 9. Matching Question
export interface MatchPromptItem {
  id: string;
  content: string;
}
export interface MatchOptionItem {
  id: string;
  content: string;
}
export interface MatchingQuestion extends BaseQuestion {
  questionType: 'matching';
  prompts: MatchPromptItem[];
  options: MatchOptionItem[];
  correctAnswerMap: { promptId: string; optionId: string }[];
  shuffleOptions?: boolean;
}

// 10. Hotspot Question
export interface HotspotArea {
  id: string;
  shape: 'rect' | 'circle';
  coords: number[];
  description?: string;
}
export interface HotspotQuestion extends BaseQuestion {
  questionType: 'hotspot';
  imageUrl: string;
  imageAltText?: string;
  hotspots: HotspotArea[];
  correctHotspotIds: string[];
}

// 11. Blockly Programming Question
export interface BlocklyProgrammingQuestion extends BaseQuestion {
  questionType: 'blockly_programming';
  toolboxDefinition: string;
  initialWorkspace?: string;
  solutionWorkspaceXML?: string;
}

// 12. Scratch Programming Question
export interface ScratchProgrammingQuestion extends BaseQuestion {
  questionType: 'scratch_programming';
  toolboxDefinition: string;
  initialWorkspace?: string;
  solutionWorkspaceXML?: string;
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
  | BlocklyProgrammingQuestion
  | ScratchProgrammingQuestion;

// Structure for the entire quiz
export interface QuizConfig {
  id:string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  settings?: QuizSettings;
}

export interface SCORMSettings {
  version: "1.2" | "2004";
  setCompletionOnFinish?: boolean; 
  setSuccessOnPass?: boolean;     
  autoCommit?: boolean;           

  studentNameVar?: string;        
  lessonStatusVar?: string;       
  scoreRawVar?: string;
  scoreMaxVar?: string;
  scoreMinVar?: string;
  sessionTimeVar?: string;        
  exitVar?: string;               
  suspendDataVar?: string;        

  lessonStatusVar_1_2?: string;   
  scoreRawVar_1_2?: string;       
  scoreMaxVar_1_2?: string;       
  scoreMinVar_1_2?: string;       

  completionStatusVar_2004?: string; 
  successStatusVar_2004?: string;    
  scoreScaledVar_2004?: string;      
  scoreRawVar_2004?: string;       
  scoreMaxVar_2004?: string;       
  scoreMinVar_2004?: string;       
}


export interface QuizSettings {
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean; 
  timeLimitMinutes?: number;
  showCorrectAnswers?: 'immediately' | 'end_of_quiz' | 'never';
  passingScorePercent?: number;
  webhookUrl?: string; 
  scorm?: SCORMSettings; 
}

export type UserAnswers = Map<string, UserAnswerType>;

export type UserAnswerType =
  | string 
  | string[] 
  | Record<string, string> 
  | null; 


export interface PerformanceMetric {
  totalQuestions: number;
  correctQuestions: number;
  pointsEarned: number;
  maxPoints: number;
  percentage: number; // Made required
}

export interface PerformanceByLearningObjective extends PerformanceMetric {
  learningObjective: string;
}
export interface PerformanceByCategory extends PerformanceMetric {
  category: string;
}
export interface PerformanceByTopic extends PerformanceMetric {
  topic: string;
}
export interface PerformanceByDifficulty extends PerformanceMetric {
  difficulty: string; 
}
export interface PerformanceByBloomLevel extends PerformanceMetric {
  bloomLevel: string;
}


export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  answers: UserAnswers;
  passed?: boolean; 
  questionResults: Array<{
    questionId: string;
    isCorrect: boolean;
    pointsEarned: number;
    userAnswer: UserAnswerType;
    correctAnswer: any; 
    timeSpentSeconds?: number; 
  }>;
  webhookStatus?: 'idle' | 'sending' | 'success' | 'error';
  webhookError?: string;
  scormStatus?: 'idle' | 'no_api' | 'initializing' | 'initialized' | 'sending_data' | 'committed' | 'terminated' | 'error';
  scormError?: string;
  studentName?: string; 
  totalTimeSpentSeconds?: number; 
  averageTimePerQuestionSeconds?: number; 

  performanceByLearningObjective?: PerformanceByLearningObjective[];
  performanceByCategory?: PerformanceByCategory[];
  performanceByTopic?: PerformanceByTopic[];
  performanceByDifficulty?: PerformanceByDifficulty[];
  performanceByBloomLevel?: PerformanceByBloomLevel[];
}

export interface QuizEngineCallbacks {
  onQuizStart?: (initialData: {
    initialQuestion: QuizQuestion | null;
    currentQuestionNumber: number;
    totalQuestions: number;
    timeLimitInSeconds: number | null;
    scormStatus?: QuizResult['scormStatus']; 
    studentName?: string; 
  }) => void;
  onQuestionChange?: (question: QuizQuestion | null, currentQuestionNumber: number, totalQuestions: number) => void;
  onAnswerSubmit?: (question: QuizQuestion, userAnswer: UserAnswerType) => void; 
  onQuizFinish?: (results: QuizResult) => void;
  onTimeTick?: (timeLeftInSeconds: number) => void;
  onQuizTimeUp?: () => void;
}

export interface QuizEngineConstructorOptions {
  config: QuizConfig;
  callbacks?: QuizEngineCallbacks;
}

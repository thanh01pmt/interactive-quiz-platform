
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'; // Added afterEach
import { QuizEngine } from './QuizEngine';
import type { QuizConfig, QuizQuestion, UserAnswerType, QuizEngineCallbacks, MultipleChoiceQuestion } from '../types';

const basicMCQ: MultipleChoiceQuestion = {
  id: 'q1',
  questionType: 'multiple_choice',
  prompt: 'What is 2+2?',
  points: 10,
  options: [
    { id: 'q1opt1', text: '3' },
    { id: 'q1opt2', text: '4' },
    { id: 'q1opt3', text: '5' },
  ],
  correctAnswerId: 'q1opt2',
};

const sampleQuizConfig: QuizConfig = {
  id: 'test-quiz',
  title: 'Test Quiz',
  questions: [
    basicMCQ,
    {
      id: 'q2',
      questionType: 'true_false',
      prompt: 'Is the sky blue?',
      points: 5,
      correctAnswer: true,
    },
  ],
  settings: {
    shuffleQuestions: false,
    timeLimitMinutes: 1,
  },
};

describe('QuizEngine', () => {
  let quizConfig: QuizConfig;
  let callbacks: QuizEngineCallbacks;

  beforeEach(() => {
    // Deep clone to prevent tests from interfering with each other
    quizConfig = JSON.parse(JSON.stringify(sampleQuizConfig));
    callbacks = {
      onQuizStart: vi.fn(),
      onQuestionChange: vi.fn(),
      onAnswerSubmit: vi.fn(),
      onQuizFinish: vi.fn(),
      onTimeTick: vi.fn(),
      onQuizTimeUp: vi.fn(),
    };
  });

  afterEach(() => { // Added afterEach
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with the provided config', () => {
      const engine = new QuizEngine({ config: quizConfig, callbacks });
      expect(engine.getTotalQuestions()).toBe(quizConfig.questions.length);
      expect(engine.getCurrentQuestionNumber()).toBe(1);
      expect(engine.getCurrentQuestion()?.id).toBe(quizConfig.questions[0].id);
    });

    it('should fire onQuizStart callback upon initialization', () => {
      new QuizEngine({ config: quizConfig, callbacks });
      expect(callbacks.onQuizStart).toHaveBeenCalledTimes(1);
      expect(callbacks.onQuizStart).toHaveBeenCalledWith(
        expect.objectContaining({
          initialQuestion: quizConfig.questions[0],
          currentQuestionNumber: 1,
          totalQuestions: quizConfig.questions.length,
          timeLimitInSeconds: quizConfig.settings?.timeLimitMinutes ? quizConfig.settings.timeLimitMinutes * 60 : null,
        })
      );
    });
    
    it('should fire onQuestionChange for the first question upon initialization', () => {
      new QuizEngine({ config: quizConfig, callbacks });
      expect(callbacks.onQuestionChange).toHaveBeenCalledTimes(1);
      expect(callbacks.onQuestionChange).toHaveBeenCalledWith(
        quizConfig.questions[0],
        1,
        quizConfig.questions.length
      );
    });

    it('should shuffle questions if shuffleQuestions setting is true', () => {
      const configWithShuffle: QuizConfig = {
        ...quizConfig,
        questions: [
          { ...basicMCQ, id: 'q1_shuffle' },
          { id: 'q2_shuffle', questionType: 'true_false', prompt: 'Q2 shuffle', correctAnswer: true, points: 5 },
          { id: 'q3_shuffle', questionType: 'true_false', prompt: 'Q3 shuffle', correctAnswer: false, points: 5 },
        ],
        settings: { ...quizConfig.settings, shuffleQuestions: true },
      };
      // Run multiple times to increase chance of detecting non-shuffling
      const originalOrder = configWithShuffle.questions.map(q => q.id);
      let isShuffledAtLeastOnce = false;
      for (let i = 0; i < 10; i++) {
        const engine = new QuizEngine({ config: configWithShuffle });
        const newOrder = engine.questions.map(q => q.id);
        if (JSON.stringify(originalOrder) !== JSON.stringify(newOrder)) {
          isShuffledAtLeastOnce = true;
          break;
        }
      }
      expect(isShuffledAtLeastOnce).toBe(true);
    });

    it('should initialize timer if timeLimitMinutes is set', () => {
      const engine = new QuizEngine({ config: quizConfig, callbacks });
      expect(engine.getTimeLeftInSeconds()).toBe(60);
    });
    
    it('should not initialize timer if timeLimitMinutes is not set or zero', () => {
      const noTimeLimitConfig: QuizConfig = { ...quizConfig, settings: { ...quizConfig.settings, timeLimitMinutes: 0 }};
      const engine = new QuizEngine({ config: noTimeLimitConfig, callbacks });
      expect(engine.getTimeLeftInSeconds()).toBeNull();
    });
  });

  describe('Navigation', () => {
    let engine: QuizEngine;
    beforeEach(() => {
      engine = new QuizEngine({ config: quizConfig, callbacks });
       // Reset mocks for navigation specific tests as constructor already calls some
      vi.clearAllMocks();
    });

    it('nextQuestion() should move to the next question and fire onQuestionChange', () => {
      const nextQ = engine.nextQuestion();
      expect(nextQ?.id).toBe(quizConfig.questions[1].id);
      expect(engine.getCurrentQuestionNumber()).toBe(2);
      expect(callbacks.onQuestionChange).toHaveBeenCalledTimes(1);
      expect(callbacks.onQuestionChange).toHaveBeenCalledWith(
        quizConfig.questions[1],
        2,
        quizConfig.questions.length
      );
    });

    it('nextQuestion() should return null at the end of the quiz', () => {
      engine.goToQuestion(quizConfig.questions.length - 1); // Go to last question
      vi.clearAllMocks(); // Clear mocks before the action we are testing
      const atEnd = engine.nextQuestion();
      expect(atEnd).toBeNull();
      expect(engine.getCurrentQuestionNumber()).toBe(quizConfig.questions.length); // Stays at last
      expect(callbacks.onQuestionChange).not.toHaveBeenCalled(); // No change if already at end
    });

    it('previousQuestion() should move to the previous question and fire onQuestionChange', () => {
      engine.goToQuestion(1); // Go to the second question
      vi.clearAllMocks();
      const prevQ = engine.previousQuestion();
      expect(prevQ?.id).toBe(quizConfig.questions[0].id);
      expect(engine.getCurrentQuestionNumber()).toBe(1);
      expect(callbacks.onQuestionChange).toHaveBeenCalledTimes(1);
      expect(callbacks.onQuestionChange).toHaveBeenCalledWith(
        quizConfig.questions[0],
        1,
        quizConfig.questions.length
      );
    });

    it('previousQuestion() should return null at the beginning of the quiz', () => {
      const atStart = engine.previousQuestion(); // Already at first question
      expect(atStart).toBeNull();
      expect(engine.getCurrentQuestionNumber()).toBe(1); // Stays at first
      expect(callbacks.onQuestionChange).not.toHaveBeenCalled();
    });
    
    it('goToQuestion() should navigate to specified index and fire onQuestionChange', () => {
      const targetIndex = 1;
      engine.goToQuestion(targetIndex);
      expect(engine.getCurrentQuestion()?.id).toBe(quizConfig.questions[targetIndex].id);
      expect(engine.getCurrentQuestionNumber()).toBe(targetIndex + 1);
      expect(callbacks.onQuestionChange).toHaveBeenCalledWith(
        quizConfig.questions[targetIndex],
        targetIndex + 1,
        quizConfig.questions.length
      );
    });

    it('goToQuestion() should handle out-of-bounds index gracefully', () => {
      const initialQuestionId = engine.getCurrentQuestion()?.id;
      engine.goToQuestion(quizConfig.questions.length + 5); // Out of bounds high
      expect(engine.getCurrentQuestion()?.id).toBe(initialQuestionId); // Should not change
      engine.goToQuestion(-1); // Out of bounds low
      expect(engine.getCurrentQuestion()?.id).toBe(initialQuestionId); // Should not change
      expect(callbacks.onQuestionChange).not.toHaveBeenCalled();
    });
    
     it('goToQuestion() should not fire onQuestionChange if navigating to the current index', () => {
      engine.goToQuestion(0); // Already at index 0
      expect(callbacks.onQuestionChange).not.toHaveBeenCalled();
    });
  });

  describe('Answer Submission', () => {
    let engine: QuizEngine;
    beforeEach(() => {
      engine = new QuizEngine({ config: quizConfig, callbacks });
    });

    it('submitAnswer() should store the answer and fire onAnswerSubmit', () => {
      const questionId = quizConfig.questions[0].id;
      const answer: UserAnswerType = 'q1opt2';
      engine.submitAnswer(questionId, answer);
      expect(engine.getUserAnswer(questionId)).toBe(answer);
      expect(callbacks.onAnswerSubmit).toHaveBeenCalledTimes(1);
      expect(callbacks.onAnswerSubmit).toHaveBeenCalledWith(quizConfig.questions[0], answer);
    });
    
    it('getUserAnswer() should return undefined for a non-existent or unanswered question', () => {
      expect(engine.getUserAnswer('non_existent_id')).toBeUndefined();
      expect(engine.getUserAnswer(quizConfig.questions[1].id)).toBeUndefined(); // q2 is not answered yet
    });
  });
  
  describe('Timer Logic', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => { // Added afterEach
      vi.useRealTimers(); // Or vi.restoreAllMocks(); if more mocks are involved
    });

    it('should decrement timeLeftInSeconds and fire onTimeTick every second', () => {
      new QuizEngine({ config: quizConfig, callbacks }); // Timer starts in constructor
      
      vi.advanceTimersByTime(1000);
      expect(callbacks.onTimeTick).toHaveBeenCalledTimes(1);
      expect(callbacks.onTimeTick).toHaveBeenLastCalledWith(59);
      
      vi.advanceTimersByTime(3000); // Advance 3 more seconds
      expect(callbacks.onTimeTick).toHaveBeenCalledTimes(4); // 1 (initial) + 3 (advanced)
      expect(callbacks.onTimeTick).toHaveBeenLastCalledWith(56);
    });

    it('should fire onQuizTimeUp when time runs out and stop the timer', () => {
      const engine = new QuizEngine({ config: quizConfig, callbacks });
      const timeLimitSeconds = quizConfig.settings!.timeLimitMinutes! * 60;
      
      vi.advanceTimersByTime(timeLimitSeconds * 1000);
      
      expect(callbacks.onQuizTimeUp).toHaveBeenCalledTimes(1);
      expect(engine.getTimeLeftInSeconds()).toBe(0); // Time should be 0

      // Check if timer is stopped (onTimeTick should not be called anymore)
      vi.clearAllMocks(); // Clear previous onTimeTick calls
      vi.advanceTimersByTime(5000); // Advance more time
      expect(callbacks.onTimeTick).not.toHaveBeenCalled();
    });

    it('destroy() should stop the timer', () => {
      const engine = new QuizEngine({ config: quizConfig, callbacks });
      engine.destroy();
      vi.advanceTimersByTime(5000);
      expect(callbacks.onTimeTick).not.toHaveBeenCalled();
    });
  });
  
  // Basic calculateResults test - more detailed tests per question type would be added
  describe('Basic Scoring & Results', () => {
    let engine: QuizEngine;
    
    beforeEach(() => {
      // Mock Date.now() for consistent time tracking tests
      // Each question takes 5 seconds
      let callCount = 0;
      const mockQuestionDurationMs = 5000; 
      // Initial overallStartTime, then questionStartTime for q1, then questionStartTime for q2 after navigation
      const nowValues = [
        1700000000000, // overallStartTime (constructor)
        1700000000000, // questionStartTime for q1 (constructor)
        1700000000000 + mockQuestionDurationMs, // for recording q1 time, then new questionStartTime for q2
        1700000000000 + (mockQuestionDurationMs * 2), // for recording q2 time
        1700000000000 + (mockQuestionDurationMs * 3), // if more questions
      ];

      vi.spyOn(Date, 'now').mockImplementation(() => {
        const val = nowValues[callCount] || (nowValues[nowValues.length-1] + (callCount - nowValues.length + 1) * mockQuestionDurationMs) ;
        callCount++;
        return val;
      });

      engine = new QuizEngine({ config: quizConfig, callbacks });
      vi.clearAllMocks(); // Clear init calls to callbacks
    });
    
    afterEach(() => { // Added afterEach
      vi.restoreAllMocks(); // This will restore Date.now spy as well
    });

    it('calculateResults() should correctly score a submitted answer and fire onQuizFinish', async () => {
      engine.submitAnswer('q1', 'q1opt2'); // Correct answer for basicMCQ (q1)
      engine.nextQuestion(); // To trigger time recording for q1
      engine.submitAnswer('q2', 'true');   // Correct answer for q2
      
      const results = await engine.calculateResults();
      
      expect(results.score).toBe(15); // 10 for q1 + 5 for q2
      expect(results.maxScore).toBe(15);
      expect(results.percentage).toBe(100);
      expect(results.passed).toBe(quizConfig.settings?.passingScorePercent ? (100 >= quizConfig.settings.passingScorePercent) : undefined);
      expect(results.questionResults.length).toBe(2);
      
      const q1Result = results.questionResults.find(qr => qr.questionId === 'q1');
      expect(q1Result?.isCorrect).toBe(true);
      expect(q1Result?.pointsEarned).toBe(10);
      expect(q1Result?.timeSpentSeconds).toBe(5); // Based on mocked Date.now

      const q2Result = results.questionResults.find(qr => qr.questionId === 'q2');
      expect(q2Result?.isCorrect).toBe(true);
      expect(q2Result?.pointsEarned).toBe(5);
      expect(q2Result?.timeSpentSeconds).toBe(5); // Based on mocked Date.now

      expect(results.totalTimeSpentSeconds).toBe(10);
      expect(results.averageTimePerQuestionSeconds).toBe(5);

      expect(callbacks.onQuizFinish).toHaveBeenCalledTimes(1);
      expect(callbacks.onQuizFinish).toHaveBeenCalledWith(results);
    });

    it('calculateResults() should handle unanswered questions', async () => {
      engine.submitAnswer('q1', 'q1opt1'); // Incorrect for q1
      // q2 is not answered
      engine.nextQuestion(); // To trigger time recording for q1
      // No answer submitted for q2

      const results = await engine.calculateResults();
      
      expect(results.score).toBe(0);
      expect(results.maxScore).toBe(15);
      expect(results.percentage).toBe(0);
      
      const q1Result = results.questionResults.find(qr => qr.questionId === 'q1');
      expect(q1Result?.isCorrect).toBe(false);
      expect(q1Result?.pointsEarned).toBe(0);
      expect(q1Result?.timeSpentSeconds).toBe(5);


      const q2Result = results.questionResults.find(qr => qr.questionId === 'q2');
      expect(q2Result?.isCorrect).toBe(false); // Unanswered is incorrect
      expect(q2Result?.userAnswer).toBeNull();
      expect(q2Result?.pointsEarned).toBe(0);
      expect(q2Result?.timeSpentSeconds).toBe(5); // Time spent even if not answered

      expect(results.totalTimeSpentSeconds).toBe(10);
      expect(results.averageTimePerQuestionSeconds).toBe(5);
      
      expect(callbacks.onQuizFinish).toHaveBeenCalledWith(results);
    });
  });
  
  // Placeholder for destroy tests
  describe('Destroy', () => {
    it('destroy() should perform cleanup (e.g., stop timer)', () => {
      const engine = new QuizEngine({ config: quizConfig, callbacks });
      vi.spyOn(engine as any, 'stopTimer'); // Spy on private method
      engine.destroy();
      expect((engine as any).stopTimer).toHaveBeenCalled();
      // Further assertions for SCORM termination etc. would go here
    });
  });
});

import {
  QuizConfig, QuizQuestion, UserAnswers, UserAnswerType, QuizResult,
  MultipleChoiceQuestion, MultipleResponseQuestion, FillInTheBlanksQuestion,
  DragAndDropQuestion, TrueFalseQuestion, ShortAnswerQuestion, NumericQuestion,
  SequenceQuestion, MatchingQuestion, HotspotQuestion, HotspotArea,
  BlocklyProgrammingQuestion, ScratchProgrammingQuestion,
  QuizEngineConstructorOptions, QuizEngineCallbacks // Added new imports
} from '../types';

export class QuizEngine {
  private config: QuizConfig;
  private userAnswers: UserAnswers = new Map();
  private currentQuestionIndex: number = 0;
  private startTime: number | null = null;
  public questions: QuizQuestion[];
  private callbacks: QuizEngineCallbacks;
  private timerId: number | null = null;
  private timeLeftInSeconds: number | null = null;

  constructor(options: QuizEngineConstructorOptions) {
    this.config = options.config;
    this.callbacks = options.callbacks || {};
    
    this.questions = this.config.settings?.shuffleQuestions
      ? [...this.config.questions].sort(() => Math.random() - 0.5)
      : this.config.questions;
      
    this.startTime = Date.now();

    if (this.config.settings?.timeLimitMinutes && this.config.settings.timeLimitMinutes > 0) {
      this.timeLeftInSeconds = this.config.settings.timeLimitMinutes * 60;
      this.startTimer();
    }

    if (this.callbacks.onQuizStart) {
        this.callbacks.onQuizStart({
            initialQuestion: this.getCurrentQuestion(),
            currentQuestionNumber: this.getCurrentQuestionNumber(),
            totalQuestions: this.getTotalQuestions(),
            timeLimitInSeconds: this.timeLeftInSeconds
        });
    }
    // Initial question change event
    this.callbacks.onQuestionChange?.(this.getCurrentQuestion(), this.getCurrentQuestionNumber(), this.getTotalQuestions());
  }

  private startTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    this.timerId = setInterval(() => this.handleTick(), 1000) as unknown as number;
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private handleTick(): void {
    if (this.timeLeftInSeconds === null) return;

    if (this.timeLeftInSeconds > 0) {
      this.timeLeftInSeconds--;
      this.callbacks.onTimeTick?.(this.timeLeftInSeconds);
    }
    
    if (this.timeLeftInSeconds <= 0) {
      this.stopTimer();
      this.callbacks.onQuizTimeUp?.();
      // QuizPlayer will call calculateResults via onQuizTimeUp -> handleFinishQuiz
    }
  }
  
  public getTimeLeftInSeconds(): number | null {
    return this.timeLeftInSeconds;
  }

  public getCurrentQuestion(): QuizQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  public getCurrentQuestionNumber(): number {
    return this.currentQuestionIndex + 1;
  }

  public getTotalQuestions(): number {
    return this.questions.length;
  }

  public submitAnswer(questionId: string, answer: UserAnswerType): void {
    this.userAnswers.set(questionId, answer);
    const question = this.questions.find(q => q.id === questionId);
    if (question) {
      this.callbacks.onAnswerSubmit?.(question, answer);
    } else {
      console.warn(`QuizEngine: Question with id ${questionId} not found when trying to fire onAnswerSubmit callback.`);
    }
  }

  public getUserAnswer(questionId: string): UserAnswerType | undefined {
    return this.userAnswers.get(questionId);
  }

  public nextQuestion(): QuizQuestion | null {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      const currentQ = this.getCurrentQuestion();
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return null; // End of quiz
  }

  public previousQuestion(): QuizQuestion | null {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      const currentQ = this.getCurrentQuestion();
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return null; // At the first question
  }
  
  public goToQuestion(index: number): QuizQuestion | null {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
      const currentQ = this.getCurrentQuestion();
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return null;
  }

  public isQuizFinished(): boolean {
    // This now means all questions *visited* or last question *answered*, finish button will appear.
    // Time up also finishes the quiz.
    return this.currentQuestionIndex >= this.questions.length -1;
  }

  public calculateResults(): QuizResult {
    this.stopTimer(); // Ensure timer is stopped when results are calculated
    let totalScore = 0;
    let maxScore = 0;
    const questionResults: QuizResult['questionResults'] = [];

    for (const question of this.questions) {
      const userAnswer = this.userAnswers.get(question.id) || null;
      const points = question.points || 0;
      maxScore += points;
      const { isCorrect, correctAnswer, pointsEarned } = this.evaluateQuestion(question, userAnswer);
      
      if (isCorrect) {
        totalScore += pointsEarned;
      }
      questionResults.push({
        questionId: question.id,
        isCorrect,
        pointsEarned,
        userAnswer,
        correctAnswer,
      });
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    let passed = undefined;
    if (this.config.settings?.passingScorePercent !== undefined) {
      passed = percentage >= this.config.settings.passingScorePercent;
    }
    
    const results: QuizResult = {
      score: totalScore,
      maxScore,
      percentage,
      answers: this.userAnswers,
      questionResults,
      passed,
    };
    this.callbacks.onQuizFinish?.(results);
    return results;
  }

  private isPointInHotspot(px: number, py: number, hotspot: HotspotArea): boolean {
    const [coord1, coord2, coord3, coord4] = hotspot.coords;
    if (hotspot.shape === 'rect') {
      const x = coord1;
      const y = coord2;
      const w = coord3;
      const h = coord4;
      return px >= x && px <= x + w && py >= y && py <= y + h;
    } else if (hotspot.shape === 'circle') {
      const cx = coord1;
      const cy = coord2;
      const r = coord3;
      const distSq = (px - cx) ** 2 + (py - cy) ** 2;
      return distSq <= r ** 2;
    }
    return false;
  }


  private evaluateQuestion(question: QuizQuestion, answer: UserAnswerType): {isCorrect: boolean, correctAnswer: any, pointsEarned: number} {
    let isCorrect = false;
    let correctAnswer: any = null;
    const points = question.points || 0;

    switch (question.questionType) {
      case 'multiple_choice':
        correctAnswer = (question as MultipleChoiceQuestion).correctAnswerId;
        isCorrect = answer === correctAnswer;
        break;
      case 'multiple_response':
        const mrq = question as MultipleResponseQuestion;
        correctAnswer = mrq.correctAnswerIds;
        if (Array.isArray(answer) && Array.isArray(correctAnswer)) {
          const userAnswerSet = new Set(answer as string[]);
          const correctAnswerSet = new Set(correctAnswer);
          isCorrect = userAnswerSet.size === correctAnswerSet.size &&
                      [...userAnswerSet].every(id => correctAnswerSet.has(id));
        }
        break;
      case 'fill_in_the_blanks':
        const fitbq = question as FillInTheBlanksQuestion;
        correctAnswer = {};
        fitbq.answers.forEach(ans => {
          (correctAnswer as Record<string, string[]>)[ans.blankId] = ans.acceptedValues;
        });
        if (typeof answer === 'object' && answer !== null) {
          const userAnswerMap = answer as Record<string, string>;
          isCorrect = fitbq.answers.every(correctAns => {
            const userVal = userAnswerMap[correctAns.blankId]?.trim();
            const acceptedVals = correctAns.acceptedValues.map(v => v.trim());
            if (fitbq.isCaseSensitive) {
                 return acceptedVals.some(accVal => accVal === userVal);
            }
            return acceptedVals.some(accVal => accVal.toLowerCase() === userVal?.toLowerCase());
          });
        }
        break;
      case 'drag_and_drop':
        const dndq = question as DragAndDropQuestion;
        correctAnswer = {};
        dndq.answerMap.forEach(map => {
          (correctAnswer as Record<string, string>)[map.draggableId] = map.dropZoneId;
        });
        if (typeof answer === 'object' && answer !== null) {
          const userAnswerMap = answer as Record<string, string>;
          const correctPairs = dndq.answerMap.length;
          let userCorrectPairs = 0;
          dndq.answerMap.forEach(map => {
            if (userAnswerMap[map.draggableId] === map.dropZoneId) {
              userCorrectPairs++;
            }
          });
          isCorrect = userCorrectPairs === correctPairs && Object.keys(userAnswerMap).length === correctPairs;
        }
        break;
      case 'true_false':
        const tfq = question as TrueFalseQuestion;
        correctAnswer = tfq.correctAnswer;
        isCorrect = (answer === 'true' && tfq.correctAnswer === true) || (answer === 'false' && tfq.correctAnswer === false);
        break;
      case 'short_answer':
        const saq = question as ShortAnswerQuestion;
        correctAnswer = saq.acceptedAnswers;
        if (typeof answer === 'string') {
          const userAnswerTrimmed = answer.trim();
          isCorrect = saq.acceptedAnswers.some(accAns => 
            saq.isCaseSensitive ? accAns.trim() === userAnswerTrimmed : accAns.trim().toLowerCase() === userAnswerTrimmed.toLowerCase()
          );
        }
        break;
      case 'numeric':
        const nq = question as NumericQuestion;
        correctAnswer = { answer: nq.answer, tolerance: nq.tolerance };
        if (typeof answer === 'string') {
          const userAnswerNum = parseFloat(answer);
          if (!isNaN(userAnswerNum)) {
            if (nq.tolerance !== undefined && nq.tolerance !== null) {
              isCorrect = Math.abs(userAnswerNum - nq.answer) <= nq.tolerance;
            } else {
              isCorrect = userAnswerNum === nq.answer;
            }
          }
        }
        break;
      case 'sequence':
        const seqQ = question as SequenceQuestion;
        correctAnswer = seqQ.correctOrder;
        if (Array.isArray(answer) && Array.isArray(seqQ.correctOrder) && answer.length === seqQ.correctOrder.length) {
          isCorrect = answer.every((itemId, index) => itemId === seqQ.correctOrder[index]);
        }
        break;
      case 'matching':
        const matQ = question as MatchingQuestion;
        correctAnswer = matQ.correctAnswerMap.reduce((acc, curr) => {
          acc[curr.promptId] = curr.optionId;
          return acc;
        }, {} as Record<string, string>);

        if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
          const userAnswerMap = answer as Record<string, string>;
          let correctMatches = 0;
          matQ.correctAnswerMap.forEach(map => {
            if (userAnswerMap[map.promptId] === map.optionId) {
              correctMatches++;
            }
          });
          isCorrect = correctMatches === matQ.correctAnswerMap.length && 
                      Object.keys(userAnswerMap).length === matQ.correctAnswerMap.length;
        }
        break;
      case 'hotspot':
        const hsQ = question as HotspotQuestion;
        correctAnswer = hsQ.correctHotspotIds; 
        if (typeof answer === 'string') { 
            isCorrect = hsQ.correctHotspotIds.includes(answer);
        }
        break;
      case 'blockly_programming': 
        const bpQ = question as BlocklyProgrammingQuestion; 
        correctAnswer = bpQ.solutionWorkspaceXML || null;
        if (typeof answer === 'string' && bpQ.solutionWorkspaceXML) {
            isCorrect = answer === bpQ.solutionWorkspaceXML;
        } else if (!bpQ.solutionWorkspaceXML) {
            isCorrect = false; 
            // console.warn(`Blockly programming question "${bpQ.id}" has no solutionWorkspaceXML defined for automatic grading.`);
        }
        break;
      case 'scratch_programming': 
        const spQ = question as ScratchProgrammingQuestion;
        correctAnswer = spQ.solutionWorkspaceXML || null;
        if (typeof answer === 'string' && spQ.solutionWorkspaceXML) {
            isCorrect = answer === spQ.solutionWorkspaceXML;
        } else if (!spQ.solutionWorkspaceXML) {
            isCorrect = false;
            // console.warn(`Scratch programming question "${spQ.id}" has no solutionWorkspaceXML defined for automatic grading.`);
        }
        break;
      default:
        const _exhaustiveCheck: never = question;
        console.warn("Unsupported question type in QuizEngine:", _exhaustiveCheck);
        isCorrect = false;
    }
    return { isCorrect, correctAnswer, pointsEarned: isCorrect ? points : 0 };
  }

  public getElapsedTime(): number {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  public destroy(): void {
    this.stopTimer();
    // Any other cleanup needed
    console.log("QuizEngine destroyed");
  }
}
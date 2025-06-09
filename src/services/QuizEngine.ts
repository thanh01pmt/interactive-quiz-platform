
import {
  QuizConfig, QuizQuestion, UserAnswers, UserAnswerType, QuizResult,
  MultipleChoiceQuestion, MultipleResponseQuestion, FillInTheBlanksQuestion,
  DragAndDropQuestion, TrueFalseQuestion, ShortAnswerQuestion, NumericQuestion,
  SequenceQuestion, MatchingQuestion, HotspotQuestion, HotspotArea,
  BlocklyProgrammingQuestion, ScratchProgrammingQuestion,
  QuizEngineConstructorOptions, QuizEngineCallbacks,
  PerformanceByLearningObjective, PerformanceByCategory, PerformanceByTopic,
  PerformanceByDifficulty, PerformanceByBloomLevel,
  PerformanceMetric 
} from '../types';
import { SCORMService } from './SCORMService'; 

interface AggregatedPerformanceData {
  totalQuestions: number;
  correctQuestions: number;
  pointsEarned: number;
  maxPoints: number;
}

export class QuizEngine {
  private config: QuizConfig;
  private userAnswers: UserAnswers = new Map();
  private currentQuestionIndex: number = 0;
  public questions: QuizQuestion[];
  private callbacks: QuizEngineCallbacks;
  private timerId: number | null = null;
  private timeLeftInSeconds: number | null = null;
  private scormService: SCORMService | null = null;
  private quizResultState: Partial<QuizResult> = { scormStatus: 'idle' };

  private overallStartTime: number;
  private questionStartTime: number | null = null;
  private questionTimings: Map<string, number> = new Map();


  constructor(options: QuizEngineConstructorOptions) {
    this.config = options.config;
    this.callbacks = options.callbacks || {};

    this.questions = this.config.settings?.shuffleQuestions
      ? [...this.config.questions].sort(() => Math.random() - 0.5)
      : this.config.questions;

    this.overallStartTime = Date.now(); 

    if (this.config.settings?.timeLimitMinutes && this.config.settings.timeLimitMinutes > 0) {
      this.timeLeftInSeconds = this.config.settings.timeLimitMinutes * 60;
      this.startTimer();
    }

    if (this.config.settings?.scorm) {
      this.quizResultState.scormStatus = 'initializing';
      this.scormService = new SCORMService(this.config.settings.scorm);
      if (this.scormService.hasAPI()) {
        const initResult = this.scormService.initialize();
        if (initResult.success) {
          this.quizResultState.scormStatus = 'initialized';
          this.quizResultState.studentName = initResult.studentName;
        } else {
          this.quizResultState.scormStatus = 'error';
          this.quizResultState.scormError = initResult.error || "SCORM initialization failed.";
        }
      } else {
        this.quizResultState.scormStatus = 'no_api';
      }
    }

    const initialQ = this.getCurrentQuestion();
    if (initialQ) {
        this.questionStartTime = Date.now(); 
    }

    if (this.callbacks.onQuizStart) {
        this.callbacks.onQuizStart({
            initialQuestion: initialQ,
            currentQuestionNumber: this.getCurrentQuestionNumber(),
            totalQuestions: this.getTotalQuestions(),
            timeLimitInSeconds: this.timeLeftInSeconds,
            scormStatus: this.quizResultState.scormStatus,
            studentName: this.quizResultState.studentName,
        });
    }
    this.callbacks.onQuestionChange?.(initialQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
  }

  private _recordCurrentQuestionTime(): void {
    if (this.questionStartTime && this.currentQuestionIndex >= 0 && this.currentQuestionIndex < this.questions.length) {
      const currentQId = this.questions[this.currentQuestionIndex].id;
      const elapsedMs = Date.now() - this.questionStartTime;
      const currentTotalTime = this.questionTimings.get(currentQId) || 0;
      this.questionTimings.set(currentQId, currentTotalTime + (elapsedMs / 1000));
    }
    this.questionStartTime = null; 
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
    this._recordCurrentQuestionTime();
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
      const currentQ = this.getCurrentQuestion();
      this.questionStartTime = Date.now(); 
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return null;
  }

  public previousQuestion(): QuizQuestion | null {
    this._recordCurrentQuestionTime();
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      const currentQ = this.getCurrentQuestion();
      this.questionStartTime = Date.now(); 
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return null;
  }

  public goToQuestion(index: number): QuizQuestion | null {
    if (index >= 0 && index < this.questions.length && index !== this.currentQuestionIndex) {
      this._recordCurrentQuestionTime();
      this.currentQuestionIndex = index;
      const currentQ = this.getCurrentQuestion();
      this.questionStartTime = Date.now(); 
      this.callbacks.onQuestionChange?.(currentQ, this.getCurrentQuestionNumber(), this.getTotalQuestions());
      return currentQ;
    }
    return this.getCurrentQuestion(); 
  }

  public isQuizFinished(): boolean {
    return this.currentQuestionIndex >= this.questions.length -1;
  }

  private async _sendResultsToWebhook(results: QuizResult): Promise<void> {
    if (!this.config.settings?.webhookUrl) {
      results.webhookStatus = 'idle';
      return;
    }

    results.webhookStatus = 'sending';

    try {
      const response = await fetch(this.config.settings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(results),
      });

      if (response.ok) {
        results.webhookStatus = 'success';
      } else {
        results.webhookStatus = 'error';
        results.webhookError = `Webhook returned status: ${response.status} ${response.statusText}`;
        try { const errorBody = await response.text(); results.webhookError += ` - Body: ${errorBody.substring(0, 200)}`; } catch (e) { /* ignore */ }
      }
    } catch (error) {
      results.webhookStatus = 'error';
      results.webhookError = error instanceof Error ? `Fetch error: ${error.message}` : 'Unknown webhook error.';
    }
  }

  private _sendResultsToSCORM(results: QuizResult): void {
    if (!this.scormService || !this.scormService.hasAPI() || this.quizResultState.scormStatus === 'no_api') {
      results.scormStatus = this.quizResultState.scormStatus || 'idle';
      return;
    }
    if (this.quizResultState.scormStatus === 'error' && this.quizResultState.scormError?.includes("Initialization failed")) {
        results.scormStatus = 'error';
        results.scormError = this.quizResultState.scormError;
        return;
    }

    results.scormStatus = 'sending_data';

    try {
      this.scormService.setScore(results.score, results.maxScore, 0);
      let lessonStatus: 'passed' | 'failed' | 'completed' | 'incomplete' = 'completed';
      if (this.config.settings?.passingScorePercent !== undefined) {
          lessonStatus = results.passed ? 'passed' : 'failed';
      }
      this.scormService.setLessonStatus(lessonStatus, results.passed);

      if (results.totalTimeSpentSeconds !== undefined && this.scormService.formatCMITime) {
        const cmiTime = this.scormService.formatCMITime(results.totalTimeSpentSeconds);
        const sessionTimeVar = this.config.settings?.scorm?.sessionTimeVar ||
                               (this.scormService.getSCORMVersion() === "2004" ? "cmi.session_time" : "cmi.core.session_time");
        if(sessionTimeVar) this.scormService.setValue(sessionTimeVar, cmiTime);
      }

      const commitResult = this.scormService.commit();
      if (commitResult.success) {
        results.scormStatus = 'committed';
      } else {
        results.scormStatus = 'error';
        results.scormError = commitResult.error || "SCORM commit failed.";
      }
    } catch (e) {
        results.scormStatus = 'error';
        results.scormError = e instanceof Error ? e.message : "Unknown SCORM data sending error.";
    }
  }

  private _calculateMetadataPerformance() {
    const loPerformanceMap = new Map<string, AggregatedPerformanceData>();
    const categoryPerformanceMap = new Map<string, AggregatedPerformanceData>();
    const topicPerformanceMap = new Map<string, AggregatedPerformanceData>();
    const difficultyPerformanceMap = new Map<string, AggregatedPerformanceData>();
    const bloomLevelPerformanceMap = new Map<string, AggregatedPerformanceData>();

    const updateMap = (map: Map<string, AggregatedPerformanceData>, key: string | undefined, points: number, isCorrect: boolean) => {
      if (key) {
        const current = map.get(key) || { totalQuestions: 0, correctQuestions: 0, pointsEarned: 0, maxPoints: 0 };
        current.totalQuestions++;
        current.maxPoints += points;
        if (isCorrect) {
          current.correctQuestions++;
          current.pointsEarned += points;
        }
        map.set(key, current);
      }
    };

    this.questions.forEach(q => {
      const qResult = this.userAnswers.get(q.id);
      const { isCorrect } = this.evaluateQuestion(q, qResult || null);
      const points = q.points || 0;

      updateMap(loPerformanceMap, q.learningObjective, points, isCorrect);
      updateMap(categoryPerformanceMap, q.category, points, isCorrect);
      updateMap(topicPerformanceMap, q.topic, points, isCorrect);
      updateMap(difficultyPerformanceMap, q.difficulty, points, isCorrect);
      updateMap(bloomLevelPerformanceMap, q.bloomLevel, points, isCorrect);
    });

    const formatPerformanceArray = <T extends PerformanceMetric & Record<string, any>>( // Adjusted T to be more generic
        map: Map<string, AggregatedPerformanceData>,
        keyName: keyof T // This ensures keyName is a valid key of T
    ): T[] => {
        return Array.from(map.entries()).map(([key, data]) => ({
            [keyName]: key,
            totalQuestions: data.totalQuestions,
            correctQuestions: data.correctQuestions,
            pointsEarned: data.pointsEarned,
            maxPoints: data.maxPoints,
            percentage: data.maxPoints > 0 ? parseFloat(((data.pointsEarned / data.maxPoints) * 100).toFixed(2)) : 0,
        } as T)); // Cast to T, assuming T's structure aligns
    };


    return {
      performanceByLearningObjective: formatPerformanceArray<PerformanceByLearningObjective>(loPerformanceMap, 'learningObjective'),
      performanceByCategory: formatPerformanceArray<PerformanceByCategory>(categoryPerformanceMap, 'category'),
      performanceByTopic: formatPerformanceArray<PerformanceByTopic>(topicPerformanceMap, 'topic'),
      performanceByDifficulty: formatPerformanceArray<PerformanceByDifficulty>(difficultyPerformanceMap, 'difficulty'),
      performanceByBloomLevel: formatPerformanceArray<PerformanceByBloomLevel>(bloomLevelPerformanceMap, 'bloomLevel'),
    };
  }


  public async calculateResults(): Promise<QuizResult> {
    this.stopTimer();
    this._recordCurrentQuestionTime();

    let totalScore = 0;
    let maxScore = 0;
    const questionResultsArray: QuizResult['questionResults'] = [];
    let accumulatedTotalTimeSpent = 0;

    for (const question of this.questions) {
      const userAnswer = this.userAnswers.get(question.id) || null;
      const points = question.points || 0;
      maxScore += points;
      const { isCorrect, correctAnswer, pointsEarned } = this.evaluateQuestion(question, userAnswer);

      const timeSpentOnThisQuestion = parseFloat((this.questionTimings.get(question.id) || 0).toFixed(2));
      accumulatedTotalTimeSpent += timeSpentOnThisQuestion;

      if (isCorrect) {
        totalScore += pointsEarned;
      }
      questionResultsArray.push({
        questionId: question.id,
        isCorrect,
        pointsEarned,
        userAnswer,
        correctAnswer,
        timeSpentSeconds: timeSpentOnThisQuestion,
      });
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    let passed = undefined;
    if (this.config.settings?.passingScorePercent !== undefined) {
      passed = percentage >= this.config.settings.passingScorePercent;
    }

    const totalQuizTimeSpent = parseFloat(accumulatedTotalTimeSpent.toFixed(2));
    const averageTime = this.questions.length > 0 ? parseFloat((totalQuizTimeSpent / this.questions.length).toFixed(2)) : 0;

    const metadataPerformance = this._calculateMetadataPerformance();

    const finalResults: QuizResult = {
      score: totalScore,
      maxScore,
      percentage,
      answers: this.userAnswers,
      questionResults: questionResultsArray,
      passed,
      webhookStatus: 'idle',
      scormStatus: this.quizResultState.scormStatus || 'idle',
      scormError: this.quizResultState.scormError,
      studentName: this.quizResultState.studentName,
      totalTimeSpentSeconds: totalQuizTimeSpent,
      averageTimePerQuestionSeconds: averageTime,
      ...metadataPerformance,
    };

    if (this.config.settings?.scorm) {
      this._sendResultsToSCORM(finalResults);
    }

    await this._sendResultsToWebhook(finalResults);

    this.callbacks.onQuizFinish?.(finalResults);
    return finalResults;
  }

  private isPointInHotspot(px: number, py: number, hotspot: HotspotArea): boolean {
    const [coord1, coord2, coord3, coord4] = hotspot.coords;
    if (hotspot.shape === 'rect') {
      const x = coord1; const y = coord2; const w = coord3; const h = coord4;
      return px >= x && px <= x + w && py >= y && py <= y + h;
    } else if (hotspot.shape === 'circle') {
      const cx = coord1; const cy = coord2; const r = coord3;
      return (px - cx) ** 2 + (py - cy) ** 2 <= r ** 2;
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
        fitbq.answers.forEach(ans => { (correctAnswer as Record<string, string[]>)[ans.blankId] = ans.acceptedValues; });
        if (typeof answer === 'object' && answer !== null) {
          const userAnswerMap = answer as Record<string, string>;
          isCorrect = fitbq.answers.every(correctAns => {
            const userVal = userAnswerMap[correctAns.blankId]?.trim();
            const acceptedVals = correctAns.acceptedValues.map(v => v.trim());
            return fitbq.isCaseSensitive ? acceptedVals.some(accVal => accVal === userVal) : acceptedVals.some(accVal => accVal.toLowerCase() === userVal?.toLowerCase());
          });
        }
        break;
      case 'drag_and_drop':
        const dndq = question as DragAndDropQuestion;
        correctAnswer = {};
        dndq.answerMap.forEach(map => { (correctAnswer as Record<string, string>)[map.draggableId] = map.dropZoneId; });
        if (typeof answer === 'object' && answer !== null) {
          const userAnswerMap = answer as Record<string, string>;
          const correctPairs = dndq.answerMap.length;
          let userCorrectPairs = 0;
          dndq.answerMap.forEach(map => { if (userAnswerMap[map.draggableId] === map.dropZoneId) userCorrectPairs++; });
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
          isCorrect = saq.acceptedAnswers.some(accAns => saq.isCaseSensitive ? accAns.trim() === userAnswerTrimmed : accAns.trim().toLowerCase() === userAnswerTrimmed.toLowerCase());
        }
        break;
      case 'numeric':
        const nq = question as NumericQuestion;
        correctAnswer = { answer: nq.answer, tolerance: nq.tolerance };
        if (typeof answer === 'string') {
          const userAnswerNum = parseFloat(answer);
          if (!isNaN(userAnswerNum)) {
            isCorrect = nq.tolerance !== undefined && nq.tolerance !== null ? Math.abs(userAnswerNum - nq.answer) <= nq.tolerance : userAnswerNum === nq.answer;
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
        correctAnswer = matQ.correctAnswerMap.reduce((acc, curr) => { acc[curr.promptId] = curr.optionId; return acc; }, {} as Record<string, string>);
        if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
          const userAnswerMap = answer as Record<string, string>;
          let correctMatches = 0;
          matQ.correctAnswerMap.forEach(map => { if (userAnswerMap[map.promptId] === map.optionId) correctMatches++; });
          isCorrect = correctMatches === matQ.correctAnswerMap.length && Object.keys(userAnswerMap).length === matQ.correctAnswerMap.length;
        }
        break;
      case 'hotspot':
        const hsQ = question as HotspotQuestion;
        correctAnswer = hsQ.correctHotspotIds;
        if (typeof answer === 'string') isCorrect = hsQ.correctHotspotIds.includes(answer);
        break;
      case 'blockly_programming':
        const bpQ = question as BlocklyProgrammingQuestion;
        correctAnswer = bpQ.solutionWorkspaceXML || null;
        isCorrect = (typeof answer === 'string' && bpQ.solutionWorkspaceXML) ? answer === bpQ.solutionWorkspaceXML : (!bpQ.solutionWorkspaceXML ? false : false);
        break;
      case 'scratch_programming':
        const spQ = question as ScratchProgrammingQuestion;
        correctAnswer = spQ.solutionWorkspaceXML || null;
        isCorrect = (typeof answer === 'string' && spQ.solutionWorkspaceXML) ? answer === spQ.solutionWorkspaceXML : (!spQ.solutionWorkspaceXML ? false : false);
        break;
      default:
        const _exhaustiveCheck: never = question;
        console.warn("Unsupported question type in QuizEngine:", _exhaustiveCheck);
        isCorrect = false;
    }
    return { isCorrect, correctAnswer, pointsEarned: isCorrect ? points : 0 };
  }

  public getElapsedTime(): number {
    return Date.now() - this.overallStartTime; 
  }

  public destroy(): void {
    this.stopTimer();
    this._recordCurrentQuestionTime(); 

    if (this.scormService && this.scormService.hasAPI()) {
      if (this.quizResultState.scormStatus === 'initialized' || this.quizResultState.scormStatus === 'committed' || this.quizResultState.scormStatus === 'sending_data') {
         const termResult = this.scormService.terminate();
         if (termResult.success) {
            this.quizResultState.scormStatus = 'terminated';
         } else {
            this.quizResultState.scormStatus = 'error';
            this.quizResultState.scormError = termResult.error || "SCORM termination failed on destroy.";
         }
      }
    }
    this.scormService = null;
    console.log("QuizEngine destroyed. Question timings:", this.questionTimings);
  }
}

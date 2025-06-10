
import React, { useState } from 'react';
import {
  QuizResult as QuizResultType,
  QuizConfig,
  QuizQuestion,
  PerformanceMetric,
  PerformanceByLearningObjective,
  PerformanceByCategory,
  PerformanceByTopic,
  PerformanceByDifficulty,
  PerformanceByBloomLevel
} from '../types'; // Corrected
import { Button } from './shared/Button';
import { Card } from './shared/Card';
import { QuestionRenderer } from './QuestionRenderer';

interface QuizResultProps {
  result: QuizResultType;
  quizConfig: QuizConfig;
  onRestartQuiz: () => void;
  onLoadNewQuiz: () => void;
}

const formatSecondsToHMS = (totalSeconds: number | undefined): string => {
    if (totalSeconds === undefined || totalSeconds < 0) return 'N/A';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    let timeString = "";
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0 || hours > 0) timeString += `${minutes}m `;
    timeString += `${seconds}s`;

    return timeString.trim() || "0s";
};

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  initiallyOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <details open={isOpen} className="bg-slate-700 rounded-lg overflow-hidden">
      <summary
        className="px-4 py-3 font-semibold text-slate-200 cursor-pointer hover:bg-slate-600 transition-colors flex justify-between items-center"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        role="button"
        aria-expanded={isOpen}
        aria-controls={`section-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {title}
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} aria-hidden="true">&#x276F;</span>
      </summary>
      {isOpen && (
        <div className="px-4 py-3 border-t border-slate-600" id={`section-content-${title.replace(/\s+/g, '-').toLowerCase()}`}>
          {children}
        </div>
      )}
    </details>
  );
};


interface PerformanceTableProps<TItem extends PerformanceMetric & { [key: string]: any }> {
  data: TItem[] | undefined;
  dataKeyName: keyof TItem;
  titleKeyName: string;
  passingScorePercent?: number;
}

const PerformanceTable = <TItem extends PerformanceMetric & { [key: string]: any }>({
  data,
  dataKeyName,
  titleKeyName,
  passingScorePercent
}: PerformanceTableProps<TItem>) => {
  if (!data || data.length === 0) {
    return <p className="text-slate-400 text-sm italic">No data available for this category.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left text-slate-300">
        <thead className="text-xs text-sky-300 uppercase bg-slate-650">
          <tr>
            <th scope="col" className="py-2 px-3">{titleKeyName}</th>
            <th scope="col" className="py-2 px-3 text-center">Correct / Total Qs</th>
            <th scope="col" className="py-2 px-3 text-center">Points Earned / Max</th>
            <th scope="col" className="py-2 px-3 text-center">Percentage</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="bg-slate-700 border-b border-slate-600 hover:bg-slate-650">
              <td className="py-2 px-3 font-medium whitespace-nowrap">{(item as any)[dataKeyName] || 'N/A'}</td>
              <td className="py-2 px-3 text-center">{item.correctQuestions} / {item.totalQuestions}</td>
              <td className="py-2 px-3 text-center">{item.pointsEarned} / {item.maxPoints}</td>
              <td className={`py-2 px-3 text-center font-semibold ${item.percentage >= (passingScorePercent || 70) ? 'text-green-400' : (item.percentage >= 50 ? 'text-yellow-400' : 'text-red-400')}`}>
                {item.percentage.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


export const QuizResult: React.FC<QuizResultProps> = ({ result, quizConfig: qc, onRestartQuiz, onLoadNewQuiz }) => {

  const getQuestionById = (id: string): QuizQuestion | undefined => {
    return qc.questions.find(q => q.id === id);
  }

  const renderWebhookStatus = () => {
    if (!qc.settings?.webhookUrl) {
      return null;
    }
     switch (result.webhookStatus) {
      case 'sending':
        return <p className="text-center text-sky-400 animate-pulse mt-2 text-sm">Submitting results to webhook...</p>;
      case 'success':
        return <p className="text-center text-green-400 mt-2 text-sm">Results successfully sent to webhook.</p>;
      case 'error':
        return (
          <div className="text-center text-red-400 mt-2 text-sm">
            <p>Failed to send results to webhook.</p>
            {result.webhookError && <p className="text-xs">Error: {result.webhookError}</p>}
          </div>
        );
      case 'idle':
      default:
        return null;
    }
  };

  const renderSCORMStatus = () => {
    if (!qc.settings?.scorm) {
      return null;
    }
    switch (result.scormStatus) {
      case 'no_api':
        return <p className="text-center text-yellow-500 mt-2 text-sm">SCORM API not found by LMS.</p>;
      case 'initializing':
        return <p className="text-center text-sky-400 animate-pulse mt-2 text-sm">Initializing SCORM communication...</p>;
      case 'initialized':
        return <p className="text-center text-green-400 mt-2 text-sm">SCORM initialized. Student: {result.studentName || 'N/A'}</p>;
      case 'sending_data':
        return <p className="text-center text-sky-400 animate-pulse mt-2 text-sm">Sending results to LMS via SCORM...</p>;
      case 'committed':
        return <p className="text-center text-green-400 mt-2 text-sm">Results successfully sent to LMS.</p>;
      case 'terminated':
         return <p className="text-center text-slate-400 mt-2 text-sm">SCORM communication terminated.</p>;
      case 'error':
        return (
          <div className="text-center text-red-400 mt-2 text-sm">
            <p>SCORM communication error.</p>
            {result.scormError && <p className="text-xs">Details: {result.scormError}</p>}
          </div>
        );
      case 'idle':
      default:
        return null;
    }
  };


  return (
    <Card title="Quiz Results" className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-3xl font-bold text-sky-400">
          Your Score: {result.score} / {result.maxScore} ({result.percentage.toFixed(2)}%)
        </h3>
        {result.passed !== undefined && (
          <p className={`text-2xl font-semibold mt-2 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
            {result.passed ? 'Congratulations, you passed!' : 'You did not pass this time.'}
          </p>
        )}
      </div>

      <div className="my-4 p-4 bg-slate-700 rounded-md text-sm">
        <h4 className="font-semibold text-slate-200 mb-2">Time Analytics:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p><span className="text-slate-400">Total Time Spent:</span> {formatSecondsToHMS(result.totalTimeSpentSeconds)}</p>
            <p><span className="text-slate-400">Avg. Time/Question:</span> {formatSecondsToHMS(result.averageTimePerQuestionSeconds)}</p>
        </div>
      </div>

      {renderWebhookStatus()}
      {renderSCORMStatus()}

      <div className="space-y-3 my-6">
        {result.performanceByLearningObjective && result.performanceByLearningObjective.length > 0 && (
          <CollapsibleSection title="Performance by Learning Objective">
            <PerformanceTable data={result.performanceByLearningObjective} dataKeyName="learningObjective" titleKeyName="Learning Objective" passingScorePercent={qc.settings?.passingScorePercent} />
          </CollapsibleSection>
        )}
        {result.performanceByCategory && result.performanceByCategory.length > 0 && (
          <CollapsibleSection title="Performance by Category">
            <PerformanceTable data={result.performanceByCategory} dataKeyName="category" titleKeyName="Category" passingScorePercent={qc.settings?.passingScorePercent} />
          </CollapsibleSection>
        )}
        {result.performanceByTopic && result.performanceByTopic.length > 0 && (
          <CollapsibleSection title="Performance by Topic">
            <PerformanceTable data={result.performanceByTopic} dataKeyName="topic" titleKeyName="Topic" passingScorePercent={qc.settings?.passingScorePercent} />
          </CollapsibleSection>
        )}
         {result.performanceByDifficulty && result.performanceByDifficulty.length > 0 && (
          <CollapsibleSection title="Performance by Difficulty">
            <PerformanceTable data={result.performanceByDifficulty} dataKeyName="difficulty" titleKeyName="Difficulty" passingScorePercent={qc.settings?.passingScorePercent} />
          </CollapsibleSection>
        )}
        {result.performanceByBloomLevel && result.performanceByBloomLevel.length > 0 && (
          <CollapsibleSection title="Performance by Bloom's Level">
            <PerformanceTable data={result.performanceByBloomLevel} dataKeyName="bloomLevel" titleKeyName="Bloom's Level" passingScorePercent={qc.settings?.passingScorePercent} />
          </CollapsibleSection>
        )}
      </div>


      {qc.settings?.showCorrectAnswers === 'end_of_quiz' && (
        <CollapsibleSection title="Review Your Answers" initiallyOpen={false}>
          <div className="space-y-6 mt-2">
            {result.questionResults.map((qr, index) => {
              const question = getQuestionById(qr.questionId);
              if (!question) return null;
              return (
                <div key={qr.questionId} className="border border-slate-600 rounded-lg p-4 bg-slate-750">
                   <div className="flex justify-between items-center mb-2">
                      <p className={`font-semibold ${qr.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        Question {index + 1}: {qr.isCorrect ? `Correct (+${question.points || 0} pts)` : `Incorrect (0 pts)`}
                      </p>
                      <p className="text-xs text-slate-400">
                          Time: {formatSecondsToHMS(qr.timeSpentSeconds)}
                      </p>
                   </div>
                  <QuestionRenderer
                    question={question}
                    userAnswer={qr.userAnswer}
                    onAnswerChange={() => {}}
                    questionNumber={index + 1}
                    totalQuestions={qc.questions.length}
                    showCorrectAnswer={true}
                    shuffleOptions={qc.settings?.shuffleOptions} // Use quiz-level shuffle setting for review consistency
                  />
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}

      <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
        <Button onClick={onRestartQuiz} variant="primary" size="lg">
          Restart Quiz
        </Button>
        <Button onClick={onLoadNewQuiz} variant="secondary" size="lg">
          Load New Quiz
        </Button>
      </div>
    </Card>
  );
};


import React, { useState, useEffect } from 'react';
import { FillInTheBlanksQuestion, UserAnswerType } from '../types';

interface FillInTheBlanksQuestionUIProps {
  question: FillInTheBlanksQuestion;
  onAnswerChange: (answer: UserAnswerType) => void;
  userAnswer: UserAnswerType | null;
  showCorrectAnswer?: boolean;
}

export const FillInTheBlanksQuestionUI: React.FC<FillInTheBlanksQuestionUIProps> = ({
  question,
  onAnswerChange,
  userAnswer,
  showCorrectAnswer,
}) => {
  const initialAnswers = React.useMemo(() => {
    const ans: Record<string, string> = {};
    if (typeof userAnswer === 'object' && userAnswer !== null) {
      return userAnswer as Record<string, string>;
    }
    question.segments.forEach(segment => {
      if (segment.type === 'blank' && segment.id) {
        ans[segment.id] = '';
      }
    });
    return ans;
  }, [userAnswer, question.segments]);

  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>(initialAnswers);

  useEffect(() => {
    setBlankAnswers(initialAnswers);
  }, [initialAnswers]);


  const handleChange = (blankId: string, value: string) => {
    const newAnswers = { ...blankAnswers, [blankId]: value };
    setBlankAnswers(newAnswers);
    onAnswerChange(newAnswers);
  };

  return (
    <div className="text-lg leading-relaxed">
      {question.segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={`text-${index}`}>{segment.content}</span>;
        }
        if (segment.type === 'blank' && segment.id) {
          const blankId = segment.id;
          const correctAnswerData = question.answers.find(a => a.blankId === blankId);
          const isCorrect = showCorrectAnswer && correctAnswerData && correctAnswerData.acceptedValues.map(v => v.toLowerCase()).includes(blankAnswers[blankId]?.toLowerCase() || '');
          let borderColor = 'border-slate-600 focus:border-sky-500';
          if (showCorrectAnswer) {
            borderColor = isCorrect ? 'border-green-500' : 'border-red-500';
          }

          return (
            <input
              key={`blank-${blankId}-${index}`}
              type="text"
              value={blankAnswers[blankId] || ''}
              onChange={(e) => handleChange(blankId, e.target.value)}
              className={`inline-block mx-1 px-2 py-1 w-32 border-b-2 bg-transparent ${borderColor} focus:outline-none text-sky-300 placeholder-slate-500`}
              placeholder="Type here"
              disabled={showCorrectAnswer}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

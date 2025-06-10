
import React, { useState, useEffect } from 'react';
import { QuizSettings, QuizConfig, SCORMSettings } from '../../types'; // Adjusted path
import { Button } from '../shared/Button'; // Adjusted path

interface QuizSettingsFormProps {
  title: string;
  description: string;
  settings: QuizConfig['settings'];
  onSettingsChange: (newSettings: Partial<QuizSettings>, newTitle: string, newDescription: string) => void;
}

export const QuizSettingsForm: React.FC<QuizSettingsFormProps> = ({
  title: initialTitle,
  description: initialDescription,
  settings: initialSettings,
  onSettingsChange,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [shuffleQuestions, setShuffleQuestions] = useState(initialSettings?.shuffleQuestions || false);
  const [shuffleOptions, setShuffleOptions] = useState(initialSettings?.shuffleOptions || false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(initialSettings?.timeLimitMinutes || 0);
  const [passingScorePercent, setPassingScorePercent] = useState(initialSettings?.passingScorePercent || 70);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState<'immediately' | 'end_of_quiz' | 'never'>(initialSettings?.showCorrectAnswers || 'end_of_quiz');
  const [webhookUrl, setWebhookUrl] = useState(initialSettings?.webhookUrl || '');
  const [scormSettings, setScormSettings] = useState<SCORMSettings>(initialSettings?.scorm || { version: '1.2' });


  useEffect(() => {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setShuffleQuestions(initialSettings?.shuffleQuestions || false);
    setShuffleOptions(initialSettings?.shuffleOptions || false);
    setTimeLimitMinutes(initialSettings?.timeLimitMinutes || 0);
    setPassingScorePercent(initialSettings?.passingScorePercent || 70);
    setShowCorrectAnswers(initialSettings?.showCorrectAnswers || 'end_of_quiz');
    setWebhookUrl(initialSettings?.webhookUrl || '');
    setScormSettings(initialSettings?.scorm || { version: '1.2' });
  }, [initialTitle, initialDescription, initialSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSettingsChange(
        { 
            shuffleQuestions,
            shuffleOptions,
            timeLimitMinutes: Number(timeLimitMinutes) > 0 ? Number(timeLimitMinutes) : undefined, 
            passingScorePercent: Number(passingScorePercent),
            showCorrectAnswers,
            webhookUrl: webhookUrl.trim() || undefined,
            scorm: scormSettings.version ? scormSettings : undefined, // Only include SCORM if a version is selected
        }, 
        title, 
        description
    );
    alert("Settings updated (locally). Remember to 'Save & Exit' to persist changes.");
  };
  
  const handleScormSettingChange = (field: keyof SCORMSettings, value: string | boolean) => {
    setScormSettings(prev => ({ ...prev, [field]: value }));
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="quizTitle" className="block text-sm font-medium text-sky-300">
          Quiz Title*
        </label>
        <input
          type="text"
          id="quizTitle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="quizDescription" className="block text-sm font-medium text-sky-300">
          Description (Optional)
        </label>
        <textarea
          id="quizDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="timeLimit" className="block text-sm font-medium text-sky-300">
            Time Limit (Minutes, 0 for no limit)
          </label>
          <input
            type="number"
            id="timeLimit"
            value={timeLimitMinutes}
            onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
            min="0"
            className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="passingScore" className="block text-sm font-medium text-sky-300">
            Passing Score (%)
          </label>
          <input
            type="number"
            id="passingScore"
            value={passingScorePercent}
            onChange={(e) => setPassingScorePercent(Number(e.target.value))}
            min="0"
            max="100"
            className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <label className="block text-sm font-medium text-sky-300">Shuffle Questions?</label>
            <div className="mt-2 flex items-center">
                <input 
                    id="shuffleYes" 
                    type="radio" 
                    checked={shuffleQuestions === true} 
                    onChange={() => setShuffleQuestions(true)} 
                    className="h-4 w-4 text-sky-600 border-slate-500 focus:ring-sky-500"
                />
                <label htmlFor="shuffleYes" className="ml-2 text-sm text-slate-200">Yes</label>
                <input 
                    id="shuffleNo" 
                    type="radio" 
                    checked={shuffleQuestions === false} 
                    onChange={() => setShuffleQuestions(false)} 
                    className="ml-4 h-4 w-4 text-sky-600 border-slate-500 focus:ring-sky-500"
                />
                <label htmlFor="shuffleNo" className="ml-2 text-sm text-slate-200">No</label>
            </div>
        </div>
         <div>
            <label className="block text-sm font-medium text-sky-300">Shuffle Options (MCQ, MRQ, Matching)?</label>
            <div className="mt-2 flex items-center">
                <input 
                    id="shuffleOptionsYes" 
                    type="radio" 
                    checked={shuffleOptions === true} 
                    onChange={() => setShuffleOptions(true)} 
                    className="h-4 w-4 text-sky-600 border-slate-500 focus:ring-sky-500"
                />
                <label htmlFor="shuffleOptionsYes" className="ml-2 text-sm text-slate-200">Yes</label>
                <input 
                    id="shuffleOptionsNo" 
                    type="radio" 
                    checked={shuffleOptions === false} 
                    onChange={() => setShuffleOptions(false)} 
                    className="ml-4 h-4 w-4 text-sky-600 border-slate-500 focus:ring-sky-500"
                />
                <label htmlFor="shuffleOptionsNo" className="ml-2 text-sm text-slate-200">No</label>
            </div>
        </div>
        <div>
          <label htmlFor="showCorrect" className="block text-sm font-medium text-sky-300">
            Show Correct Answers
          </label>
          <select
            id="showCorrect"
            value={showCorrectAnswers}
            onChange={(e) => setShowCorrectAnswers(e.target.value as 'immediately' | 'end_of_quiz' | 'never')}
            className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          >
            <option value="end_of_quiz">End of Quiz</option>
            <option value="immediately">Immediately</option>
            <option value="never">Never</option>
          </select>
        </div>
      </div>
       <div>
        <label htmlFor="webhookUrl" className="block text-sm font-medium text-sky-300">
          Webhook URL (Optional, for results submission)
        </label>
        <input
          type="url"
          id="webhookUrl"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://your-endpoint.com/results"
          className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
        />
      </div>

      {/* SCORM Settings Section */}
      <details className="space-y-4 bg-slate-750 p-4 rounded-md">
        <summary className="text-md font-medium text-sky-400 cursor-pointer hover:text-sky-300">SCORM Settings (Optional)</summary>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-2">
            <div>
                <label htmlFor="scormVersion" className="block text-xs font-medium text-slate-300">SCORM Version</label>
                <select id="scormVersion" value={scormSettings.version} onChange={(e) => handleScormSettingChange('version', e.target.value as "1.2" | "2004")}
                    className="mt-1 block w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm focus:ring-sky-500 focus:border-sky-500">
                    <option value="1.2">SCORM 1.2</option>
                    <option value="2004">SCORM 2004</option>
                </select>
            </div>
            <div className="flex items-center pt-5">
                <input type="checkbox" id="scormSetCompletion" checked={scormSettings.setCompletionOnFinish !== false} onChange={(e) => handleScormSettingChange('setCompletionOnFinish', e.target.checked)} className="h-4 w-4 text-sky-600 border-slate-500 rounded focus:ring-sky-500" />
                <label htmlFor="scormSetCompletion" className="ml-2 text-xs text-slate-200">Set Completion on Finish</label>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="scormSetSuccess" checked={scormSettings.setSuccessOnPass !== false} onChange={(e) => handleScormSettingChange('setSuccessOnPass', e.target.checked)} className="h-4 w-4 text-sky-600 border-slate-500 rounded focus:ring-sky-500" />
                <label htmlFor="scormSetSuccess" className="ml-2 text-xs text-slate-200">Set Success on Pass</label>
            </div>
             <div className="flex items-center">
                <input type="checkbox" id="scormAutoCommit" checked={scormSettings.autoCommit !== false} onChange={(e) => handleScormSettingChange('autoCommit', e.target.checked)} className="h-4 w-4 text-sky-600 border-slate-500 rounded focus:ring-sky-500" />
                <label htmlFor="scormAutoCommit" className="ml-2 text-xs text-slate-200">Auto Commit Data</label>
            </div>
        </div>
      </details>


      <div className="pt-5">
        <Button type="submit" variant="primary">
          Update Settings
        </Button>
      </div>
    </form>
  );
};
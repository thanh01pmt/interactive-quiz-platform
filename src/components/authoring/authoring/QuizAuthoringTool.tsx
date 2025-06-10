
import React, { useState, useCallback, useEffect } from 'react';
import type { QuizConfig, QuizQuestion, QuestionTypeStrings } from '../../../../types';
import { Button } from '../shared/Button';
import { Card } from '../shared/Card';
import { QuizSettingsForm } from './QuizSettingsForm';
import { QuestionList } from './QuestionList';
import { EditQuestionModal } from './EditQuestionModal';
import { getNewQuestionTemplate } from './questionTemplates';
import { AIQuestionGeneratorModal } from './AIQuestionGeneratorModal'; 
import { AIQuestionFormState } from './AIQuestionGeneratorForm'; 
import { generateQuizQuestion as generateAIQuestion } from '../../services/AIGenerationService';
import { generateUniqueId } from '../../utils/idGenerators';


interface QuizAuthoringToolProps {
  initialQuizConfig: QuizConfig | null;
  onSaveQuiz: (quizConfig: QuizConfig) => void;
  onExitAuthoring: () => void;
}

export const QuizAuthoringTool: React.FC<QuizAuthoringToolProps> = ({
  initialQuizConfig,
  onSaveQuiz,
  onExitAuthoring,
}) => {
  const [quizConfig, setQuizConfig] = useState<QuizConfig>(
    initialQuizConfig || {
      id: generateUniqueId('quiz_'), 
      title: 'New Quiz',
      description: '',
      questions: [],
      settings: { shuffleQuestions: false, showCorrectAnswers: 'end_of_quiz', passingScorePercent: 70 },
    }
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  useEffect(() => {
    if (initialQuizConfig) {
      setQuizConfig(initialQuizConfig);
    } else {
       setQuizConfig({
          id: generateUniqueId('quiz_'), 
          title: 'New Quiz',
          description: '',
          questions: [],
          settings: { shuffleQuestions: false, showCorrectAnswers: 'end_of_quiz', passingScorePercent: 70 },
        });
    }
  }, [initialQuizConfig]);

  const handleSettingsChange = useCallback((newSettings: Partial<QuizConfig['settings']>, newTitle?: string, newDescription?: string) => {
    setQuizConfig(prevConfig => ({
      ...prevConfig,
      title: newTitle !== undefined ? newTitle : prevConfig.title,
      description: newDescription !== undefined ? newDescription : prevConfig.description,
      settings: { ...prevConfig.settings, ...newSettings },
    }));
  }, []);

  const handleAddNewQuestion = (type: QuestionTypeStrings) => {
    const newQuestion = getNewQuestionTemplate(type);
    setEditingQuestion(newQuestion);
    setEditingQuestionIndex(null);
    setIsEditModalOpen(true);
    setAiError(null);
  };

  const handleEditQuestion = (question: QuizQuestion, index: number) => {
    setEditingQuestion({ ...question }); // Create a copy to edit
    setEditingQuestionIndex(index);
    setIsEditModalOpen(true);
    setAiError(null);
  };

  const handleDeleteQuestion = (index: number) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuizConfig(prevConfig => ({
        ...prevConfig,
        questions: prevConfig.questions.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSaveQuestion = (questionToSave: QuizQuestion) => {
    setQuizConfig(prevConfig => {
      const newQuestions = [...prevConfig.questions];
      if (editingQuestionIndex !== null && editingQuestionIndex >= 0 && editingQuestionIndex < newQuestions.length) {
        newQuestions[editingQuestionIndex] = questionToSave;
      } else {
        // Ensure ID is unique if it's a new question or ID was somehow lost
        const qToSaveWithId = { ...questionToSave, id: questionToSave.id || generateUniqueId('q_')};
        newQuestions.push(qToSaveWithId);
      }
      return { ...prevConfig, questions: newQuestions };
    });
    setIsEditModalOpen(false);
    setEditingQuestion(null);
    setEditingQuestionIndex(null);
  };
  
  const handleQuestionOrderChange = (newOrderedQuestions: QuizQuestion[]) => {
    setQuizConfig(prev => ({ ...prev, questions: newOrderedQuestions }));
  };

  const handleSaveAndExit = () => {
    // Basic validation for the overall quiz config before saving
    if (!quizConfig.title || quizConfig.title.trim() === "") {
        alert("Quiz title cannot be empty.");
        return;
    }
    if (!quizConfig.id || quizConfig.id.trim() === "") {
        alert("Quiz ID is missing. Please ensure the quiz has an ID.");
        return;
    }
    onSaveQuiz(quizConfig);
  };

  // AI Generation Handlers
  const handleOpenAIGenerator = () => {
    setIsAIModalOpen(true);
    setAiError(null);
  };

  const handleAIGenerateQuestion = async (formData: AIQuestionFormState) => {
    setIsAIGenerating(true);
    setAiError(null);
    try {
      const generatedQuestion = await generateAIQuestion(
        formData.topic,
        formData.questionType,
        formData.difficulty
      );

      if (generatedQuestion) {
        // Ensure AI generated question gets a unique ID if not already provided by service
        const aiQuestionWithId = {
            ...generatedQuestion,
            id: generatedQuestion.id || generateUniqueId('ai_q_') 
        };
        setEditingQuestion(aiQuestionWithId); 
        setEditingQuestionIndex(null);    
        setIsEditModalOpen(true);         
        setIsAIModalOpen(false);          
      } else {
        setAiError("AI failed to generate a valid question structure. Please try again or adjust your prompt.");
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      setAiError(error instanceof Error ? error.message : "An unknown error occurred during AI generation.");
    } finally {
      setIsAIGenerating(false);
    }
  };


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card title="Quiz Authoring">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-sky-400">
                {quizConfig.title || "Untitled Quiz"}
            </h2>
            <div className="space-x-2">
                 <Button onClick={handleSaveAndExit} variant="primary">Save & Exit</Button>
                 <Button onClick={onExitAuthoring} variant="secondary">Exit Without Saving</Button>
            </div>
        </div>
        
        <QuizSettingsForm
          title={quizConfig.title}
          description={quizConfig.description || ''}
          settings={quizConfig.settings || {}}
          onSettingsChange={handleSettingsChange}
        />
      </Card>

      <Card title="Questions">
        <QuestionList
          questions={quizConfig.questions}
          onAddNewQuestion={handleAddNewQuestion}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onOrderChange={handleQuestionOrderChange}
          onOpenAIGenerator={handleOpenAIGenerator} 
        />
         {aiError && (
          <p className="text-sm text-red-400 mt-2 p-2 bg-red-900 bg-opacity-30 rounded text-center">{aiError}</p>
        )}
      </Card>

      {isEditModalOpen && editingQuestion && (
        <EditQuestionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingQuestion(null);
            setEditingQuestionIndex(null);
          }}
          questionData={editingQuestion}
          onSaveQuestion={handleSaveQuestion}
          isNewQuestion={editingQuestionIndex === null}
        />
      )}

      {isAIModalOpen && (
        <AIQuestionGeneratorModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          onGenerate={handleAIGenerateQuestion}
          isLoading={isAIGenerating}
        />
      )}
    </div>
  );
};

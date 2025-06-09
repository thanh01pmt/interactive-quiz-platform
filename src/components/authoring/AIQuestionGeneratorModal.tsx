
import React from 'react';
import { Card } from '../shared/Card';
import { AIQuestionGeneratorForm, AIQuestionFormState } from './AIQuestionGeneratorForm';

interface AIQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (formData: AIQuestionFormState) => Promise<void>;
  isLoading: boolean;
}

export const AIQuestionGeneratorModal: React.FC<AIQuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} 
    >
      <Card
        title="✨ Generate Question with AI"
        className="w-full max-w-lg bg-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div onClick={(e) => e.stopPropagation()} className="p-1 sm:p-3 md:p-4"> {/* Added padding */}
          <AIQuestionGeneratorForm 
            onSubmit={onGenerate} 
            onCancel={onClose} 
            isLoading={isLoading} 
          />
        </div>
      </Card>
    </div>
  );
};

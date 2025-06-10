
import React from 'react';
import { Card } from '../shared/Card'; // Corrected path
import { AIQuestionGeneratorForm, AIQuestionFormState } from './AIQuestionGeneratorForm';

interface AIQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (formData: AIQuestionFormState) => Promise<void>; // Make onGenerate async
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
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-generator-modal-title"
    >
      <Card
        title="✨ Generate Question with AI"
        className="w-full max-w-lg bg-slate-800 shadow-2xl overflow-y-auto max-h-[90vh]"
        id="ai-generator-modal-title"
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

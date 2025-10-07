import React from 'react';
import Modal from './Modal';
import { samplePrompts } from '../data/samplePrompts';

interface SamplePromptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const SamplePromptsModal: React.FC<SamplePromptsModalProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sample Prompts">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {samplePrompts.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className="text-left p-4 border rounded-lg hover:bg-slate-100 hover:border-sky-500 transition-colors"
          >
            <h3 className="font-semibold text-slate-800">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{item.prompt}</p>
          </button>
        ))}
      </div>
    </Modal>
  );
};

export default SamplePromptsModal;

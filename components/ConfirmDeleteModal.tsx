import React from 'react';
import { Trash2Icon } from './icons';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  nodeName: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, nodeName, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 flex items-start space-x-4">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0">
                <Trash2Icon className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="mt-0 text-left flex-grow">
                <h3 className="text-lg leading-6 font-medium text-slate-900" id="delete-confirm-title">
                    Delete Confirmation
                </h3>
                <div className="mt-2">
                    <p className="text-sm text-slate-500">
                        Are you sure you want to delete <span className="font-bold text-slate-700">{nodeName}</span>? This action cannot be undone.
                    </p>
                </div>
            </div>
        </div>
        <footer className="px-6 py-4 bg-slate-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Delete
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

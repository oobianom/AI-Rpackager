import React from 'react';
import { AlertTriangleIcon } from './icons';

interface MobileWarningModalProps {
  onClose: () => void;
}

const MobileWarningModal: React.FC<MobileWarningModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-warning-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-sm"
      >
        <div className="p-6 text-center">
          <AlertTriangleIcon className="mx-auto h-12 w-12 text-amber-500" aria-hidden="true" />
          <h3 className="mt-4 text-lg leading-6 font-medium text-slate-900" id="mobile-warning-title">
            Mobile Experience
          </h3>
          <div className="mt-2">
            <p className="text-sm text-slate-600">
              For the best performance and user experience, we recommend using this application on a desktop or laptop computer.
            </p>
          </div>
        </div>
        <footer className="px-6 py-4 bg-slate-50 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Continue Anyway
          </button>
        </footer>
      </div>
    </div>
  );
};

export default MobileWarningModal;

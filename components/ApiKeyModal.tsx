import React from 'react';

interface ApiKeyModalProps {
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onClose }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="api-key-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b">
          <h2 id="api-key-title" className="text-lg font-semibold text-slate-800">How to get a Gemini API Key</h2>
        </header>
        <main className="p-6 space-y-4 text-sm text-slate-700">
            <p>To use your own Gemini API key, you need to create one from Google AI Studio.</p>
            <ol className="list-decimal list-inside space-y-2">
                <li>Go to the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">Google AI Studio website</a>.</li>
                <li>Click on the "Create API key" button.</li>
                <li>Choose an existing Google Cloud project or create a new one.</li>
                <li>Your API key will be generated. Copy it.</li>
                <li>Paste the copied key into the API Key input field in the settings and click "Validate & Save".</li>
            </ol>
            <p className="mt-4 text-xs text-slate-500">
                Note: Keep your API key secure. Do not share it publicly.
            </p>
        </main>
        <footer className="p-4 bg-slate-50 border-t flex justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-md text-sm font-medium"
            >
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ApiKeyModal;
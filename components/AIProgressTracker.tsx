import React from 'react';
import { LoaderIcon, CheckCircleIcon } from './icons';

export interface AIFileOperation {
    path: string;
    status: 'loading' | 'success';
}

interface AIProgressTrackerProps {
    operations: AIFileOperation[];
}

const AIProgressTracker: React.FC<AIProgressTrackerProps> = ({ operations }) => {
    if (operations.length === 0) {
        return null;
    }

    return (
        <div className="mx-2 mb-2 p-3 bg-slate-200/80 rounded-md border border-slate-300 text-sm animate-fade-in">
            <div className="space-y-2">
                {operations.map((op) => (
                    <div key={op.path} className="flex items-center justify-between">
                        <span className="font-mono text-slate-700 truncate">{op.path}</span>
                        {op.status === 'loading' ? (
                            <LoaderIcon className="w-4 h-4 text-slate-500 animate-spin" />
                        ) : (
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AIProgressTracker;

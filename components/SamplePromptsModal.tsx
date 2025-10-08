import React from 'react';

interface SamplePromptsModalProps {
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const samplePrompts = {
    "Full R Package Generation": [
      `Create an R package called 'NONCA' for pharmacokinetic non-compartmental analysis with comprehensive functions for AUC calculations (linear/log-linear trapezoidal, AUC0-inf), Cmax/Tmax, lambda_z estimation, half-life, clearance, volume of distribution, MRT, accumulation ratio, and bioavailability, where each function has its own .R file with complete roxygen2 documentation include vignettes, add a comprehensive README.md with package introduction, installation instructions, quick start example, features overview, usage examples, data format requirements, and citation information, ensure the package includes proper DESCRIPTION file with dependencies, passes R CMD check, contains testthat unit tests, handles inputs with informative errors, and includes example datasets with documentation.`,
        `Create a complete R package for basic data science calculations. The package should be named 'dsutils'.
1. Create the 'DESCRIPTION' file with Package, Version, Title, Author, and License fields.
2. Create the 'NAMESPACE' file and export a function named 'calculate_mean'.
3. Create an 'R' directory.
4. Inside the 'R' directory, create a file 'calculations.R' with the 'calculate_mean' function. The function should take a numeric vector and return its mean.
5. Create a 'man' directory.
6. Inside 'man', create 'calculate_mean.Rd' with basic documentation for the function.`,
    ],
    "Creating Files & Folders": [
        "Create a folder called 'inst' inside the Package folder 'NONCA'.",
        "Create a new R file named 'utils.js' in the '/Package/NONCA/inst' directory.",
        "Make a file named 'DESCRIPTION' in '/Package/NONCA' and add the content 'Package: myRPackage\nVersion: 0.1.0'",
    ],
    "Editing Files": [
        "Open the file '/Package/TEST/DESCRIPTION' and add 'License: MIT' to a new line at the end.",
        "Overwrite the content of '/Package/TEST/R/utils.R' with 'my_function <- function() { return(1) }'.",
    ],
    "Duplicating Files": [
        "Make a copy of the '/Package/NE/R' folder.",
        "Duplicate the file '/Package/NE/DESCRIPTION'.",
    ],
};


const SamplePromptsModal: React.FC<SamplePromptsModalProps> = ({ onClose, onSelectPrompt }) => {
  return (
    <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompts-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b">
          <h2 id="prompts-title" className="text-lg font-semibold text-slate-800">Sample Prompts for R Packager</h2>
          <p className="text-sm text-slate-500">Click a prompt to try it in the chat.</p>
        </header>
        <main className="p-6 overflow-y-auto space-y-6">
            {Object.entries(samplePrompts).map(([category, prompts]) => (
                <div key={category}>
                    <h3 className="font-semibold text-slate-700 mb-2">{category}</h3>
                    <ul className="space-y-2">
                        {prompts.map((prompt, index) => (
                            <li key={index}>
                                <button 
                                    onClick={() => onSelectPrompt(prompt)}
                                    className="w-full text-left p-3 bg-slate-50 hover:bg-sky-100 rounded-md text-sm text-slate-600 hover:text-sky-800 transition-colors"
                                >
                                    <pre className="whitespace-pre-wrap font-sans">"{prompt}"</pre>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
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

export default SamplePromptsModal;
import React, { useState, useCallback } from 'react';
import type { GeneratedFile } from '../types';

interface GeneratedFileCardProps {
  file: GeneratedFile;
}

const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || 'plaintext';
    const langMap: { [key: string]: string } = {
        'js': 'javascript',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'tsx',
        'json': 'json',
        'css': 'css',
        'html': 'html',
        'sql': 'sql',
        'md': 'markdown',
        'dockerfile': 'dockerfile',
    };
    return langMap[extension] || extension;
}

export const GeneratedFileCard: React.FC<GeneratedFileCardProps> = ({ file }) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(file.code).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [file.code]);

  const lang = getLanguageFromFileName(file.fileName);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
      <div className="bg-gray-900/50 px-4 py-2 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="font-mono text-sm text-gray-300">{file.fileName}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 text-sm text-gray-300 hover:text-white transition"
          aria-label={`Copy code from ${file.fileName}`}
        >
          {copySuccess ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto max-h-[400px]">
        <code className={`language-${lang}`}>{file.code}</code>
      </pre>
    </div>
  );
};

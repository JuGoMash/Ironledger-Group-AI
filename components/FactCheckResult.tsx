import React from 'react';
import type { FactCheckResult } from '../types';

interface FactCheckResultProps {
  result: FactCheckResult;
}

export const FactCheckResultComponent: React.FC<FactCheckResultProps> = ({ result }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{result.answer}</p>
      </div>

      {result.sources.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-indigo-300 mb-3">Sources:</h4>
          <ul className="space-y-2">
            {result.sources.filter(source => source.web?.uri).map((source, index) => (
              <li key={index} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors">
                <a
                  href={source.web!.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 text-indigo-400 hover:text-indigo-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="truncate" title={source.web!.title ?? ''}>{source.web!.title || source.web!.uri}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};


import React, { useState, useCallback } from 'react';
import { checkFact } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { FactCheckResultComponent } from '../components/FactCheckResult';
import type { FactCheckResult } from '../types';

export const FactChecker: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a question to check.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const apiResult = await checkFact(prompt);
      setResult(apiResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Who won the last FIFA world cup?"
          className="flex-grow bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition duration-300"
        >
          {isLoading ? 'Checking...' : 'Get Answer'}
        </button>
      </form>
      
      {error && <ErrorMessage message={error} />}

      {isLoading && <LoadingSpinner message="Searching the web..." />}

      {result && (
        <div className="animate-fade-in">
          <FactCheckResultComponent result={result} />
        </div>
      )}
    </div>
  );
};

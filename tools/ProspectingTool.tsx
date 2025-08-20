import React, { useState, useCallback } from 'react';
import { findProspects } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { ProspectCard } from '../components/ProspectCard';
import type { Prospect } from '../types';

export const ProspectingTool: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [prospects, setProspects] = useState<Prospect[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a profession or specialty to search for.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProspects(null);

    try {
      const result = await findProspects(prompt);
      setProspects(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Registered Doctors in San Francisco"
          className="flex-grow bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition duration-300"
        >
          {isLoading ? 'Searching...' : 'Find Prospects'}
        </button>
      </form>
      
      {error && <ErrorMessage message={error} />}

      {isLoading && <LoadingSpinner message="Scanning for prospects..." />}

      {prospects && (
        <div className="animate-fade-in space-y-4">
            <p className="text-sm text-center text-gray-400">Disclaimer: Information is AI-generated from public sources and should be independently verified.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prospects.map((prospect, index) => (
                    <ProspectCard key={index} prospect={prospect} />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};
import React, { useState, useCallback } from 'react';
import { generatePost } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const PostGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [post, setPost] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a topic for the post.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setPost('');

    try {
      const result = await generatePost(prompt);
      setPost(result);
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
          placeholder="e.g., a new product launch for our SaaS tool"
          className="flex-grow bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition duration-300"
        >
          {isLoading ? 'Generating...' : 'Generate Post'}
        </button>
      </form>
      
      {error && <ErrorMessage message={error} />}

      {isLoading && <LoadingSpinner message="Crafting your post..." />}

      {post && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg animate-fade-in">
          <h3 className="text-xl font-semibold mb-4 text-indigo-300">Your Post</h3>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{post}</p>
        </div>
      )}
    </div>
  );
};
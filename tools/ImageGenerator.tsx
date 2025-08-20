
import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please enter a prompt for the image.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setImageUrl('');

    try {
      const result = await generateImage(prompt);
      setImageUrl(result);
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
          placeholder="e.g., a photorealistic cat wearing a space helmet"
          className="flex-grow bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition duration-300"
        >
          {isLoading ? 'Creating...' : 'Generate Image'}
        </button>
      </form>
      
      {error && <ErrorMessage message={error} />}

      <div className="flex justify-center items-center mt-6 min-h-[400px] bg-gray-800 rounded-lg p-4">
        {isLoading && <LoadingSpinner message="Painting pixels..." />}
        
        {imageUrl && !isLoading && (
          <img 
            src={imageUrl} 
            alt={prompt} 
            className="rounded-lg shadow-xl max-w-full h-auto max-h-[512px] object-contain animate-fade-in"
          />
        )}
        
        {!isLoading && !imageUrl && (
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Your generated image will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

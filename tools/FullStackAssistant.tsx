import React, { useState, useCallback } from 'react';
import { generateFullStackCode } from '../services/geminiService';
import { pushToGithub } from '../services/githubService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import { GeneratedFileCard } from '../components/GeneratedFileCard';
import { FileTree } from '../components/FileTree';
import { GithubIcon } from '../constants';
import type { GeneratedFile } from '../types';

interface GitHubFile {
  path: string;
  type: 'blob' | 'tree';
}

export const FullStackAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // GitHub integration state
  const [githubToken, setGithubToken] = useState<string>('');
  const [repoPath, setRepoPath] = useState<string>(''); // e.g., 'owner/repo'
  const [commitMessage, setCommitMessage] = useState<string>('');
  const [fileTree, setFileTree] = useState<GitHubFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoadingRepo, setIsLoadingRepo] = useState<boolean>(false);
  const [isGithubSectionOpen, setIsGithubSectionOpen] = useState<boolean>(false);
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushSuccessMessage, setPushSuccessMessage] = useState<string | null>(null);


  const handleLoadRepo = useCallback(async () => {
    if (!githubToken.trim() || !repoPath.trim()) {
      setError("Please provide both a GitHub Personal Access Token and a repository path.");
      return;
    }
    setIsLoadingRepo(true);
    setError(null);
    setFileTree([]);
    setSelectedFiles(new Set());

    try {
      const response = await fetch(`https://api.github.com/repos/${repoPath}/git/trees/main?recursive=1`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch repository tree. Status: ${response.status}`);
      }
      const data = await response.json();
      if (data.truncated) {
        setError("Repository is too large to display all files. The file list is truncated.");
      }
      setFileTree(data.tree.filter((node: any) => node.type === 'blob'));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching the repository.");
    } finally {
      setIsLoadingRepo(false);
    }
  }, [githubToken, repoPath]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Please describe the application or feature you want to build.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedFiles(null);
    setPushSuccessMessage(null);
    setCommitMessage(`feat: Add feature based on prompt "${prompt.substring(0, 50)}..."`);

    let codeContext = '';
    try {
      if (selectedFiles.size > 0 && githubToken && repoPath) {
        const fileContents = await Promise.all(
          Array.from(selectedFiles).map(async (filePath) => {
            const response = await fetch(`https://api.github.com/repos/${repoPath}/contents/${filePath}`, {
              headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3.raw',
              }
            });
            if (!response.ok) {
              throw new Error(`Failed to fetch content for ${filePath}`);
            }
            const content = await response.text();
            return `// File: ${filePath}\n\n${content}\n\n---\n\n`;
          })
        );
        codeContext = fileContents.join('');
      }

      const files = await generateFullStackCode(prompt, codeContext);
      setGeneratedFiles(files);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedFiles, githubToken, repoPath]);
  
  const handlePushToGithub = useCallback(async () => {
    if (!generatedFiles || generatedFiles.length === 0) {
      setError("No files to push.");
      return;
    }
    if (!commitMessage.trim()) {
      setError("Please enter a commit message.");
      return;
    }
    if (!githubToken || !repoPath) {
        setError("GitHub token and repository path are required to push changes.");
        return;
    }

    setIsPushing(true);
    setError(null);
    setPushSuccessMessage(null);

    try {
      const result = await pushToGithub({
        token: githubToken,
        repoPath,
        files: generatedFiles,
        commitMessage,
      });
      setPushSuccessMessage(`Successfully pushed commit ${result.sha.substring(0, 7)} to main branch!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred during the push operation.");
    } finally {
      setIsPushing(false);
    }
  }, [generatedFiles, commitMessage, githubToken, repoPath]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* GitHub Integration Section */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <button
          onClick={() => setIsGithubSectionOpen(!isGithubSectionOpen)}
          className="w-full flex justify-between items-center p-4 text-left"
        >
          <div className="flex items-center space-x-3">
            <GithubIcon />
            <span className="text-lg font-semibold text-white">GitHub Context (Optional)</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transform transition-transform ${isGithubSectionOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isGithubSectionOpen && (
          <div className="p-4 border-t border-gray-700 space-y-4">
            <p className="text-sm text-gray-400">
              Provide a GitHub Personal Access Token and repository path to use existing files as context for code generation. The token is only used for this session and is not stored.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="GitHub Personal Access Token"
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={repoPath}
                onChange={(e) => setRepoPath(e.target.value)}
                placeholder="owner/repository-name"
                className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleLoadRepo}
              disabled={isLoadingRepo || !githubToken || !repoPath}
              className="w-full bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition"
            >
              {isLoadingRepo ? 'Loading Repository...' : 'Load Repository Files'}
            </button>
            {fileTree.length > 0 && (
              <div className="max-h-60 overflow-y-auto bg-gray-900 p-3 rounded-md border border-gray-600">
                <p className="text-sm font-medium text-gray-300 mb-2">Select files to provide as context:</p>
                <FileTree
                  files={fileTree}
                  selectedFiles={selectedFiles}
                  onSelectionChange={setSelectedFiles}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                Application / Feature Description
            </label>
            <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A simple todo list application with a React frontend and a Node.js/Express backend that saves todos to a JSON file."
                className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-y"
                rows={4}
                disabled={isLoading}
            />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || isLoadingRepo || isPushing}
          className="w-full bg-indigo-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-900 disabled:cursor-not-allowed transition duration-300 flex items-center justify-center"
        >
          {isLoading ? 'Architecting...' : 'Generate Full Stack'}
        </button>
      </form>
      
      {error && <ErrorMessage message={error} />}
      
      {pushSuccessMessage && (
        <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-lg" role="alert">
          {pushSuccessMessage}
        </div>
      )}

      {isLoading && <LoadingSpinner message="Building your application files..." />}

      {generatedFiles && (
        <div className="space-y-6 animate-fade-in">
          <h3 className="text-2xl font-bold text-white">Generated Files</h3>
          {generatedFiles.map((file, index) => (
            <GeneratedFileCard key={index} file={file} />
          ))}
          
          {isGithubSectionOpen && githubToken && repoPath && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
              <h4 className="text-xl font-semibold text-white">Push Changes to GitHub</h4>
              <div>
                <label htmlFor="commitMessage" className="block text-sm font-medium text-gray-300 mb-2">Commit Message</label>
                <input
                  id="commitMessage"
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="e.g., feat: Implement new user dashboard"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  disabled={isPushing}
                />
              </div>
              <button
                onClick={handlePushToGithub}
                disabled={isPushing || isLoading}
                className="w-full bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-green-900 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
              >
                <GithubIcon />
                <span>{isPushing ? 'Pushing to main...' : 'Push to main'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
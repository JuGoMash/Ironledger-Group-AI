import type { GeneratedFile } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

interface PushToGithubOptions {
  token: string;
  repoPath: string; // "owner/repo"
  files: GeneratedFile[];
  commitMessage: string;
  branch?: string;
}

const apiFetch = async (url: string, token: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`GitHub API Error: ${errorData.message || `Status ${response.status}`}`);
  }
  return response.json();
};

export const pushToGithub = async ({
  token,
  repoPath,
  files,
  commitMessage,
  branch = 'main',
}: PushToGithubOptions) => {
  const [owner, repo] = repoPath.split('/');

  // 1. Get the latest commit SHA of the branch
  const refData = await apiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${branch}`, token);
  const latestCommitSha = refData.object.sha;

  // 2. Get the tree SHA from that commit
  const commitData = await apiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, token);
  const baseTreeSha = commitData.tree.sha;

  // 3. Create a blob for each file
  const fileBlobs = await Promise.all(
    files.map(async (file) => {
      const blobData = await apiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/blobs`, token, {
        method: 'POST',
        body: JSON.stringify({
          content: file.code,
          encoding: 'utf-8',
        }),
      });
      return {
        path: file.fileName,
        mode: '100644', // file
        type: 'blob',
        sha: blobData.sha,
      };
    })
  );

  // 4. Create a new tree with the new file blobs
  const newTreeData = await apiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees`, token, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: baseTreeSha,
      tree: fileBlobs,
    }),
  });

  // 5. Create a new commit pointing to the new tree
  const newCommitData = await apiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits`, token, {
    method: 'POST',
    body: JSON.stringify({
      message: commitMessage,
      tree: newTreeData.sha,
      parents: [latestCommitSha],
    }),
  });
  
  // 6. Update the branch reference to point to the new commit
  const updatedRefData = await apiFetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${branch}`, token, {
    method: 'PATCH',
    body: JSON.stringify({
      sha: newCommitData.sha,
    }),
  });

  return updatedRefData;
};
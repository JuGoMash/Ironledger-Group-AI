import React, { useCallback } from 'react';

interface GitHubFile {
  path: string;
  type: 'blob' | 'tree';
}

interface FileTreeProps {
  files: GitHubFile[];
  selectedFiles: Set<string>;
  onSelectionChange: (newSelection: Set<string>) => void;
}

const isTextFile = (fileName: string): boolean => {
  const nonTextExtensions = [
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg',
    '.mp4', '.mov', '.avi', '.webm',
    '.mp3', '.wav', '.ogg',
    '.zip', '.gz', '.tar', '.rar',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.eot', '.ttf', '.woff', '.woff2'
  ];
  return !nonTextExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

export const FileTree: React.FC<FileTreeProps> = ({ files, selectedFiles, onSelectionChange }) => {

  const handleCheckboxChange = useCallback((filePath: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(filePath)) {
      newSelection.delete(filePath);
    } else {
      newSelection.add(filePath);
    }
    onSelectionChange(newSelection);
  }, [selectedFiles, onSelectionChange]);

  const filteredFiles = files.filter(file => isTextFile(file.path));

  return (
    <div className="space-y-2">
      {filteredFiles.map((file) => (
        <div key={file.path} className="flex items-center">
          <label className="flex items-center space-x-2 cursor-pointer text-sm text-gray-300 hover:text-white">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 rounded text-indigo-600 focus:ring-indigo-500"
              checked={selectedFiles.has(file.path)}
              onChange={() => handleCheckboxChange(file.path)}
            />
            <span>{file.path}</span>
          </label>
        </div>
      ))}
    </div>
  );
};
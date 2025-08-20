
import React from 'react';
import type { Tool, ToolId } from '../types';

interface SidebarProps {
  tools: Tool[];
  activeToolId: ToolId;
  onSelectTool: (id: ToolId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tools, activeToolId, onSelectTool }) => {
  return (
    <aside className="w-64 bg-gray-800 p-4 flex flex-col border-r border-gray-700">
      <div className="flex items-center space-x-2 mb-8">
        <div className="bg-indigo-500 p-2 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">IRONLEDGER GROUP</h2>
      </div>
      <nav className="flex flex-col space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-colors duration-200 ${
              activeToolId === tool.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className={activeToolId === tool.id ? 'text-white' : 'text-gray-400'}>{tool.icon}</span>
            <span className="font-medium">{tool.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};
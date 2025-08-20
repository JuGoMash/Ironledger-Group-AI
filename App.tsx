import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { PostGenerator } from './tools/PostGenerator';
import { ImageGenerator } from './tools/ImageGenerator';
import { ProspectingTool } from './tools/ProspectingTool';
import { FactChecker } from './tools/FactChecker';
import { FullStackAssistant } from './tools/FullStackAssistant';
import { Tool, ToolId } from './types';
import { TOOLS } from './constants';

const App: React.FC = () => {
  const [activeToolId, setActiveToolId] = useState<ToolId>(TOOLS[0].id);

  const handleSelectTool = useCallback((toolId: ToolId) => {
    setActiveToolId(toolId);
  }, []);

  const renderActiveTool = () => {
    switch (activeToolId) {
      case 'post-generator':
        return <PostGenerator />;
      case 'image-generator':
        return <ImageGenerator />;
      case 'prospecting-tool':
        return <ProspectingTool />;
      case 'fact-checker':
        return <FactChecker />;
      case 'full-stack-assistant':
        return <FullStackAssistant />;
      default:
        return <PostGenerator />;
    }
  };
  
  const activeTool = TOOLS.find(t => t.id === activeToolId) as Tool;

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      <Sidebar tools={TOOLS} activeToolId={activeToolId} onSelectTool={handleSelectTool} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-gray-800 shadow-md p-4 z-10 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{activeTool.icon}</span>
            <h1 className="text-2xl font-bold text-white">{activeTool.name}</h1>
          </div>
          <p className="text-sm text-gray-400 mt-1">{activeTool.description}</p>
        </header>
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderActiveTool()}
        </div>
      </main>
    </div>
  );
};

export default App;
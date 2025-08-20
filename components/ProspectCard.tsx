import React from 'react';
import type { Prospect } from '../types';

interface ProspectCardProps {
  prospect: Prospect;
}

const isUrl = (str: string) => {
    try {
        new URL(str);
        return true;
    } catch (_) {
        return false;
    }
};


export const ProspectCard: React.FC<ProspectCardProps> = ({ prospect }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-indigo-500/20 border border-gray-700">
      <div className="p-5">
        <h3 className="text-xl font-bold text-indigo-400 truncate">{prospect.name}</h3>
        <p className="text-gray-300 font-medium">{prospect.specialty}</p>
        
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3 text-sm">
            <div className="flex items-center space-x-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{prospect.location}</span>
            </div>
             <div className="flex items-start space-x-2 text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {isUrl(prospect.contact) ? (
                     <a href={prospect.contact} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 break-all">{prospect.contact}</a>
                ) : (
                    <span className="break-all">{prospect.contact}</span>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};
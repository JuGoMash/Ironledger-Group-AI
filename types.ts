import type { ReactNode } from 'react';

export type ToolId = 'post-generator' | 'image-generator' | 'prospecting-tool' | 'fact-checker' | 'full-stack-assistant';

export interface Tool {
  id: ToolId;
  name: string;
  description: string;
  icon: ReactNode;
}

export interface Prospect {
  name: string;
  specialty: string;
  location: string;
  contact: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  }
}

export interface FactCheckResult {
  answer: string;
  sources: GroundingChunk[];
}

export interface GeneratedFile {
  fileName: string;
  code: string;
}
import type { AgentState } from '../types';
import { Loader2 } from 'lucide-react';

interface VoiceVisualizerProps {
  state: AgentState;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ state }) => {
  return (
    <div className="flex items-center justify-center h-64 sm:h-96">
      <div className="relative">
        {state === 'connecting' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <p className="text-sm text-subtext">Connecting...</p>
          </div>
        )}

        {state === 'error' && (
          <div className="w-32 h-32 rounded-full bg-error flex items-center justify-center">
            <span className="text-white text-xl">!</span>
          </div>
        )}

        {state === 'idle' && (
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white" />
          </div>
        )}

        {state === 'listening' && (
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white shadow-lg animate-pulse" />
            <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary/20" />
          </div>
        )}

        {state === 'thinking' && (
          <div className="w-32 h-32 rounded-full bg-primary opacity-75 animate-pulse" />
        )}

        {state === 'speaking' && (
          <div className="relative flex items-center justify-center">
            <div className="absolute w-32 h-32 rounded-full bg-primary/30 animate-expand-ring" />
            <div className="absolute w-32 h-32 rounded-full bg-primary/30 animate-expand-ring animation-delay-700" />
            <div className="w-32 h-32 rounded-full bg-navy z-10" />
          </div>
        )}
      </div>
    </div>
  );
};

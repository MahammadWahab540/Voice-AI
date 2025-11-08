import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { formatTimestamp } from '../lib/utils';
import { cn } from '../lib/utils';

interface TranscriptionPanelProps {
  messages: Message[];
}

export const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-subtext">
        <p>Conversation will appear here...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn('flex flex-col gap-1', {
            'items-start': msg.speaker === 'agent',
            'items-end': msg.speaker === 'user',
          })}
        >
          <div
            className={cn('max-w-[80%] rounded-lg px-4 py-2', {
              'bg-muted text-navy': msg.speaker === 'agent',
              'bg-primary text-white': msg.speaker === 'user',
            })}
          >
            <p className="text-sm">{msg.text}</p>
          </div>
          <span className="text-xs text-subtext px-2">{formatTimestamp(msg.ts)}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

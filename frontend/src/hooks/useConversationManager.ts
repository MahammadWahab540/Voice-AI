import { useState, useCallback, useEffect } from 'react';
import type { AgentState, StageId, Message } from '../types';
import { storage } from '../lib/storage';
import { parseStageComplete } from '../lib/stageMachine';

export const useConversationManager = () => {
  const [state, setState] = useState<AgentState>('idle');
  const [muted, setMuted] = useState(false);
  const [currentStageId, setCurrentStageId] = useState<StageId>(() => storage.getStage());
  const [transcript, setTranscript] = useState<Message[]>(() => storage.getTranscript());

  useEffect(() => {
    storage.saveStage(currentStageId);
  }, [currentStageId]);

  useEffect(() => {
    storage.saveTranscript(transcript);
  }, [transcript]);

  const addMessage = useCallback((speaker: 'agent' | 'user', text: string) => {
    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      speaker,
      text,
      ts: Date.now(),
    };
    setTranscript((prev) => [...prev, message]);

    const nextStageId = parseStageComplete(text);
    if (nextStageId) {
      setCurrentStageId(nextStageId);
    }
  }, []);

  const connect = useCallback(() => {
    setState('connecting');
    setTimeout(() => {
      setState('listening');
      addMessage('agent', 'Namaste! Nenu Harshitha, NxtWave EdTech Company nunchi Registration Expert ni మాట్లాడుతున్నాను. How are you doing today?');
    }, 2000);
  }, [addMessage]);

  const mute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const handleUserText = useCallback((text: string) => {
    addMessage('user', text);
    setState('thinking');
    
    setTimeout(() => {
      setState('speaking');
      const responses = [
        'That\'s great to hear! Your child has successfully reserved a seat in our program.',
        'Let me explain the program value and how it can help your child\'s career.',
        'We offer both Full Payment and No-Cost EMI options for your convenience.',
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      setTimeout(() => {
        addMessage('agent', response);
        setState('listening');
      }, 1500);
    }, 1000);
  }, [addMessage]);

  const end = useCallback(() => {
    storage.setCompleted(true);
    storage.clear();
  }, []);

  useEffect(() => {
    if (storage.isCompleted()) {
      storage.reset();
      setCurrentStageId('INTRO');
      setTranscript([]);
    } else {
      connect();
    }
  }, [connect]);

  return {
    state,
    muted,
    currentStageId,
    transcript,
    mute,
    end,
    handleUserText,
  };
};

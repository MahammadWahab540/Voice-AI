import { useState, useCallback, useEffect, useRef } from 'react';
import type { AgentState, StageId, Message } from '../types';
import { storage } from '../lib/storage';
import { parseStageComplete, getNextStageId } from '../lib/stageMachine';

export const useConversationManager = () => {
  const [state, setState] = useState<AgentState>('idle');
  const [muted, setMuted] = useState(false);
  const [currentStageId, setCurrentStageId] = useState<StageId>(() => storage.getStage());
  const [transcript, setTranscript] = useState<Message[]>(() => storage.getTranscript());
  const isInitialized = useRef(false);

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

  const getStageResponse = useCallback((stageId: StageId, includeCompletion: boolean = true): string => {
    const responses: Record<StageId, string> = {
      INTRO: 'Namaste! Nenu Harshitha, NxtWave EdTech Company nunchi Registration Expert ni మాట్లాడుతున్నాను. Your child has successfully reserved a seat in our program. Would you have 10 minutes to discuss this?',
      PROGRAM_VALUE_L1: 'Let me explain the program value. NxtWave provides industry-ready skills through hands-on learning, IDP, and Growth Cycles with dedicated Success Coaches.',
      PAYMENT_STRUCTURE: 'For payment, we offer two options: Full Payment with discounts, or No-Cost EMI through our NBFC partners with zero interest.',
      NBFC: 'Our NBFC partners like Varthana and Bajaj Finserv are RBI-approved and offer No-Cost EMI - you pay no interest, just small monthly installments with no collateral needed.',
      RCA: 'For No-Cost EMI, we need a co-applicant - typically a parent. We will need PAN, Aadhaar, bank proof, and a consent video.',
      KYC: 'For KYC, please submit: PAN card, Aadhaar card, bank statement, recent photo, and a short consent video following our script.',
      END_FLOW: 'Thank you for your time today! We have covered all the important aspects. Please submit your documents to confirm your child\'s seat and benefits.',
    };

    const nextStage = getNextStageId(stageId);
    const baseResponse = responses[stageId] || 'Thank you for your response.';
    
    if (includeCompletion && nextStage) {
      return `${baseResponse} [STAGE_COMPLETE:${nextStage}]`;
    }
    return baseResponse;
  }, []);

  const connect = useCallback(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    setState('connecting');
    setTimeout(() => {
      setState('listening');
      if (transcript.length === 0) {
        addMessage('agent', getStageResponse('INTRO', false));
      }
    }, 2000);
  }, [addMessage, getStageResponse, transcript.length]);

  const mute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  const handleUserText = useCallback((text: string) => {
    addMessage('user', text);
    setState('thinking');
    
    setTimeout(() => {
      setState('speaking');
      
      setTimeout(() => {
        const response = getStageResponse(currentStageId);
        addMessage('agent', response);
        setState('listening');
      }, 1500);
    }, 1000);
  }, [addMessage, currentStageId, getStageResponse]);

  const end = useCallback(() => {
    storage.setCompleted(true);
    storage.clear();
  }, []);

  useEffect(() => {
    if (storage.isCompleted()) {
      storage.reset();
      setCurrentStageId('INTRO');
      setTranscript([]);
    }
    connect();
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

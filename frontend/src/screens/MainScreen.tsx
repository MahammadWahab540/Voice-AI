import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../components/Stepper';
import { VoiceVisualizer } from '../components/VoiceVisualizer';
import { TranscriptionPanel } from '../components/TranscriptionPanel';
import { Controls } from '../components/Controls';
import { useConversationManager } from '../hooks/useConversationManager';
import { storage } from '../lib/storage';
import { formatPhone, getInitials } from '../lib/utils';

export const MainScreen = () => {
  const navigate = useNavigate();
  const user = storage.getUser();
  
  const { state, muted, currentStageId, transcript, mute, end } =
    useConversationManager();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        mute();
      } else if (e.key === 'e' || e.key === 'E') {
        end();
        navigate('/auth');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [user, navigate, mute, end]);

  if (!user) {
    return null;
  }

  const handleEndCall = () => {
    end();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              N
            </div>
            <span className="font-heading font-semibold text-lg text-navy hidden sm:block">
              NxtWave
            </span>
          </div>

          <div className="flex-1 max-w-3xl mx-4 hidden md:block">
            <Stepper activeId={currentStageId} />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
                {getInitials(user.name)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-navy">{user.name}</p>
                <p className="text-xs text-subtext">{formatPhone(user.phone)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:hidden px-4 pb-3">
          <Stepper activeId={currentStageId} />
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          <div className="bg-white rounded-lg shadow-md p-6 order-2 lg:order-1">
            <h2 className="font-heading font-semibold text-lg mb-4 text-navy">
              Conversation
            </h2>
            <div className="h-96 lg:h-[calc(100vh-16rem)]">
              <TranscriptionPanel messages={transcript} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 order-1 lg:order-2">
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <VoiceVisualizer state={state} />
              </div>
              <Controls muted={muted} onMuteToggle={mute} onEndCall={handleEndCall} />
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2">
        <Controls muted={muted} onMuteToggle={mute} onEndCall={handleEndCall} />
      </div>
    </div>
  );
};

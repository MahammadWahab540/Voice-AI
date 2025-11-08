import { useState } from 'react';
import { Button } from './ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/Dialog';
import { Mic, MicOff, Phone } from 'lucide-react';

interface ControlsProps {
  muted: boolean;
  onMuteToggle: () => void;
  onEndCall: () => void;
}

export const Controls: React.FC<ControlsProps> = ({ muted, onMuteToggle, onEndCall }) => {
  const [showEndDialog, setShowEndDialog] = useState(false);

  const handleEndCall = () => {
    setShowEndDialog(false);
    onEndCall();
  };

  return (
    <>
      <div className="flex items-center justify-center gap-4 p-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onMuteToggle}
          className="rounded-full w-14 h-14 p-0"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={() => setShowEndDialog(true)}
          className="rounded-full w-14 h-14 p-0"
          title="End Call"
        >
          <Phone className="w-6 h-6 rotate-[135deg]" />
        </Button>
      </div>

      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Call?</DialogTitle>
          </DialogHeader>
          <p className="text-subtext">Are you sure you want to end the onboarding call?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleEndCall}>
              End Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

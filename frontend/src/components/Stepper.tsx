import type { StageId } from '../types';
import { STAGES } from '../types';
import { getStageIndex } from '../lib/stageMachine';
import { cn } from '../lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  activeId: StageId;
}

export const Stepper: React.FC<StepperProps> = ({ activeId }) => {
  const activeIndex = getStageIndex(activeId);

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-4">
      {STAGES.map((stage, index) => {
        const isCompleted = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isUpcoming = index > activeIndex;

        return (
          <div key={stage.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  {
                    'bg-primary text-white': isCompleted || isCurrent,
                    'bg-muted text-subtext': isUpcoming,
                  }
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span
                className={cn('text-xs font-medium whitespace-nowrap', {
                  'text-primary': isCurrent,
                  'text-navy': isCompleted,
                  'text-subtext': isUpcoming,
                })}
              >
                {stage.title}
              </span>
            </div>
            {index < STAGES.length - 1 && (
              <div
                className={cn('w-8 h-0.5 mx-2 mb-6 transition-colors', {
                  'bg-primary': isCompleted,
                  'bg-muted': !isCompleted,
                })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

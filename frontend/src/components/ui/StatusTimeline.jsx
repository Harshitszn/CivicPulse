import React from 'react';
import { CheckCircle2, Clock3, AlertCircle, ShieldCheck, UserCheck, Wrench, CheckCheck } from 'lucide-react';

const STATUS_STAGES = [
  { id: 'reported', key: 'open', label: 'Reported', description: 'Complaint submitted by citizen', icon: Clock3 },
  { id: 'verified', key: 'verified', label: 'Verified', description: 'Inspected & validated by field officer', icon: ShieldCheck },
  { id: 'assigned', key: 'assigned', label: 'Assigned', description: 'Dispatched to responsible department', icon: UserCheck },
  { id: 'in_progress', key: 'in_progress', label: 'In Progress', description: 'Active repair or resolution underway', icon: Wrench },
  { id: 'resolved', key: 'resolved', label: 'Resolved', description: 'Work completed and issue closed', icon: CheckCheck },
];

/**
 * Maps current complaint status to stage index (0 to 4)
 */
export function getStatusStageIndex(status) {
  switch (status) {
    case 'open':
    case 'reported':
      return 0;
    case 'verified':
      return 1;
    case 'assigned':
    case 'acknowledged':
      return 2;
    case 'in_progress':
      return 3;
    case 'resolved':
    case 'closed':
      return 4;
    default:
      return 0;
  }
}

/**
 * Reusable Status Timeline Component
 */
export default function StatusTimeline({
  currentStatus = 'open',
  timestamps = {},
  compact = false,
  className = '',
}) {
  const currentIndex = getStatusStageIndex(currentStatus);

  // Compact horizontal progress stepper mode
  if (compact) {
    const progressPct = Math.round(((currentIndex + 1) / STATUS_STAGES.length) * 100);
    const activeStage = STATUS_STAGES[currentIndex];

    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-secondary-600 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
            Stage {currentIndex + 1}/5: <strong className="text-secondary-900">{activeStage?.label}</strong>
          </span>
          <span className="font-bold text-primary-700 font-mono">{progressPct}%</span>
        </div>

        {/* 5 Stepper Blocks */}
        <div className="grid grid-cols-5 gap-1">
          {STATUS_STAGES.map((stage, idx) => {
            const isDone = idx < currentIndex;
            const isCurrent = idx === currentIndex;

            return (
              <div
                key={stage.id}
                title={`${stage.label} (${isDone ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'})`}
                className={`h-1.5 rounded-full transition-all duration-normal ${
                  isDone
                    ? 'bg-primary-600'
                    : isCurrent
                    ? 'bg-primary-500 ring-2 ring-primary-200'
                    : 'bg-secondary-200'
                }`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // Full Vertical Detailed Timeline Mode
  return (
    <div className={`bg-surface border border-secondary-200 rounded-xl p-5 shadow-card ${className}`}>
      <div className="flex items-center justify-between border-b border-secondary-100 pb-3 mb-4">
        <h3 className="text-xs font-bold text-secondary-800 uppercase tracking-wide flex items-center gap-2">
          <Clock3 size={15} className="text-primary-600" />
          Complaint Status Timeline
        </h3>
        <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
          Stage {currentIndex + 1} of 5
        </span>
      </div>

      <div className="relative pl-2">
        {STATUS_STAGES.map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;

          // Default mock timestamps if not provided
          const stageTime = timestamps[stage.id] || (
            isDone ? 'Completed' : isCurrent ? 'Active Stage' : 'Pending'
          );

          const StageIcon = stage.icon;

          return (
            <div key={stage.id} className="flex items-start gap-4 mb-5 last:mb-0 relative group">
              {/* Connecting vertical line */}
              {idx < STATUS_STAGES.length - 1 && (
                <div
                  className={`absolute left-[15px] top-[28px] bottom-[-20px] w-0.5 transition-colors ${
                    idx < currentIndex ? 'bg-primary-600' : 'bg-secondary-200'
                  }`}
                />
              )}

              {/* Status Circle / Node */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-normal ${
                  isDone
                    ? 'bg-primary-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100 shadow-sm animate-pulse'
                    : 'bg-secondary-100 text-secondary-400 border border-secondary-200'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <StageIcon size={15} />
                )}
              </div>

              {/* Status Label & Timestamp */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-primary-700 text-sm'
                        : isDone
                        ? 'text-secondary-900'
                        : 'text-secondary-400'
                    }`}
                  >
                    {stage.label}
                  </h4>

                  <span
                    className={`text-[11px] font-medium ${
                      isCurrent
                        ? 'text-primary-600 font-semibold'
                        : isDone
                        ? 'text-secondary-500'
                        : 'text-secondary-300'
                    }`}
                  >
                    {stageTime}
                  </span>
                </div>

                <p
                  className={`text-[11px] mt-0.5 leading-normal ${
                    isCurrent
                      ? 'text-secondary-700 font-medium'
                      : isDone
                      ? 'text-secondary-500'
                      : 'text-secondary-400'
                  }`}
                >
                  {stage.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

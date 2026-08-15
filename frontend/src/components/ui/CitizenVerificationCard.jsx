import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
import { usePincode } from '../../context/PincodeContext';

export default function CitizenVerificationCard({ complaintId, status, className = '' }) {
  const { getComplaintVerification, submitVerification } = usePincode();
  const [submittingType, setSubmittingType] = useState(null);

  // Show ONLY when status is 'in_progress' or 'resolved' or 'closed'
  const isTriggered = status === 'in_progress' || status === 'resolved' || status === 'closed';
  if (!isTriggered) return null;

  const {
    confirmedCount,
    notConfirmedCount,
    totalResponses,
    confirmationPct,
    userResponse,
  } = getComplaintVerification(complaintId);

  const handleConfirm = async () => {
    setSubmittingType('confirmed');
    await new Promise((r) => setTimeout(r, 400));
    submitVerification(complaintId, 'confirmed');
    setSubmittingType(null);
  };

  const handleUnresolved = async () => {
    setSubmittingType('unresolved');
    await new Promise((r) => setTimeout(r, 400));
    submitVerification(complaintId, 'unresolved');
    setSubmittingType(null);
  };

  return (
    <div className={`bg-surface border border-secondary-200 rounded-xl p-5 shadow-card space-y-4 ${className}`}>
      {/* Header & Prompt */}
      <div className="flex items-start justify-between gap-3 border-b border-secondary-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-700">
            <ShieldCheck size={16} className="text-primary-600" />
            <span>Citizen Status Verification</span>
          </div>
          <h3 className="text-sm font-bold text-secondary-900 leading-tight">
            Does this status accurately reflect the situation?
          </h3>
        </div>

        {/* Confirmation % Badge */}
        {totalResponses > 0 && (
          <div className="text-right flex-shrink-0 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200">
            <span className="text-sm font-extrabold text-primary-700 block leading-tight">
              {confirmationPct}%
            </span>
            <span className="text-[9px] font-bold text-secondary-500 uppercase tracking-tighter block">
              Community Confirmed
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleConfirm}
            disabled={!!submittingType}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed ${
              userResponse === 'confirmed'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-95'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {submittingType === 'confirmed' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCircle2 size={15} />
            )}
            <span>{userResponse === 'confirmed' ? 'Confirmed ✓' : 'Yes, confirmed'}</span>
          </button>

          <button
            onClick={handleUnresolved}
            disabled={!!submittingType}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed ${
              userResponse === 'unresolved'
                ? 'bg-red-600 text-white border-red-600 shadow-sm scale-95'
                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
            }`}
          >
            {submittingType === 'unresolved' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <AlertTriangle size={15} />
            )}
            <span>{userResponse === 'unresolved' ? 'Flagged ⚠' : 'No, still unresolved'}</span>
          </button>
        </div>

        {/* Response acknowledgement */}
        {userResponse && !submittingType && (
          <p className="text-[11px] font-medium text-center pt-1">
            {userResponse === 'confirmed' ? (
              <span className="text-emerald-700 font-semibold">✓ You confirmed this municipal status as accurate.</span>
            ) : (
              <span className="text-red-700 font-semibold">⚠ You flagged this issue as still unresolved.</span>
            )}
          </p>
        )}
      </div>

      {/* Verification Metrics Breakdown */}
      <div className="bg-secondary-50 p-3 rounded-lg border border-secondary-200 flex items-center justify-between text-xs text-secondary-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <ThumbsUp size={13} className="text-emerald-600" />
            Confirmed: <strong>{confirmedCount}</strong>
          </span>

          <span className="flex items-center gap-1 font-semibold text-red-800">
            <ThumbsDown size={13} className="text-red-600" />
            Not Confirmed: <strong>{notConfirmedCount}</strong>
          </span>
        </div>

        <span className="text-[11px] font-bold text-secondary-400">
          {totalResponses} total response{totalResponses === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}


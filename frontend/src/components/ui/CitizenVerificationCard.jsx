import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, AlertTriangle, ShieldCheck, ThumbsUp, ThumbsDown,
  Loader2, RefreshCw, Lock, Flag, XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePincode } from '../../context/PincodeContext';
import ApiClient from '../../services/api';

/**
 * CitizenVerificationCard
 *
 * Shows only for RESOLVED and IN_PROGRESS complaints.
 * Citizens from the same pincode may confirm resolution or flag it as still unresolved.
 *
 * Rules (enforced on backend):
 *  - One vote per user per complaint (updatable)
 *  - Must be a registered resident of the complaint's pincode
 *  - Cannot verify your own complaint
 *  - If ≥3 citizens & ≥60% say NOT_RESOLVED → complaint is flagged for municipal review
 *    (status is NOT automatically reverted)
 */
export default function CitizenVerificationCard({
  complaintId,
  complaintPincode,
  status,
  className = '',
}) {
  const { currentUser } = useAuth();
  const { registeredPincode } = usePincode();

  // Only show for RESOLVED or IN_PROGRESS
  const resolvedStatuses = ['RESOLVED', 'resolved', 'IN_PROGRESS', 'in_progress', 'closed'];
  if (!resolvedStatuses.includes(status)) return null;

  // ── State ────────────────────────────────────────────────────────────────
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null); // 'RESOLVED' | 'NOT_RESOLVED' | 'withdraw'
  const [error, setError] = useState(null);

  // ── Fetch verification status ─────────────────────────────────────────────
  const fetchStatus = useCallback(async () => {
    if (!complaintId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.getVerificationStatus(complaintId);
      setData(res);
    } catch (err) {
      // If not logged in, endpoint still returns public aggregates
      setError(null);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // ── Eligibility ───────────────────────────────────────────────────────────
  const isLoggedIn = Boolean(ApiClient.getToken() && currentUser);
  const userPin = currentUser?.pincode || registeredPincode;
  const isEligible = complaintPincode
    ? String(userPin).trim() === String(complaintPincode).trim()
    : false;

  // Current user's response from API
  const userResult = data?.user_verification?.result || null; // 'RESOLVED' | 'NOT_RESOLVED' | null

  // Aggregate counts
  const confirmedCount = data?.confirmedCount ?? 0;
  const disputedCount = data?.disputedCount ?? 0;
  const totalResponses = data?.totalResponses ?? 0;
  const confirmationPct = data?.confirmationPct ?? 0;
  const disputePct = data?.disputePct ?? 0;
  const flaggedForReview = data?.flagged_for_review ?? false;

  const thresholdCount = data?.review_threshold?.min_dispute_count ?? 3;
  const thresholdPct = data?.review_threshold?.min_dispute_pct ?? 60;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleVote = async (result) => {
    if (!isLoggedIn || !isEligible || submitting) return;

    // If clicking the same option, withdraw instead
    if (userResult === result) {
      await handleWithdraw();
      return;
    }

    setSubmitting(result);
    try {
      const res = await ApiClient.submitVerification(complaintId, result);
      setData((prev) => ({
        ...prev,
        ...(res?.aggregates || {}),
        user_verification: res?.verification
          ? { result: res.verification.result, is_confirmed_resolved: res.verification.is_confirmed_resolved }
          : prev?.user_verification,
        flagged_for_review: res?.aggregates?.flagged_for_review ?? prev?.flagged_for_review,
      }));
    } catch (err) {
      setError(err.message || 'Failed to submit verification');
    } finally {
      setSubmitting(null);
    }
  };

  const handleWithdraw = async () => {
    if (!isLoggedIn || submitting) return;
    setSubmitting('withdraw');
    try {
      const res = await ApiClient.withdrawVerification(complaintId);
      setData((prev) => ({
        ...prev,
        ...(res?.aggregates || {}),
        user_verification: null,
        flagged_for_review: res?.aggregates?.flagged_for_review ?? false,
      }));
    } catch (err) {
      setError(err.message || 'Failed to withdraw');
    } finally {
      setSubmitting(null);
    }
  };

  // ── Progress bar fill ─────────────────────────────────────────────────────
  const resolvedBarW = totalResponses > 0 ? `${confirmationPct}%` : '0%';
  const disputeBarW  = totalResponses > 0 ? `${disputePct}%` : '0%';

  return (
    <div className={`bg-surface border rounded-xl p-5 shadow-card space-y-4 ${
      flaggedForReview ? 'border-amber-400 bg-amber-50/30' : 'border-secondary-200'
    } ${className}`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-secondary-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary-700">
            <ShieldCheck size={16} className="text-primary-600" />
            <span>Citizen Resolution Verification</span>
          </div>
          <h3 className="text-sm font-bold text-secondary-900 leading-tight">
            {status?.toUpperCase() === 'RESOLVED' || status?.toLowerCase() === 'resolved'
              ? 'Has this issue been resolved?'
              : 'Is this issue progressing as expected?'}
          </h3>
          <p className="text-[11px] text-secondary-500">
            Only registered residents of PIN: <strong>{complaintPincode}</strong> may respond.
          </p>
        </div>

        {/* Aggregate badge */}
        {totalResponses > 0 && (
          <div className="text-right flex-shrink-0 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200">
            <span className="text-sm font-extrabold text-primary-700 block leading-tight">
              {confirmationPct}%
            </span>
            <span className="text-[9px] font-bold text-secondary-500 uppercase tracking-tighter block">
              Confirmed
            </span>
          </div>
        )}
      </div>

      {/* Municipal Review Flag Banner */}
      {flaggedForReview && (
        <div className="flex items-start gap-2 bg-amber-100 border border-amber-300 rounded-lg px-3 py-2.5 text-xs">
          <Flag size={14} className="text-amber-700 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-extrabold text-amber-900">Flagged for Municipal Review</p>
            <p className="text-amber-800 mt-0.5">
              {disputedCount} citizen{disputedCount !== 1 ? 's' : ''} ({disputePct}%) reported this issue
              is still unresolved. Municipal staff have been notified for re-inspection.
            </p>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center py-6 gap-2 text-xs text-secondary-400">
          <Loader2 size={15} className="animate-spin" />
          <span>Loading community responses…</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Vote Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {/* RESOLVED button */}
            <button
              onClick={() => handleVote('RESOLVED')}
              disabled={!isLoggedIn || !isEligible || !!submitting}
              className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all min-h-[44px] disabled:cursor-not-allowed ${
                userResult === 'RESOLVED'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[0.97]'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 disabled:opacity-50'
              }`}
              title={
                !isLoggedIn ? 'Log in to verify'
                  : !isEligible ? `Only PIN ${complaintPincode} residents can verify`
                  : userResult === 'RESOLVED' ? 'Click to withdraw your confirmation'
                  : 'Confirm this is resolved'
              }
            >
              {submitting === 'RESOLVED' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <CheckCircle2 size={15} />
              )}
              <span>{userResult === 'RESOLVED' ? 'Confirmed ✓' : 'Yes, resolved'}</span>
            </button>

            {/* NOT_RESOLVED button */}
            <button
              onClick={() => handleVote('NOT_RESOLVED')}
              disabled={!isLoggedIn || !isEligible || !!submitting}
              className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all min-h-[44px] disabled:cursor-not-allowed ${
                userResult === 'NOT_RESOLVED'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm scale-[0.97]'
                  : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100 disabled:opacity-50'
              }`}
              title={
                !isLoggedIn ? 'Log in to verify'
                  : !isEligible ? `Only PIN ${complaintPincode} residents can verify`
                  : userResult === 'NOT_RESOLVED' ? 'Click to withdraw your dispute'
                  : 'Report this issue is NOT resolved'
              }
            >
              {submitting === 'NOT_RESOLVED' ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <AlertTriangle size={15} />
              )}
              <span>{userResult === 'NOT_RESOLVED' ? 'Flagged ⚠' : 'No, still open'}</span>
            </button>
          </div>

          {/* User response acknowledgement + withdraw link */}
          {userResult && !submitting && (
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <p className="font-medium">
                {userResult === 'RESOLVED' ? (
                  <span className="text-emerald-700 font-semibold">✓ You confirmed this as resolved.</span>
                ) : (
                  <span className="text-red-700 font-semibold">⚠ You flagged this as still unresolved.</span>
                )}
              </p>
              <button
                onClick={handleWithdraw}
                disabled={!!submitting}
                className="text-secondary-400 hover:text-secondary-600 flex items-center gap-1 font-semibold ml-3 transition-colors"
              >
                {submitting === 'withdraw' ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
                Withdraw
              </button>
            </div>
          )}

          {/* Ineligible / not logged in notice */}
          {!isLoggedIn && (
            <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 flex items-center gap-1.5">
              <Lock size={11} className="text-amber-600 flex-shrink-0" />
              <span>Log in as a resident of PIN <strong>{complaintPincode}</strong> to verify.</span>
            </p>
          )}
          {isLoggedIn && !isEligible && (
            <p className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded border border-amber-200 flex items-center gap-1.5">
              <Lock size={11} className="text-amber-600 flex-shrink-0" />
              <span>Only residents of PIN <strong>{complaintPincode}</strong> can verify. (Your PIN: {userPin})</span>
            </p>
          )}

          {/* Error notice */}
          {error && (
            <p className="text-[11px] text-red-700 bg-red-50 px-2.5 py-1.5 rounded border border-red-200">
              {error}
            </p>
          )}

          {/* Verification Progress Bars + Counts */}
          <div className="space-y-2 pt-1">
            {/* Resolved bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                  <ThumbsUp size={11} className="text-emerald-600" />
                  Confirmed Resolved
                </span>
                <span className="text-[11px] font-bold text-emerald-700">{confirmedCount} ({confirmationPct}%)</span>
              </div>
              <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: resolvedBarW }}
                />
              </div>
            </div>

            {/* Disputed bar */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-red-800">
                  <ThumbsDown size={11} className="text-red-600" />
                  Still Unresolved
                </span>
                <span className="text-[11px] font-bold text-red-700">{disputedCount} ({disputePct}%)</span>
              </div>
              <div className="h-1.5 bg-secondary-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-400 rounded-full transition-all duration-500"
                  style={{ width: disputeBarW }}
                />
              </div>
            </div>

            {/* Total + review threshold info */}
            <div className="flex items-center justify-between text-[10px] text-secondary-400 pt-0.5">
              <span>{totalResponses} total response{totalResponses !== 1 ? 's' : ''} from local residents</span>
              <button
                onClick={fetchStatus}
                className="flex items-center gap-0.5 hover:text-secondary-600 transition-colors"
                title="Refresh results"
              >
                <RefreshCw size={10} />
                Refresh
              </button>
            </div>

            {/* Review threshold progress hint */}
            {disputedCount > 0 && !flaggedForReview && (
              <p className="text-[10px] text-secondary-400 italic">
                Municipal review triggered when ≥{thresholdCount} residents ({thresholdPct}%+) report unresolved.
                ({Math.max(0, thresholdCount - disputedCount)} more needed.)
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

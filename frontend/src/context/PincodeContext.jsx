import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import ApiClient from '../services/api';

const PincodeContext = createContext();

export function PincodeProvider({ children }) {
  const { toast } = useToast();
  const { currentUser: authUser } = useAuth();

  const registeredPincode = authUser?.pincode || null;

  const [globalPincode, setGlobalPincodeState] = useState(() => {
    try {
      return localStorage.getItem('civicpulse_global_pincode') || 'all';
    } catch {
      return 'all';
    }
  });

  const [areas, setAreas] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await ApiClient.getAreas();
        if (!cancelled && Array.isArray(list)) {
          setAreas(list);
        }
      } catch (err) {
        console.warn('Could not load municipal areas:', err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setGlobalPincode = (pincode) => {
    const clean = pincode ? String(pincode).trim() : 'all';
    setGlobalPincodeState(clean);
    try {
      localStorage.setItem('civicpulse_global_pincode', clean);
    } catch {
      /* UI preference only */
    }
  };

  const isEligibleToVote = (complaintPincode) => {
    if (!registeredPincode || !complaintPincode) return false;
    return String(registeredPincode).trim() === String(complaintPincode).trim();
  };

  const castVote = useCallback(async (complaintId, complaintPincode, targetAction) => {
    if (!isEligibleToVote(complaintPincode)) {
      toast.warning(`Only residents of pincode ${complaintPincode} can vote on this issue.`);
      return false;
    }

    const token = ApiClient.getToken();
    if (!token) {
      toast.info('Please log in with your registered account to cast a civic vote.');
      return false;
    }

    try {
      const voteType = targetAction === 'upvote' ? 'UPVOTE' : 'DOWNVOTE';
      const result = await ApiClient.voteComplaint(complaintId, voteType);
      const newVote = result.current_user_vote ? result.current_user_vote.toLowerCase() : null;

      if (newVote === 'upvote') {
        toast.success('Upvote recorded.');
      } else if (newVote === 'downvote') {
        toast.info('Downvote recorded.');
      } else {
        toast.info('Vote removed.');
      }

      return result;
    } catch (err) {
      toast.error(err.message || 'Voting failed');
      return false;
    }
  }, [registeredPincode, toast]);

  return (
    <PincodeContext.Provider
      value={{
        areas,
        registeredPincode,
        globalPincode,
        setGlobalPincode,
        selectedBrowsingPincode: globalPincode,
        setSelectedBrowsingPincode: setGlobalPincode,
        isEligibleToVote,
        castVote,
      }}
    >
      {children}
    </PincodeContext.Provider>
  );
}

export function usePincode() {
  const context = useContext(PincodeContext);
  if (!context) {
    throw new Error('usePincode must be used within a PincodeProvider');
  }
  return context;
}

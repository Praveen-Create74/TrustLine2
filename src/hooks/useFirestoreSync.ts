import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { CallRecord, AppSettings, SavedScanResult } from '../types';

export function useFirestoreSync(defaultSettings: AppSettings) {
  const { user } = useAuth();

  // Initialize state from local storage immediately to prevent flicker
  const [syncedRecords, setSyncedRecords] = useState<CallRecord[]>(() => {
    if (user) {
      try {
        const local = localStorage.getItem(`trustline_records_${user.uid}`);
        if (local) return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse local records', e);
      }
    }
    return [];
  });

  const [syncedScans, setSyncedScans] = useState<SavedScanResult[]>(() => {
    if (user) {
      try {
        const local = localStorage.getItem(`trustline_scans_${user.uid}`);
        if (local) return JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse local scans', e);
      }
    }
    return [];
  });

  const [syncedSettings, setSyncedSettings] = useState<AppSettings>(() => {
    if (user) {
      try {
        const local = localStorage.getItem(`trustline_settings_${user.uid}`);
        if (local) return { ...defaultSettings, ...JSON.parse(local) };
      } catch (e) {
        console.error('Failed to parse local settings', e);
      }
    }
    return defaultSettings;
  });

  const [isLoaded, setIsLoaded] = useState(false);

  // Handle session changes (e.g. login / logout)
  useEffect(() => {
    if (user) {
      // Reload local storage in case they just logged in
      try {
        const localSettings = localStorage.getItem(`trustline_settings_${user.uid}`);
        if (localSettings) setSyncedSettings({ ...defaultSettings, ...JSON.parse(localSettings) });
        
        const localRecords = localStorage.getItem(`trustline_records_${user.uid}`);
        if (localRecords) setSyncedRecords(JSON.parse(localRecords));
        
        const localScans = localStorage.getItem(`trustline_scans_${user.uid}`);
        if (localScans) setSyncedScans(JSON.parse(localScans));
      } catch (e) {
        console.error('Session local storage load error', e);
      }
    } else {
      // Clear state when logged out based on session management
      setSyncedRecords([]);
      setSyncedScans([]);
      setSyncedSettings(defaultSettings);
    }
  }, [user, defaultSettings]);

  // Handle Firestore syncing
  useEffect(() => {
    if (!user) {
      setIsLoaded(true);
      return;
    }

    const recordsRef = doc(db, 'users', user.uid, 'data', 'callHistory');
    const scansRef = doc(db, 'users', user.uid, 'data', 'scanHistory');
    const settingsRef = doc(db, 'users', user.uid, 'data', 'preferences');

    const unsubRecords = onSnapshot(recordsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().records || [];
        setSyncedRecords(data);
        localStorage.setItem(`trustline_records_${user.uid}`, JSON.stringify(data));
      }
    });

    const unsubScans = onSnapshot(scansRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().scans || [];
        setSyncedScans(data);
        localStorage.setItem(`trustline_scans_${user.uid}`, JSON.stringify(data));
      }
    });

    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Partial<AppSettings>;
        const mergedSettings = { ...defaultSettings, ...data };
        setSyncedSettings(mergedSettings);
        localStorage.setItem(`trustline_settings_${user.uid}`, JSON.stringify(mergedSettings));
      }
      setIsLoaded(true);
    });

    return () => {
      unsubRecords();
      unsubScans();
      unsubSettings();
    };
  }, [user, defaultSettings]);

  const updateRecords = useCallback((newRecords: CallRecord[] | ((prev: CallRecord[]) => CallRecord[])) => {
    setSyncedRecords(prev => {
      const updated = typeof newRecords === 'function' ? newRecords(prev) : newRecords;
      if (user) {
        localStorage.setItem(`trustline_records_${user.uid}`, JSON.stringify(updated));
        const sanitized = JSON.parse(JSON.stringify(updated));
        setDoc(doc(db, 'users', user.uid, 'data', 'callHistory'), { records: sanitized }, { merge: true })
          .catch(e => console.warn("Firestore sync error, but state saved locally", e));
      }
      return updated;
    });
  }, [user]);

  const updateScans = useCallback((newScans: SavedScanResult[] | ((prev: SavedScanResult[]) => SavedScanResult[])) => {
    setSyncedScans(prev => {
      const updated = typeof newScans === 'function' ? newScans(prev) : newScans;
      if (user) {
        localStorage.setItem(`trustline_scans_${user.uid}`, JSON.stringify(updated));
        const sanitized = JSON.parse(JSON.stringify(updated));
        setDoc(doc(db, 'users', user.uid, 'data', 'scanHistory'), { scans: sanitized }, { merge: true })
          .catch(e => console.warn("Firestore sync error, but state saved locally", e));
      }
      return updated;
    });
  }, [user]);

  const updateSettingsData = useCallback((newSettings: Partial<AppSettings> | ((prev: AppSettings) => Partial<AppSettings>)) => {
    setSyncedSettings(prev => {
      const partialSettings = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      const updated = { ...prev, ...partialSettings };
      if (user) {
        localStorage.setItem(`trustline_settings_${user.uid}`, JSON.stringify(updated));
        const sanitized = JSON.parse(JSON.stringify(updated));
        setDoc(doc(db, 'users', user.uid, 'data', 'preferences'), sanitized, { merge: true })
          .catch(e => console.warn("Firestore sync error, but state saved locally", e));
      }
      return updated;
    });
  }, [user]);

  return {
    syncedRecords,
    syncedScans,
    syncedSettings,
    isLoaded,
    updateRecords,
    updateScans,
    updateSettingsData
  };
}

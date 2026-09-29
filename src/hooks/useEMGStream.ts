import { useMemo } from 'react';
import { useAppSelector } from '../store/store';

export const useEMGStream = () => {
  const emg = useAppSelector(state => state.device.emg);
  const emgHistory = useAppSelector(state => state.device.emgHistory);
  const threshold = useAppSelector(state => state.settings.settings.emgThreshold);
  const isContractionDetected = useAppSelector(
    state => state.device.isContractionDetected
  );

  const stats = useMemo(() => {
    if (!emgHistory.length) {
      return { min: 0, max: 0, avg: 0, peak: 0 };
    }
    const min = Math.min(...emgHistory);
    const max = Math.max(...emgHistory);
    const sum = emgHistory.reduce((acc, val) => acc + val, 0);
    const avg = Math.round(sum / emgHistory.length);
    return { min, max, avg, peak: max };
  }, [emgHistory]);

  return {
    currentEMG: emg,
    emgHistory,
    threshold,
    isContractionDetected,
    stats,
  };
};

import { useEffect, useCallback, useState } from "react";

// Define types
type ProgressValue = number;
type DelayMs = number;
type ProgressStep = [ProgressValue, DelayMs];

interface ProgressSequenceReturn {
  progressValue: ProgressValue;
  setProgressValue: (value: ProgressValue) => void;
  onProgress: (value: ProgressValue) => void;
  onComplete: () => void;
  isComplete: boolean;
  isRunning: boolean;
  reset: () => void;
}

const useProgressSequence = (sequences: ProgressStep[] = []): ProgressSequenceReturn => {
  const [progressValue, setProgressValue] = useState<ProgressValue>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const onProgress = useCallback((value: ProgressValue) => {
    setProgressValue(value);
    setIsRunning(true);
  }, []);

  const onComplete = useCallback(() => {
    setIsComplete(true);
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setProgressValue(0);
    setIsComplete(false);
    setIsRunning(false);
  }, []);

  const runSequence = useCallback(async () => {
    const timers: number[] = [];
    setIsRunning(true);

    try {
      for (const [value, delay] of sequences) {
        await new Promise<void>((resolve) => {
          const timeoutId = window.setTimeout(() => {
            onProgress(value);
            resolve();
          }, delay);
          timers.push(timeoutId);
        });
      }
      onComplete();
    } catch (error) {
      timers.forEach(window.clearTimeout);
      throw error;
    }

    return timers;
  }, [sequences, onProgress, onComplete]);

  useEffect(() => {
    let timers: number[] = [];
    let isActive = true;

    const initSequence = async () => {
      if (!isActive) return;
      reset();
      timers = await runSequence();
    };

    initSequence();

    return () => {
      isActive = false;
      timers.forEach(window.clearTimeout);
    };
  }, [runSequence, reset]);

  return {
    progressValue,
    setProgressValue,
    onProgress,
    onComplete,
    isComplete,
    isRunning,
    reset
  };
};

export default useProgressSequence;
"use client";

import { useEffect, useState } from "react";

// Reverse timer hook to show {mm:ss}
export const useTimer = ({
  duration,
  persistenceKey,
}: {
  duration: number;
  persistenceKey?: string;
}) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let currentInitialTime = 0; // Initialize to 0, will be updated by persistence or remain 0 if not started

    // Check for persisted end time
    if (persistenceKey) {
      const persistedEndTime = localStorage.getItem(
        `${persistenceKey}_endTime`,
      );
      if (persistedEndTime) {
        const remaining = Math.ceil(
          (parseInt(persistedEndTime, 10) - Date.now()) / 1000,
        );

        if (remaining > 0) {
          currentInitialTime = remaining;
          setIsRunning(true);
        } else {
          // Timer expired while away
          localStorage.removeItem(`${persistenceKey}_endTime`);
          currentInitialTime = 0;
          setIsRunning(false);
        }
      } else {
        // No running timer found
        currentInitialTime = 0;
        setIsRunning(false);
      }
    } else {
      // Without persistence, we don't auto-start on mount unless we want to change behavior,
      // but for now let's assume no auto-start for non-persisted unless manually started.
      // Actually, the original hook started immediately with `initialTime`.
      // To keep backward compatibility if needed we might want that, but the request was specific to optimizing for OTP.
      // Let's stick to the plan: start() method starts it.
      currentInitialTime = 0;
    }

    setTime(currentInitialTime);
  }, [duration, persistenceKey]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            setIsRunning(false);
            if (persistenceKey) {
              localStorage.removeItem(`${persistenceKey}_endTime`);
            }
            return 0;
          }
          return next;
        });
      }, 1000);
    } else if (time <= 0 && isRunning) {
      // If time hits 0 while running, stop it
      setIsRunning(false);
      if (persistenceKey) {
        localStorage.removeItem(`${persistenceKey}_endTime`);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, time, persistenceKey]);

  const start = () => {
    const endTime = Date.now() + duration * 1000;
    if (persistenceKey) {
      localStorage.setItem(`${persistenceKey}_endTime`, endTime.toString());
    }
    setTime(duration);
    setIsRunning(true);
  };

  const reset = () => {
    setIsRunning(false);
    setTime(0);
    if (persistenceKey) {
      localStorage.removeItem(`${persistenceKey}_endTime`);
    }
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return {
    time,
    formattedTime: `${minutes}:${seconds.toString().padStart(2, "0")}`,
    start,
    reset,
    isRunning,
  };
};

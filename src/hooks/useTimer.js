// hooks/useTimer.js
import { useState, useEffect, useRef } from "react";

export const useTimer = (initialTime, onTimeout) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);
  const onTimeoutRef = useRef(onTimeout);
  const hasCalledTimeoutRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Keep onTimeout ref up to date
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  // Initialize timer ONLY ONCE when initialTime is first set
  useEffect(() => {
    if (initialTime !== null && initialTime !== undefined && !isInitializedRef.current) {
      console.log("useTimer: Initializing timer with", initialTime);
      setTimeLeft(initialTime);
      isInitializedRef.current = true;
    }
  }, [initialTime]);

  // Countdown logic - runs only after timeLeft is initialized
  useEffect(() => {
    // Don't start if timeLeft hasn't been initialized yet
    if (timeLeft === null || timeLeft === undefined) {
      console.log("useTimer: waiting for timeLeft initialization");
      return;
    }

    // If time is already 0, don't start interval
    if (timeLeft <= 0) {
      console.log("useTimer: timeLeft is 0, not starting interval");
      if (!hasCalledTimeoutRef.current && onTimeoutRef.current) {
        hasCalledTimeoutRef.current = true;
        onTimeoutRef.current();
      }
      return;
    }

    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log("useTimer: starting countdown from", timeLeft);

    // Start countdown
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        console.log("useTimer: tick, newTime =", newTime);

        if (newTime <= 0) {
          // Time's up!
          clearInterval(intervalRef.current);
          intervalRef.current = null;

          // Call onTimeout only once
          if (!hasCalledTimeoutRef.current && onTimeoutRef.current) {
            console.log("useTimer: TIME'S UP! Calling onTimeout");
            hasCalledTimeoutRef.current = true;
            onTimeoutRef.current();
          }

          return 0;
        }

        return newTime;
      });
    }, 1000);

    // Cleanup on unmount or when timeLeft changes
    return () => {
      if (intervalRef.current) {
        console.log("useTimer: cleaning up interval");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timeLeft]); // React to timeLeft changes, not initialTime

  return timeLeft;
};
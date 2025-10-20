import { useEffect, useCallback, useRef, useState } from "react";
import { API_BASE_URL } from "../constants";

export function useProctoring(testId, token, settings, enabled = true) {
  const hasLoggedStartRef = useRef(false);
  const tabSwitchCountRef = useRef(0);
  const violationCountRef = useRef(0);

  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);

  // Log event to server
  const logEvent = useCallback(
    async (eventType, eventData = {}) => {
      if (!enabled || !testId || !token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/proctoring/log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            test_id: testId,
            event_type: eventType,
            event_data: eventData,
          }),
        });

        const data = await response.json();
        
        // Optionally alert flagged activity
        if (data.success && data.flagged) {
          console.warn("⚠️ Test flagged for suspicious activity.");
        }

        return data;
      } catch (error) {
        console.error("Failed to log proctoring event:", error);
      }
    },
    [testId, token, enabled]
  );

  // Request fullscreen safely
  const requestFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled || !settings) return;

    // -------- Event Handlers --------
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        violationCountRef.current += 1;
        logEvent("tab_switch", {
          count: tabSwitchCountRef.current,
          timestamp: new Date().toISOString(),
        });

        if (
          settings.max_tab_switches &&
          tabSwitchCountRef.current >= settings.max_tab_switches
        ) {
          console.warn(
            `⚠️ Tab switches exceeded: ${tabSwitchCountRef.current}`
          );
        }
      }
    };

    const handleWindowBlur = () => {
      violationCountRef.current += 1;
      logEvent("window_blur", { timestamp: new Date().toISOString() });
    };

    const handleCopy = (e) => {
      if (!settings.allow_copy_paste) {
        e.preventDefault();
        violationCountRef.current += 1;
        logEvent("copy_attempt", { timestamp: new Date().toISOString() });
      }
    };

    const handlePaste = (e) => {
      if (!settings.allow_copy_paste) {
        e.preventDefault();
        violationCountRef.current += 1;
        logEvent("paste_attempt", { timestamp: new Date().toISOString() });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      violationCountRef.current += 1;
      logEvent("right_click", { timestamp: new Date().toISOString() });
      return false;
    };

    const handleFullscreenChange = () => {
      if (settings.require_fullscreen && !document.fullscreenElement) {
        violationCountRef.current += 1;
        logEvent("fullscreen_exit", { timestamp: new Date().toISOString() });
        setFullscreenWarning(true);

        // Auto request fullscreen again
        requestFullscreen();

        if (
          settings.max_fullscreen_exits &&
          violationCountRef.current >= settings.max_fullscreen_exits
        ) {
          setTestBlocked(true); // optionally block test after exceeding limit
        }
      } else {
        setFullscreenWarning(false);
      }
    };

    // -------- Add Event Listeners --------
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Request fullscreen on mount
    if (settings.require_fullscreen && !hasLoggedStartRef.current) {
      hasLoggedStartRef.current = true;
      requestFullscreen();
    }

    // -------- Cleanup --------
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [enabled, settings, logEvent, requestFullscreen]);

  return {
    logEvent,
    requestFullscreen,
    fullscreenWarning,
    testBlocked,
    violationCount: violationCountRef.current,
  };
}

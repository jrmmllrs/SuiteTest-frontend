import React, { useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../constants";

export function useProctoring(
  testId,
  token,
  settings,
  setFullscreenWarning,
  setTestBlocked,
  enabled = true
) {
  const tabSwitchCountRef = React.useRef(0);
  const hasRequestedFullscreenRef = React.useRef(false);

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

        if (data.success && data.flagged) {
          setTestBlocked(true);
        }

        return data;
      } catch (error) {
        console.error("Failed to log proctoring event:", error);
      }
    },
    [testId, token, enabled, setTestBlocked]
  );

  useEffect(() => {
    if (!enabled || !settings) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCountRef.current += 1;
        logEvent("tab_switch", {
          count: tabSwitchCountRef.current,
          timestamp: new Date().toISOString(),
        });
        if (
          settings.max_tab_switches &&
          tabSwitchCountRef.current >= settings.max_tab_switches
        ) {
          setTestBlocked(true);
        }
      }
    };

    const handleWindowBlur = () => {
      logEvent("window_blur", { timestamp: new Date().toISOString() });
    };

    const handleCopy = (e) => {
      if (!settings.allow_copy_paste) {
        e.preventDefault();
        logEvent("copy_attempt", { timestamp: new Date().toISOString() });
      }
    };

    const handlePaste = (e) => {
      if (!settings.allow_copy_paste) {
        e.preventDefault();
        logEvent("paste_attempt", { timestamp: new Date().toISOString() });
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      logEvent("right_click", { timestamp: new Date().toISOString() });
      return false;
    };

    const handleFullscreenChange = () => {
      if (settings.require_fullscreen && !document.fullscreenElement) {
        logEvent("fullscreen_exit", { timestamp: new Date().toISOString() });
        setFullscreenWarning(true);
      } else {
        setFullscreenWarning(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    if (
      settings.require_fullscreen &&
      !hasRequestedFullscreenRef.current &&
      !document.fullscreenElement
    ) {
      hasRequestedFullscreenRef.current = true;
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem
          .requestFullscreen()
          .catch((err) => console.error("Fullscreen error:", err));
      }
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [enabled, settings, logEvent, setFullscreenWarning, setTestBlocked]);

  return { logEvent };
}
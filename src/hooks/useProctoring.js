import { useEffect, useCallback, useRef, useState } from "react";
import { API_BASE_URL } from "../constants";

export function useProctoring(testId, token, settings, enabled = true) {
  const hasLoggedStartRef = useRef(false);
  
  // Load initial state from localStorage
  const [tabSwitchCount, setTabSwitchCount] = useState(() => {
    const saved = localStorage.getItem(`proctoring_${testId}_tabSwitches`);
    return saved ? parseInt(saved) : 0;
  });
  
  const [violationCount, setViolationCount] = useState(() => {
    const saved = localStorage.getItem(`proctoring_${testId}_violations`);
    return saved ? parseInt(saved) : 0;
  });
  
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);

  // Save to localStorage whenever counts change
  useEffect(() => {
    localStorage.setItem(`proctoring_${testId}_tabSwitches`, tabSwitchCount.toString());
  }, [tabSwitchCount, testId]);

  useEffect(() => {
    localStorage.setItem(`proctoring_${testId}_violations`, violationCount.toString());
  }, [violationCount, testId]);

  // Log event to server
  const logEvent = useCallback(async (eventType, eventData = {}) => {
    if (!enabled || !testId || !token) return;

    try {
      await fetch(`${API_BASE_URL}/proctoring/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_id: testId,
          event_type: eventType,
          event_data: {
            ...eventData,
            persistent_tab_switches: tabSwitchCount,
            persistent_violations: violationCount,
          },
        }),
      });
    } catch (error) {
      console.error("Failed to log proctoring event:", error);
    }
  }, [testId, token, enabled, tabSwitchCount, violationCount]);

  // Request fullscreen safely
  const requestFullscreen = useCallback(() => {
    const elem = document.documentElement;
    if (elem.requestFullscreen && !document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.error("Failed to enter fullscreen:", err);
      });
    }
  }, []);

  // Check if test should be blocked based on saved violations
  useEffect(() => {
    if (!settings) return;
    
    if (settings.max_tab_switches && tabSwitchCount >= settings.max_tab_switches) {
      setTestBlocked(true);
      console.warn("🚫 Test blocked: Too many tab switches");
    }
    
    if (settings.max_violations && violationCount >= settings.max_violations) {
      setTestBlocked(true);
      console.warn("🚫 Test blocked: Too many violations");
    }
  }, [settings, tabSwitchCount, violationCount]);

  useEffect(() => {
    if (!enabled || !settings?.enable_proctoring || testBlocked) return;

    console.log("🛡️ Proctoring activated with settings:", settings);
    console.log("📊 Persistent state - Tab switches:", tabSwitchCount, "Violations:", violationCount);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newTabSwitchCount = tabSwitchCount + 1;
        const newViolationCount = violationCount + 1;
        
        setTabSwitchCount(newTabSwitchCount);
        setViolationCount(newViolationCount);
        
        console.log(`🔄 Tab switch detected: ${newTabSwitchCount}`);
        logEvent("tab_switch", {
          count: newTabSwitchCount,
          timestamp: new Date().toISOString(),
        });

        if (settings.max_tab_switches && newTabSwitchCount >= settings.max_tab_switches) {
          setTestBlocked(true);
        }
      }
    };

    const handleWindowBlur = () => {
      const newViolationCount = violationCount + 1;
      setViolationCount(newViolationCount);
      console.log("⚠️ Window blur detected");
      logEvent("window_blur", { 
        timestamp: new Date().toISOString(),
        violation_count: newViolationCount 
      });
    };

    const handleCopy = (e) => {
      if (!settings.allow_copy_paste) {
        e.preventDefault();
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);
        console.log("📋 Copy attempt blocked");
        logEvent("copy_attempt", { 
          timestamp: new Date().toISOString(),
          violation_count: newViolationCount 
        });
      }
    };

    const handlePaste = (e) => {
      if (!settings.allow_copy_paste) {
        e.preventDefault();
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);
        console.log("📋 Paste attempt blocked");
        logEvent("paste_attempt", { 
          timestamp: new Date().toISOString(),
          violation_count: newViolationCount 
        });
      }
    };

    const handleContextMenu = (e) => {
      if (!settings.allow_right_click) {
        e.preventDefault();
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);
        console.log("🖱️ Right click blocked");
        logEvent("right_click", { 
          timestamp: new Date().toISOString(),
          violation_count: newViolationCount 
        });
        return false;
      }
    };

    const handleFullscreenChange = () => {
      if (settings.require_fullscreen && !document.fullscreenElement) {
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);
        console.log("🖥️ Fullscreen exit detected");
        logEvent("fullscreen_exit", { 
          timestamp: new Date().toISOString(),
          violation_count: newViolationCount 
        });
        setFullscreenWarning(true);

        // Auto request fullscreen again
        setTimeout(() => {
          if (!document.fullscreenElement && !testBlocked) {
            requestFullscreen();
          }
        }, 1000);

        if (settings.max_fullscreen_exits && newViolationCount >= settings.max_fullscreen_exits) {
          setTestBlocked(true);
        }
      } else {
        setFullscreenWarning(false);
      }
    };

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === 'c' || e.key === 'v' || e.key === 'x') && 
          !settings.allow_copy_paste) {
        e.preventDefault();
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);
        console.log(`⌨️ Keyboard shortcut blocked: ${e.key}`);
        logEvent("keyboard_shortcut", { 
          key: e.key, 
          timestamp: new Date().toISOString(),
          violation_count: newViolationCount 
        });
      }

      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        const newViolationCount = violationCount + 1;
        setViolationCount(newViolationCount);
        console.log("🔧 Developer tools attempt blocked");
        logEvent("dev_tools_attempt", { 
          timestamp: new Date().toISOString(),
          violation_count: newViolationCount 
        });
      }
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);

    // Request fullscreen on mount if required
    if (settings.require_fullscreen && !document.fullscreenElement) {
      console.log("🖥️ Requesting fullscreen...");
      setTimeout(() => {
        if (!document.fullscreenElement && !testBlocked) {
          requestFullscreen();
        }
      }, 500);
    }

    // Log test start/resume
    if (!hasLoggedStartRef.current) {
      hasLoggedStartRef.current = true;
      const eventType = tabSwitchCount > 0 || violationCount > 0 ? "test_resumed" : "test_started";
      logEvent(eventType, { 
        timestamp: new Date().toISOString(),
        previous_tab_switches: tabSwitchCount,
        previous_violations: violationCount
      });
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, settings, logEvent, requestFullscreen, tabSwitchCount, violationCount, testBlocked]);

  // Cleanup localStorage when test is completed or component unmounts
  useEffect(() => {
    return () => {
      // Only cleanup if test is completed or we're sure we don't need the data
      if (testBlocked) {
        localStorage.removeItem(`proctoring_${testId}_tabSwitches`);
        localStorage.removeItem(`proctoring_${testId}_violations`);
      }
    };
  }, [testBlocked, testId]);

  // Function to reset proctoring data (call this when test is submitted)
  const resetProctoringData = useCallback(() => {
    localStorage.removeItem(`proctoring_${testId}_tabSwitches`);
    localStorage.removeItem(`proctoring_${testId}_violations`);
    setTabSwitchCount(0);
    setViolationCount(0);
    setTestBlocked(false);
    setFullscreenWarning(false);
  }, [testId]);

  return {
    fullscreenWarning,
    testBlocked,
    violationCount,
    tabSwitchCount,
    resetProctoringData,
  };
}
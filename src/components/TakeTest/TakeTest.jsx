import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { API_BASE_URL } from "../../constants";
import { useTimer } from "../../hooks/useTimer";
import { formatTime, getInitialTime } from "./utils";
import { useProctoring } from "./hooks";
import {
  QuestionCard,
  PdfModal,
  PdfSection,
  TestCompleted,
  TestInstructionsScreen,
} from "./components";

export default function TakeTest({
  user,
  token,
  testId,
  onBack,
  onNavigate,
  invitationToken = null,
}) {
  // State management
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [proctoringSettings, setProctoringSettings] = useState(null);
  const [fullscreenWarning, setFullscreenWarning] = useState(false);
  const [testBlocked, setTestBlocked] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [initialTime, setInitialTime] = useState(null);

  // Refs for maintaining state across renders
  const answersRef = useRef({});
  const timeLeftRef = useRef(null);
  const testRef = useRef(null);
  const testStatusRef = useRef(null);

// API Functions
  const fetchQuestionTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/question-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setQuestionTypes(data.questionTypes);
      }
    } catch (error) {
      console.error("Error fetching question types:", error);
    }
  };

  const checkTestStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      console.log("Test status response:", data);

      if (data.success) {
        setTestStatus(data.status);

        if (data.status === "completed") {
          setMessage({
            type: "error",
            text: "You have already completed this test.",
          });
          setLoading(false);
          setShowInstructions(false);
          return;
        }

        if (data.status === "in_progress") {
          console.log(
            "Resuming test with time remaining:",
            data.time_remaining
          );
          setAnswers(data.saved_answers || {});
          setShowInstructions(false);
          fetchTest(data.time_remaining);
          fetchProctoringSettings();
        } else {
          console.log("Starting new test - showing instructions");
          setShowInstructions(true);
          fetchTest();
          fetchProctoringSettings();
        }
      }
    } catch (err) {
      console.error("Error checking test status:", err);
      fetchTest();
      fetchProctoringSettings();
    }
  };

  const verifyInvitationAccess = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/invitations/verify-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invitationToken: invitationToken,
          testId: testId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        checkTestStatus();
      } else {
        setMessage({
          type: "error",
          text:
            data.message ||
            "You are not authorized to take this test via this invitation.",
        });
        setLoading(false);
      }
    } catch (err) {
      console.error("Error verifying invitation:", err);
      fetchTest();
      fetchProctoringSettings();
    }
  };

  const fetchTest = async (timeRemaining = null) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/take`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const testData = { ...data.test };
        const calculatedTime = getInitialTime(timeRemaining, testData.time_limit);
        
        console.log("Setting initial time to:", calculatedTime);
        setInitialTime(calculatedTime);
        setTest(testData);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to load test",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load test" });
    } finally {
      setLoading(false);
    }
  };

  const fetchProctoringSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/proctoring/settings/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setProctoringSettings(data.settings);
    } catch (err) {
      console.error("Failed to fetch proctoring settings:", err);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || !test) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          invitationToken: invitationToken,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (document.fullscreenElement) document.exitFullscreen();
        setTestStatus("completed");
        setSubmitted(true);
        setSubmission(data.submission);
        setMessage({
          type: "success",
          text: "Test submitted successfully!",
        });
      } else {
        setMessage({ type: "error", text: data.message });
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to submit test" });
      setSubmitting(false);
    }
  }, [submitting, test, answers, token, testId, invitationToken]);

// Effects
  useEffect(() => {
    fetchQuestionTypes();
  }, []);

  useEffect(() => {
    if (testId) {
      if (invitationToken) {
        verifyInvitationAccess();
      } else {
        checkTestStatus();
      }
    }
  }, [testId, invitationToken]);

  // Initialize proctoring
  useProctoring(
    testId,
    token,
    proctoringSettings,
    setFullscreenWarning,
    setTestBlocked,
    !showInstructions && proctoringSettings?.enable_proctoring
  );

  // Initialize timer
  const timeLeft = useTimer(
    showInstructions ? null : initialTime,
    handleSubmit
  );

  // Keep refs in sync
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    testRef.current = test;
  }, [test]);

  useEffect(() => {
    testStatusRef.current = testStatus;
  }, [testStatus]);

  // Save progress functions
  const saveProgressSync = useCallback(
    async (currentTimeLeft) => {
      const timeToSave =
        currentTimeLeft !== undefined ? currentTimeLeft : timeLeftRef.current;

      if (
        !testRef.current ||
        testStatusRef.current === "completed" ||
        timeToSave <= 0
      ) {
        return;
      }

      try {
        await fetch(`${API_BASE_URL}/tests/${testId}/save-progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            answers: answersRef.current,
            time_remaining: timeToSave,
          }),
        });
        console.log("Progress saved with time:", timeToSave);
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    },
    [testId, token]
  );

  const saveProgress = useCallback(async () => {
    if (!test || testStatus === "completed") return;

    const timeToSave = timeLeftRef.current;

    try {
      await fetch(`${API_BASE_URL}/tests/${testId}/save-progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers,
          time_remaining: timeToSave,
        }),
      });
      console.log("Progress saved with time:", timeToSave);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [answers, test, testId, token, testStatus]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (
      !showInstructions &&
      (testStatus === "in_progress" || testStatus === "not_started")
    ) {
      const interval = setInterval(() => saveProgress(), 30000);
      return () => clearInterval(interval);
    }
  }, [saveProgress, testStatus, showInstructions]);

  // Save on unmount/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (testStatusRef.current !== "completed" && timeLeftRef.current > 0) {
        saveProgressSync(timeLeftRef.current);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);

      if (testStatusRef.current !== "completed" && timeLeftRef.current > 0) {
        console.log("Component unmounting, saving progress");
        saveProgressSync(timeLeftRef.current);
      }
    };
  }, [saveProgressSync]);

  // Event handlers
  const handleAnswerChange = (qid, val) =>
    setAnswers((prev) => ({ ...prev, [qid]: val }));

// Render logic
  console.log("TakeTest render:", {
    showInstructions,
    loading,
    hasTest: !!test,
    hasProctoringSettings: !!proctoringSettings,
    testStatus,
  });

  // Show instructions screen
  if (showInstructions && !loading && test && proctoringSettings) {
    return (
      <TestInstructionsScreen
        test={test}
        proctoringSettings={proctoringSettings}
        onStartTest={() => setShowInstructions(false)}
        onBack={onBack}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading test...
      </div>
    );
  }

  // Error state without test
  if (message.type === "error" && !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <AlertTriangle className="text-red-600 mx-auto mb-4" size={48} />
          <p className="text-red-600 mb-4 font-semibold">{message.text}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No test loaded
  if (!test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <p className="text-red-600 mb-4">Failed to load test</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Test completed - show results
  if (submitted && submission) {
    return (
      <TestCompleted
        submission={submission}
        user={user}
        onNavigate={onNavigate}
        testId={testId}
        onBack={onBack}
      />
    );
  }

  // Main test taking interface
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              ← Back
            </button>
            <span className="text-xl font-bold text-gray-900">
              {test?.title}
            </span>
            {invitationToken && (
              <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Via Invitation
              </span>
            )}
            {testStatus === "in_progress" && (
              <span className="ml-3 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                <Clock size={12} />
                Resumed
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {proctoringSettings?.enable_proctoring && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                <Shield size={18} className="text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  Proctored
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg">
              <Clock size={20} className="text-red-600" />
              <span className="font-bold text-red-600">
                {formatTime(timeLeft || 0)}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8 px-4 max-w-4xl mx-auto">
        {/* Messages */}
        {message.text && !submitted && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Resume notice */}
        {testStatus === "in_progress" && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <CheckCircle
              className="text-blue-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-blue-800">
              ✓ Your progress has been restored. Continue where you left off.
            </div>
          </div>
        )}

        {/* Fullscreen warning */}
        {fullscreenWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle
              className="text-yellow-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-yellow-800">
              ⚠️ Please return to fullscreen mode to continue the test.
            </div>
          </div>
        )}

        {/* Test blocked warning */}
        {testBlocked && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle
              className="text-red-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div className="text-sm text-red-800 font-semibold">
              🚫 You cannot continue the test due to multiple violations.
            </div>
          </div>
        )}

        {/* Test info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-600 mb-4">{test?.description}</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Questions: {test?.questions?.length || 0}</span>
            <span>Time: {test?.time_limit} minutes</span>
          </div>
        </div>

        {/* PDF Section */}
        <PdfSection test={test} onOpenModal={() => setShowPdfModal(true)} />

        {/* Questions */}
        {test?.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            answer={answers[question.id]}
            onAnswerChange={handleAnswerChange}
            questionTypes={questionTypes}
          />
        ))}

        {/* Submit button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !test?.questions ||
              test.questions.length === 0 ||
              testBlocked
            }
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        </div>
      </div>

      {/* PDF Modal */}
      {showPdfModal && (
        <PdfModal
          googleDriveId={test?.google_drive_id}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
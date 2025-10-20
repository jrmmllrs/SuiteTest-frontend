import React, { useState, useEffect, useCallback, useRef } from "react";
import { Clock, Shield, AlertTriangle, CheckCircle, FileText, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "../constants";
import { useTimer } from "../hooks/useTimer";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Proctoring hook
function useProctoring(
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

export default function TakeTest({
  user,
  token,
  testId,
  onBack,
  onNavigate,
  invitationToken = null,
}) {
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
  
  const [initialTime, setInitialTime] = useState(null);

  const answersRef = useRef({});
  const timeLeftRef = useRef(null);
  const testRef = useRef(null);
  const testStatusRef = useRef(null);

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
          return;
        }

        if (data.status === "in_progress") {
          console.log("Resuming test with time remaining:", data.time_remaining);
          setAnswers(data.saved_answers || {});
          fetchTest(data.time_remaining);
          fetchProctoringSettings();
        } else {
          console.log("Starting new test");
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
        const testData = {
          ...data.test,
        };
        
        let calculatedTime;
        if (timeRemaining !== null && timeRemaining !== undefined) {
          calculatedTime = timeRemaining;
        } else {
          calculatedTime = testData.time_limit * 60;
        }
        
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

  useProctoring(
    testId,
    token,
    proctoringSettings,
    setFullscreenWarning,
    setTestBlocked,
    proctoringSettings?.enable_proctoring
  );

  const timeLeft = useTimer(initialTime, handleSubmit);

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

  const saveProgressSync = useCallback(async (currentTimeLeft) => {
    const timeToSave = currentTimeLeft !== undefined ? currentTimeLeft : timeLeftRef.current;
    
    if (!testRef.current || testStatusRef.current === "completed" || timeToSave <= 0) {
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
          time_remaining: timeToSave
        }),
      });
      console.log("Progress saved with time:", timeToSave);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [testId, token]);

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
          time_remaining: timeToSave
        }),
      });
      console.log("Progress saved with time:", timeToSave);
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [answers, test, testId, token, testStatus]);

  useEffect(() => {
    if (testStatus === "in_progress" || testStatus === "not_started") {
      const interval = setInterval(() => saveProgress(), 30000);
      return () => clearInterval(interval);
    }
  }, [saveProgress, testStatus]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (testStatusRef.current !== "completed" && timeLeftRef.current > 0) {
        saveProgressSync(timeLeftRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (testStatusRef.current !== "completed" && timeLeftRef.current > 0) {
        console.log("Component unmounting, saving progress");
        saveProgressSync(timeLeftRef.current);
      }
    };
  }, [saveProgressSync]);

  const handleAnswerChange = (qid, val) =>
    setAnswers((prev) => ({ ...prev, [qid]: val }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading test...
      </div>
    );
  }

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

  if (submitted && submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="mb-4">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Test Submitted Successfully!
              </h2>
              
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Your Score</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {submission.score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Correct Answers</p>
                    <p className="text-3xl font-bold text-green-600">
                      {submission.correct_answers}/{submission.total_questions}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-semibold text-gray-800">
                    {submission.remarks}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {user && onNavigate && (
                  <button
                    onClick={() => onNavigate("answer-review", testId, user.id)}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Detailed Answer Review
                  </button>
                )}
                
                <button
                  onClick={onBack}
                  className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-600 mb-4">{test?.description}</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Questions: {test?.questions?.length || 0}</span>
            <span>Time: {test?.time_limit} minutes</span>
          </div>
        </div>

        {/* PDF SECTION - Only show for PDF-based tests */}
        {test?.test_type === 'pdf_based' && test?.google_drive_id && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <FileText size={20} />
                  Reference Document
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Review this document before answering the questions below.
                </p>
                
                <div className="flex gap-2">
                  <a
                    href={`https://drive.google.com/file/d/${test.google_drive_id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    Open PDF in New Tab
                  </a>
                  
                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium"
                  >
                    View in Modal
                  </button>
                </div>
              </div>
              
              {test.thumbnail_url && (
                <img
                  src={test.thumbnail_url}
                  alt="PDF Thumbnail"
                  className="w-24 h-24 object-cover rounded border border-blue-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
            </div>
            
            {/* Embedded PDF Preview */}
            <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white">
              <iframe
                src={`https://drive.google.com/file/d/${test.google_drive_id}/preview`}
                className="w-full h-96"
                allow="autoplay"
                title="Test Reference Document"
              />
            </div>
          </div>
        )}

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

      {/* PDF Modal for fullscreen viewing */}
      {showPdfModal && test?.google_drive_id && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} />
                Reference Document
              </h3>
              <button
                onClick={() => setShowPdfModal(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`https://drive.google.com/file/d/${test.google_drive_id}/preview`}
                className="w-full h-full"
                allow="autoplay"
                title="Test Reference Document - Full View"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question, index, answer, onAnswerChange, questionTypes = [] }) {
  const questionType = questionTypes.find(qt => qt.type_key === question.question_type);
  const requiresOptions = questionType?.requires_options || false;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded">
          Q{index + 1}
        </span>
        <div className="flex-1">
          <p className="text-gray-900 font-medium">
            {question.question_text}
          </p>
          {questionType && (
            <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {questionType.type_name}
            </span>
          )}
        </div>
      </div>

      {requiresOptions && Array.isArray(question.options) && question.options.length > 0 && (
        <div className="space-y-2 ml-12">
          {question.options.map((option, i) => (
            <label
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={answer === option}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                className="w-4 h-4 text-indigo-600"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}

      {!requiresOptions && (
        <textarea
          value={answer || ""}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className={`w-full ml-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            question.question_type === 'coding' ? 'font-mono text-sm' : ''
          }`}
          rows={question.question_type === 'coding' ? 6 : question.question_type === 'essay' ? 8 : 3}
          placeholder={
            question.question_type === 'coding' 
              ? "Write your code here..." 
              : question.question_type === 'essay'
              ? "Write your essay here..."
              : "Type your answer here..."
          }
        />
      )}
    </div>
  );
}
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  BookOpen,
  User,
  Flag,
  Monitor,
  Zap,
  Eye,
  Lock,
} from "lucide-react";
import { API_BASE_URL } from "../../constants";
import { useTimer } from "../../hooks/useTimer";
import { formatTime, getInitialTime } from "./utils";
import { useProctoring } from "../../hooks/useProctoring";
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
  const [testStatus, setTestStatus] = useState(null);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [initialTime, setInitialTime] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());

  // Refs
  const answersRef = useRef({});
  const timeLeftRef = useRef(null);
  const testRef = useRef(null);
  const testStatusRef = useRef(null);

  // Proctoring hook
  const proctoring = useProctoring(
    testId,
    token,
    proctoringSettings,
    !showInstructions && proctoringSettings?.enable_proctoring
  );

  const {
    fullscreenWarning,
    testBlocked,
    violationCount,
    tabSwitchCount,
    resetProctoringData,
  } = proctoring;

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

  // ADD THE MISSING FUNCTION
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

  const checkTestStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

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
          setAnswers(data.saved_answers || {});
          setShowInstructions(false);
          fetchTest(data.time_remaining);
          fetchProctoringSettings();
        } else {
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

  const fetchTest = async (timeRemaining = null) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tests/${testId}/take`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const testData = { ...data.test };
        const calculatedTime = getInitialTime(
          timeRemaining,
          testData.time_limit
        );
        setInitialTime(calculatedTime);
        setTest(testData);

        if (data.saved_answers) {
          const answered = new Set();
          Object.keys(data.saved_answers).forEach((qid) => {
            if (
              data.saved_answers[qid] !== undefined &&
              data.saved_answers[qid] !== null
            ) {
              answered.add(qid);
            }
          });
          setAnsweredQuestions(answered);
        }
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to load test",
        });
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
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

    const unansweredRequiredQuestions = test.questions.filter(
      (q) => q.is_required && !answers[q.id]
    );

    if (unansweredRequiredQuestions.length > 0) {
      setMessage({
        type: "error",
        text: `Please answer all required questions before submitting. ${unansweredRequiredQuestions.length} question(s) remaining.`,
      });
      return;
    }

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
        // Reset proctoring data when test is successfully submitted
        resetProctoringData();

        if (document.fullscreenElement) document.exitFullscreen();
        setTestStatus("completed");
        setSubmitted(true);
        setSubmission(data.submission);
        setMessage({ type: "success", text: "Test submitted successfully!" });
      } else {
        setMessage({ type: "error", text: data.message });
        setSubmitting(false);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessage({ type: "error", text: "Failed to submit test" });
      setSubmitting(false);
    }
  }, [
    submitting,
    test,
    answers,
    token,
    testId,
    invitationToken,
    resetProctoringData,
  ]);

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
    } catch (err) {
      console.error("Failed to save progress:", err);
    }
  }, [answers, test, testId, token, testStatus]);

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

  // Timer
  const timeLeft = useTimer(
    showInstructions ? null : initialTime,
    handleSubmit
  );

  // Refs sync
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
        saveProgressSync(timeLeftRef.current);
      }
    };
  }, [saveProgressSync]);

  // Event handlers
  const handleAnswerChange = (qid, val) => {
    setAnswers((prev) => ({ ...prev, [qid]: val }));
    if (val !== undefined && val !== null && val !== "") {
      setAnsweredQuestions((prev) => new Set(prev).add(qid));
    }
    if (message.text && message.type === "error") {
      setMessage({ type: "", text: "" });
    }
  };

  const isCurrentQuestionAnswered = () => {
    const currentQ = test?.questions?.[currentQuestionIndex];
    if (!currentQ) return false;
    const answer = answers[currentQ.id];

    if (currentQ.question_type === "multiple_choice") {
      return answer !== undefined && answer !== null && answer !== "";
    }
    if (currentQ.question_type === "text") {
      return (
        answer !== undefined &&
        answer !== null &&
        answer.toString().trim() !== ""
      );
    }
    return answer !== undefined && answer !== null;
  };

  const handleNextQuestion = () => {
    if (!isCurrentQuestionAnswered()) {
      setMessage({
        type: "error",
        text: "Please answer this question before proceeding.",
      });
      return;
    }
    if (currentQuestionIndex < (test?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setMessage({ type: "", text: "" });
    }
  };

  const calculateProgress = () => {
    if (!test?.questions) return 0;
    return Math.round((answeredQuestions.size / test.questions.length) * 100);
  };

  // Render states
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

  if (loading) return <LoadingScreen />;
  if (message.type === "error" && !test)
    return <ErrorScreen message={message.text} onBack={onBack} />;
  if (!test)
    return <ErrorScreen message="Failed to load test" onBack={onBack} />;
  if (submitted && submission)
    return (
      <TestCompleted
        submission={submission}
        user={user}
        onNavigate={onNavigate}
        testId={testId}
        onBack={onBack}
      />
    );

  const currentQ = test?.questions?.[currentQuestionIndex];
  const totalQuestions = test?.questions?.length || 0;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const isAnswered = isCurrentQuestionAnswered();
  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20 backdrop-blur-3xl">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-2xl shadow-2xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="glass-button">
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{test?.title}</h1>
                <p className="text-white/80 flex items-center gap-2">
                  <User size={14} />
                  {user?.name}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {proctoringSettings?.enable_proctoring && (
              <div className="glass-proctored">
                <Shield size={18} />
                <span>Proctored</span>
              </div>
            )}

            <div className="glass-timer">
              <Clock size={20} />
              <span className="font-bold">{formatTime(timeLeft || 0)}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8 px-6 max-w-7xl mx-auto">
        {/* Messages */}
        {message.text && !submitted && (
          <div
            className={`glass-message ${
              message.type === "success" ? "success" : "error"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertTriangle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Proctoring Warnings */}
        {fullscreenWarning && (
          <div className="glass-warning">
            <Monitor size={20} />
            <span>Please return to fullscreen mode to continue</span>
          </div>
        )}

        {testBlocked && (
          <div className="glass-error">
            <Lock size={20} />
            <span>Test blocked due to security violations</span>
          </div>
        )}

        {/* Progress Summary */}
        <div className="glass-card p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Test Progress
              </h2>
              <p className="text-white/80 text-lg">{test?.description}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{progress}%</div>
              <div className="text-white/60">Complete</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm text-white/80">
              <span>
                Answered: {answeredQuestions.size} / {totalQuestions}
              </span>
              <span>
                Current: {currentQuestionIndex + 1} of {totalQuestions}
              </span>
            </div>

            <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-400 h-4 rounded-full transition-all duration-500 ease-out shadow-inner"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Test Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Question Area */}
          <div className="xl:col-span-3">
            {currentQ && (
              <div className="glass-card overflow-hidden">
                {/* Question Header */}
                <div className="bg-gradient-to-r from-blue-500/80 to-purple-600/80 p-8 text-white backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <span className="glass-badge">
                        Question {currentQuestionIndex + 1} of {totalQuestions}
                      </span>
                      {currentQ.points && (
                        <span className="glass-badge-yellow">
                          {currentQ.points} pts
                        </span>
                      )}
                    </div>
                    {!isAnswered && (
                      <span className="glass-badge-red animate-pulse">
                        Required
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold leading-relaxed">
                    {currentQ.question_text}
                  </h3>
                </div>

                {/* Question Body */}
                <div className="p-8">
                  <QuestionCard
                    key={currentQ.id}
                    question={currentQ}
                    index={currentQuestionIndex}
                    answer={answers[currentQ.id]}
                    onAnswerChange={handleAnswerChange}
                    questionTypes={questionTypes}
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center p-8 border-t border-white/20 bg-white/5">
                  <div className="text-sm">
                    {isAnswered ? (
                      <span className="text-green-300 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Answered
                      </span>
                    ) : (
                      <span className="text-red-300 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Answer required
                      </span>
                    )}
                  </div>

                  {!isLastQuestion ? (
                    <button
                      onClick={handleNextQuestion}
                      disabled={!isAnswered || testBlocked}
                      className="glass-button-primary"
                    >
                      {isAnswered ? "Next Question" : "Answer Required"}
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || testBlocked}
                      className="glass-button-success"
                    >
                      {submitting ? "Submitting..." : "Submit Test"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* In your sidebar section */}
          <div className="xl:col-span-1">
            <div className="glass-card p-6 sticky top-8">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">
                <Flag size={20} />
                Quick Stats
              </h3>

              <div className="space-y-4">
                <div className="glass-stat">
                  <div className="text-2xl font-bold text-white">
                    {answeredQuestions.size}
                  </div>
                  <div className="text-white/80">Questions Answered</div>
                </div>

                <div className="glass-stat">
                  <div className="text-2xl font-bold text-white">
                    {totalQuestions - answeredQuestions.size}
                  </div>
                  <div className="text-white/80">Remaining</div>
                </div>

                <div className="glass-stat">
                  <div className="text-white/80">Time Left</div>
                  <div className="text-lg font-bold text-white">
                    {formatTime(timeLeft || 0)}
                  </div>
                </div>

                {/* Persistent Proctoring Status */}
                {proctoringSettings?.enable_proctoring && (
                  <>
                    <div
                      className={`glass-stat ${
                        violationCount > 0 ? "glass-stat-warning" : ""
                      }`}
                    >
                      <div className="text-white/80">Security Violations</div>
                      <div className="text-lg font-bold text-white">
                        {violationCount}
                      </div>
                      {violationCount > 0 && (
                        <div className="text-xs text-white/60 mt-1">
                          Persistent across refreshes
                        </div>
                      )}
                    </div>

                    <div
                      className={`glass-stat ${
                        tabSwitchCount > 0 ? "glass-stat-warning" : ""
                      }`}
                    >
                      <div className="text-white/80">Tab Switches</div>
                      <div className="text-lg font-bold text-white">
                        {tabSwitchCount}
                      </div>
                      {tabSwitchCount > 0 && (
                        <div className="text-xs text-white/60 mt-1">
                          Persistent across refreshes
                        </div>
                      )}
                    </div>

                    {testBlocked && (
                      <div className="glass-stat-warning border-2 border-red-400/50">
                        <div className="text-white/80">Status</div>
                        <div className="text-lg font-bold text-red-300">
                          BLOCKED
                        </div>
                        <div className="text-xs text-red-300/80 mt-1">
                          Due to security violations
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* PDF Section */}
              <div className="mt-6 pt-6 border-t border-white/20">
                <PdfSection
                  test={test}
                  onOpenModal={() => setShowPdfModal(true)}
                />
              </div>
            </div>
          </div>
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

// Supporting Components
const LoadingScreen = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg font-light">Loading your test...</p>
    </div>
  </div>
);

const ErrorScreen = ({ message, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-pink-500/20 flex flex-col items-center justify-center p-4">
    <div className="glass-card p-8 max-w-md text-center">
      <AlertTriangle className="text-red-300 mx-auto mb-4" size={64} />
      <h2 className="text-2xl font-bold text-white mb-4">Test Unavailable</h2>
      <p className="text-white/80 mb-6 text-lg">{message}</p>
      <button onClick={onBack} className="glass-button-primary">
        Return to Dashboard
      </button>
    </div>
  </div>
);

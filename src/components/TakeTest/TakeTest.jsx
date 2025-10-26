import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  BookOpen,
  Flag,
  Monitor,
  Lock,
  Maximize2,
  Minimize2,
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
  const [sidebarTab, setSidebarTab] = useState("stats");
  const [pdfLayout, setPdfLayout] = useState("sidebar"); // 'sidebar' or 'split'

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

  // Auto-switch to split view if PDF exists, compact view if no PDF
  useEffect(() => {
    if (test?.google_drive_id) {
      setPdfLayout("split");
    } else {
      setPdfLayout("sidebar");
    }
  }, [test?.google_drive_id]);

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
  const hasPdf = test?.google_drive_id;

  return (
    <div className="min-h-screen bg-quiz-background">
      {/* Header */}
      <nav className="bg-quiz-primary shadow-quiz border-b-4 border-quiz-accent">
        <div className="max-w-full mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {proctoringSettings?.enable_proctoring && (
              <div className="quiz-proctored-badge">
                <Shield size={18} />
                <span>Proctored</span>
              </div>
            )}
            {hasPdf && (
              <button
                onClick={() =>
                  setPdfLayout(pdfLayout === "split" ? "sidebar" : "split")
                }
                className="quiz-button-toggle"
              >
                {pdfLayout === "split" ? (
                  <>
                    <Minimize2 size={18} />
                    <span>Compact View</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={18} />
                    <span>Split View</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="py-8 px-6 max-w-full mx-auto">
        {/* Messages */}
        {message.text && !submitted && (
          <div
            className={`quiz-message max-w-7xl mx-auto mb-6 ${
              message.type === "success"
                ? "quiz-message-success"
                : "quiz-message-error"
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
          <div className="quiz-warning max-w-7xl mx-auto mb-6">
            <Monitor size={20} />
            <span>Please return to fullscreen mode to continue</span>
          </div>
        )}

        {/* Test Content - Split or Sidebar Layout */}
        {hasPdf && pdfLayout === "split" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-full">
            {/* Left: PDF Viewer */}
            <div className="h-[calc(100vh-12rem)] sticky top-24">
              <div className="quiz-card h-full overflow-hidden flex flex-col">
                <div className="bg-[#0697b2] p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} />
                    <span className="font-bold">Reference Material</span>
                  </div>
                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
                  >
                    Fullscreen
                  </button>
                </div>
                <div className="flex-1 overflow-hidden bg-gray-100">
                  <iframe
                    src={`https://drive.google.com/file/d/${test.google_drive_id}/preview`}
                    className="w-full h-full"
                    title="Test Reference Material"
                    allow="autoplay"
                  />
                </div>
              </div>
            </div>

            {/* Right: Question and Stats */}
            <div className="space-y-6">
              {/* Quick Stats Card */}
              <div className="quiz-card p-6">
                <div className="grid grid-cols-4 gap-4">
                  {/* Answered */}
                  <div className="quiz-stat">
                    <div className="flex items-center justify-center w-10 h-10 bg-quiz-primary/10 rounded-full mb-2 mx-auto">
                      <CheckCircle size={20} className="text-quiz-primary" />
                    </div>
                    <div className="text-2xl font-black text-quiz-accent">
                      {answeredQuestions.size}
                    </div>
                    <div className="text-xs text-quiz-dark/70 font-medium">
                      Answered
                    </div>
                  </div>

                  {/* Remaining */}
                  <div className="quiz-stat">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mb-2 mx-auto">
                      <AlertTriangle size={20} className="text-orange-500" />
                    </div>
                    <div className="text-2xl font-black text-orange-500">
                      {totalQuestions - answeredQuestions.size}
                    </div>
                    <div className="text-xs text-quiz-dark/70 font-medium">
                      Remaining
                    </div>
                  </div>

                  {/* Total */}
                  <div className="quiz-stat">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-2 mx-auto">
                      <Flag size={20} className="text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-purple-500">
                      {totalQuestions}
                    </div>
                    <div className="text-xs text-quiz-dark/70 font-medium">
                      Total
                    </div>
                  </div>

                  {/* Time */}
                  <div className="quiz-stat">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-2 mx-auto">
                      <Clock size={20} className="text-red-500 animate-pulse" />
                    </div>
                    <div className="text-lg font-black text-red-500 tabular-nums">
                      {formatTime(timeLeft || 0)}
                    </div>
                    <div className="text-xs text-quiz-dark/70 font-medium">
                      Time Left
                    </div>
                  </div>
                </div>

                {/* Proctoring Stats */}
                {proctoringSettings?.enable_proctoring && (
                  <div className="mt-4 pt-4 border-t border-quiz-light/30">
                    <div className="flex items-center gap-2 text-quiz-dark/80 font-semibold text-sm mb-3">
                      <Shield size={16} className="text-quiz-primary" />
                      <span>Security Monitoring</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`quiz-stat ${
                          violationCount > 0 ? "border-2 border-yellow-400" : ""
                        }`}
                      >
                        <div className="text-xs text-quiz-dark/70 font-medium mb-1">
                          Violations
                        </div>
                        <div
                          className={`text-xl font-black ${
                            violationCount > 0
                              ? "text-yellow-600"
                              : "text-quiz-accent"
                          }`}
                        >
                          {violationCount}
                        </div>
                      </div>
                      <div
                        className={`quiz-stat ${
                          tabSwitchCount > 0 ? "border-2 border-yellow-400" : ""
                        }`}
                      >
                        <div className="text-xs text-quiz-dark/70 font-medium mb-1">
                          Tab Switches
                        </div>
                        <div
                          className={`text-xl font-black ${
                            tabSwitchCount > 0
                              ? "text-yellow-600"
                              : "text-quiz-accent"
                          }`}
                        >
                          {tabSwitchCount}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <br />
                {testBlocked && (
                  <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-md p-3 flex items-center gap-2">
                    <Lock size={14} />
                    <span>Test blocked due to security violations</span>
                  </div>
                )}
              </div>

              {/* Question Card */}
              {currentQ && (
                <div className="quiz-card quiz-question-card overflow-hidden">
                  {/* Question Header */}
                  <div className="bg-quiz-primary p-8 text-white quiz-question-header">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <span className="quiz-badge">
                          Question {currentQuestionIndex + 1} of{" "}
                          {totalQuestions}
                        </span>
                        {currentQ.points && (
                          <span className="quiz-badge-points">
                            {currentQ.points} pts
                          </span>
                        )}
                      </div>
                      {!isAnswered && (
                        <span className="quiz-badge-required animate-pulse">
                          Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="p-8 quiz-question-body">
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
                  <div className="flex justify-between items-center p-8 border-t border-quiz-light/30 bg-quiz-light/10 quiz-navigation">
                    <div className="text-sm">
                      {isAnswered ? (
                        <span className="text-quiz-success flex items-center gap-2 quiz-answer-status">
                          <CheckCircle size={16} />
                          Answered
                        </span>
                      ) : (
                        <span className="text-quiz-error flex items-center gap-2 quiz-answer-status">
                          <AlertTriangle size={16} />
                          Answer required
                        </span>
                      )}
                    </div>

                    {!isLastQuestion ? (
                      <button
                        onClick={handleNextQuestion}
                        disabled={!isAnswered || testBlocked}
                        className="quiz-button-next"
                      >
                        {isAnswered ? "Next Question" : "Answer Required"}
                        <ChevronRight size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || testBlocked}
                        className="quiz-button-submit"
                      >
                        {submitting ? "Submitting..." : "Submit Test"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // Original Sidebar Layout
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Main Question Area */}
            <div className="xl:col-span-3">
              {currentQ && (
                <div className="quiz-card quiz-question-card overflow-hidden">
                  {/* Question Header */}
                  <div className="bg-quiz-primary p-8 text-white quiz-question-header">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2">
                        <span className="quiz-badge">
                          Question {currentQuestionIndex + 1} of{" "}
                          {totalQuestions}
                        </span>
                        {currentQ.points && (
                          <span className="quiz-badge-points">
                            {currentQ.points} pts
                          </span>
                        )}
                      </div>
                      {!isAnswered && (
                        <span className="quiz-badge-required animate-pulse">
                          Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Body */}
                  <div className="p-8 quiz-question-body">
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
                  <div className="flex justify-between items-center p-8 border-t border-quiz-light/30 bg-quiz-light/10 quiz-navigation">
                    <div className="text-sm">
                      {isAnswered ? (
                        <span className="text-quiz-success flex items-center gap-2 quiz-answer-status">
                          <CheckCircle size={16} />
                          Answered
                        </span>
                      ) : (
                        <span className="text-quiz-error flex items-center gap-2 quiz-answer-status">
                          <AlertTriangle size={16} />
                          Answer required
                        </span>
                      )}
                    </div>

                    {!isLastQuestion ? (
                      <button
                        onClick={handleNextQuestion}
                        disabled={!isAnswered || testBlocked}
                        className="quiz-button-next"
                      >
                        {isAnswered ? "Next Question" : "Answer Required"}
                        <ChevronRight size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={submitting || testBlocked}
                        className="quiz-button-submit"
                      >
                        {submitting ? "Submitting..." : "Submit Test"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <div className="quiz-card quiz-sidebar overflow-hidden sticky top-8">
                {/* Tab Headers */}
                <div className="flex border-b border-quiz-light/30">
                  <button
                    onClick={() => setSidebarTab("stats")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-semibold transition-all duration-300 ${
                      sidebarTab === "stats"
                        ? "bg-gradient-to-br from-quiz-primary to-quiz-accent text-white shadow-lg"
                        : "bg-white text-quiz-dark/60 hover:bg-quiz-light/50 hover:text-quiz-dark"
                    }`}
                  >
                    <Flag size={18} />
                    <span className="text-sm">Quick Stats</span>
                  </button>
                  <button
                    onClick={() => setSidebarTab("resources")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-semibold transition-all duration-300 ${
                      sidebarTab === "resources"
                        ? "bg-gradient-to-br from-quiz-primary to-quiz-accent text-white shadow-lg"
                        : "bg-white text-quiz-dark/60 hover:bg-quiz-light/50 hover:text-quiz-dark"
                    }`}
                  >
                    <BookOpen size={18} />
                    <span className="text-sm">Resources</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Stats Tab */}
                  {sidebarTab === "stats" && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Answered */}
                        <div className="quiz-stat group hover:scale-105 transition-transform cursor-pointer">
                          <div className="flex items-center justify-center w-10 h-10 bg-quiz-primary/10 rounded-full mb-2 mx-auto group-hover:bg-quiz-primary/20 transition-colors">
                            <CheckCircle
                              size={20}
                              className="text-quiz-primary"
                            />
                          </div>
                          <div className="text-2xl font-black text-quiz-accent">
                            {answeredQuestions.size}
                          </div>
                          <div className="text-xs text-quiz-dark/70 font-medium">
                            Answered
                          </div>
                        </div>

                        {/* Remaining */}
                        <div className="quiz-stat group hover:scale-105 transition-transform cursor-pointer">
                          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full mb-2 mx-auto group-hover:bg-orange-200 transition-colors">
                            <AlertTriangle
                              size={20}
                              className="text-orange-500"
                            />
                          </div>
                          <div className="text-2xl font-black text-orange-500">
                            {totalQuestions - answeredQuestions.size}
                          </div>
                          <div className="text-xs text-quiz-dark/70 font-medium">
                            Remaining
                          </div>
                        </div>

                        {/* Total Questions */}
                        <div className="quiz-stat group hover:scale-105 transition-transform cursor-pointer">
                          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-2 mx-auto group-hover:bg-purple-200 transition-colors">
                            <svg
                              className="w-5 h-5 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                          <div className="text-2xl font-black text-purple-500">
                            {totalQuestions}
                          </div>
                          <div className="text-xs text-quiz-dark/70 font-medium">
                            Total
                          </div>
                        </div>

                        {/* Time Left */}
                        <div className="quiz-stat group hover:scale-105 transition-transform cursor-pointer">
                          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-2 mx-auto group-hover:bg-red-200 transition-colors">
                            <Clock
                              size={20}
                              className="text-red-500 animate-pulse"
                            />
                          </div>
                          <div className="text-lg font-black text-red-500 tabular-nums">
                            {formatTime(timeLeft || 0)}
                          </div>
                          <div className="text-xs text-quiz-dark/70 font-medium">
                            Time Left
                          </div>
                        </div>
                      </div>

                      {/* Proctoring Stats */}
                      {proctoringSettings?.enable_proctoring && (
                        <div className="mt-4 pt-4 border-t border-quiz-light/30 space-y-3">
                          <div className="flex items-center gap-2 text-quiz-dark/80 font-semibold text-sm mb-3">
                            <Shield size={16} className="text-quiz-primary" />
                            <span>Security Monitoring</span>
                          </div>

                          {/* Violations */}
                          <div
                            className={`quiz-stat ${
                              violationCount > 0
                                ? "quiz-stat-warning border-2 border-yellow-400"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-quiz-dark/70 font-medium">
                                Security Violations
                              </span>
                              <div
                                className={`text-xl font-black ${
                                  violationCount > 0
                                    ? "text-yellow-600"
                                    : "text-quiz-accent"
                                }`}
                              >
                                {violationCount}
                              </div>
                            </div>
                            {violationCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-yellow-700 mt-1">
                                <AlertTriangle size={12} />
                                <span>Persistent warning</span>
                              </div>
                            )}
                          </div>

                          {/* Tab Switches */}
                          <div
                            className={`quiz-stat ${
                              tabSwitchCount > 0
                                ? "quiz-stat-warning border-2 border-yellow-400"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-quiz-dark/70 font-medium">
                                Tab Switches
                              </span>
                              <div
                                className={`text-xl font-black ${
                                  tabSwitchCount > 0
                                    ? "text-yellow-600"
                                    : "text-quiz-accent"
                                }`}
                              >
                                {tabSwitchCount}
                              </div>
                            </div>
                            {tabSwitchCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-yellow-700 mt-1">
                                <AlertTriangle size={12} />
                                <span>Persistent warning</span>
                              </div>
                            )}
                          </div>

                          {/* Blocked Status */}
                          {testBlocked && (
                            <div className="quiz-stat-error border-2 border-red-500 animate-pulse">
                              <div className="flex items-center justify-center gap-2 mb-2">
                                <Lock size={20} className="text-red-600" />
                                <span className="text-lg font-black text-red-600">
                                  BLOCKED
                                </span>
                              </div>
                              <div className="text-xs text-red-600/90 text-center">
                                Test blocked due to security violations
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resources Tab */}
                  {sidebarTab === "resources" && (
                    <div className="animate-fadeIn">
                      <PdfSection
                        test={test}
                        onOpenModal={() => setShowPdfModal(true)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Modal */}
      {showPdfModal && (
        <PdfModal
          googleDriveId={test?.google_drive_id}
          onClose={() => setShowPdfModal(false)}
        />
      )}

      {/* Add CSS for the line pattern background */}
      <style jsx>{`
        .bg-quiz-background {
          background-color: #f8fafc;
          background-image: linear-gradient(#0697b2 1px, transparent 1px),
            linear-gradient(90deg, #0697b2 1px, transparent 1px);
          background-size: 50px 50px;
          background-position: center center;
        }
      `}</style>
    </div>
  );
}

// Supporting Components
const LoadingScreen = () => (
  <div className="min-h-screen bg-quiz-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-quiz-primary mx-auto mb-4"></div>
      <p className="text-quiz-dark text-lg font-light">Loading your test...</p>
    </div>
  </div>
);

const ErrorScreen = ({ message, onBack }) => (
  <div className="min-h-screen bg-quiz-background flex flex-col items-center justify-center p-4">
    <div className="quiz-card p-8 max-w-md text-center">
      <AlertTriangle className="text-quiz-error mx-auto mb-4" size={64} />
      <h2 className="text-2xl font-bold text-quiz-dark mb-4">
        Test Unavailable
      </h2>
      <p className="text-quiz-dark/80 mb-6 text-lg">{message}</p>
      <button onClick={onBack} className="quiz-button-primary">
        Return to Dashboard
      </button>
    </div>
  </div>
);

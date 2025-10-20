import React, { useState, useEffect } from "react";
import { FileText, ExternalLink } from "lucide-react";

export default function AnswerReview({ testId, candidateId, token, onBack }) {
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [questionTypes, setQuestionTypes] = useState([]);
  const [showPdf, setShowPdf] = useState(true); // NEW: Control PDF visibility

  useEffect(() => {
    fetchQuestionTypes();
    fetchReview();
  }, [testId, candidateId]);

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

  const fetchReview = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/tests/${testId}/review/${candidateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();

      if (data.success) {
        setReview(data);
      } else {
        setError(data.message || "Failed to load review");
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      setError("Failed to load review");
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeDetails = (typeKey) => {
    return questionTypes.find((qt) => qt.type_key === typeKey);
  };

  const getQuestionTypeName = (typeKey) => {
    const qt = getQuestionTypeDetails(typeKey);
    return qt ? qt.type_name : typeKey.replace("_", " ");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={onBack}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const { test, result, questions } = review;
  const percentage = Math.round((result.score / result.total_questions) * 100);

  // NEW: Check if this is a PDF-based test
  const isPdfTest = test.test_type === "pdf_based" && test.google_drive_id;

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className={`mx-auto py-8 px-4 ${
          isPdfTest && showPdf ? "max-w-7xl" : "max-w-5xl"
        }`}
      >
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{test.title}</h1>
              <p className="text-gray-600 mt-2">Answer Review</p>
            </div>

            {/* NEW: PDF Badge and Toggle */}
            {isPdfTest && (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-2">
                  <FileText size={16} />
                  PDF-Based Test
                </span>
                <button
                  onClick={() => setShowPdf(!showPdf)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  {showPdf ? "Hide PDF" : "Show PDF"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* NEW: Main Layout - Side by side for PDF tests */}
        <div className={isPdfTest && showPdf ? "grid grid-cols-2 gap-6" : ""}>
          {/* NEW: PDF Viewer Section (left side) */}
          {isPdfTest && showPdf && (
            <div className="sticky top-8 h-[calc(100vh-8rem)]">
              <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
                <div className="flex items-center justify-between mb-3 pb-3 border-b">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={18} />
                    Reference Document
                  </h3>
                  <a
                    href={`https://drive.google.com/file/d/${test.google_drive_id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
                  >
                    <ExternalLink size={16} />
                    Open in new tab
                  </a>
                </div>
                <div className="flex-1 overflow-hidden rounded">
                  <iframe
                    src={`https://drive.google.com/file/d/${test.google_drive_id}/preview`}
                    className="w-full h-full border-0"
                    allow="autoplay"
                    title="Test PDF"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Questions and Results Section (right side or full width) */}
          <div>
            {/* Score Summary Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Score</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {percentage}%
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Correct</p>
                  <p className="text-3xl font-bold text-green-600">
                    {result.correct_answers}
                  </p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Incorrect</p>
                  <p className="text-3xl font-bold text-red-600">
                    {result.total_questions - result.correct_answers}
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Remarks</p>
                  <p className="text-xl font-bold text-purple-600">
                    {result.remarks}
                  </p>
                </div>
              </div>
            </div>

            {/* Questions Review */}
            <div className="space-y-4">
              {questions.map((q, index) => {
                const isCorrect = q.is_correct === 1;
                const userAnswer = q.user_answer;
                const correctAnswer = q.correct_answer;

                const questionTypeDetails = getQuestionTypeDetails(
                  q.question_type
                );
                const requiresOptions =
                  questionTypeDetails?.requires_options || false;
                const hasOptions = q.options && q.options.length > 0;

                return (
                  <div
                    key={q.id}
                    className={`bg-white rounded-lg shadow overflow-hidden border-l-4 ${
                      isCorrect ? "border-green-500" : "border-red-500"
                    }`}
                  >
                    <div className="p-6">
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-semibold text-gray-500">
                              Question {index + 1}
                            </span>
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {getQuestionTypeName(
                                q.question_type
                              ).toUpperCase()}
                            </span>
                            {isCorrect ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                ✓ Correct
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                                ✗ Incorrect
                              </span>
                            )}
                          </div>
                          <p className="text-lg font-medium text-gray-800">
                            {q.question_text}
                          </p>
                        </div>
                      </div>

                      {/* Show options only if question type requires them */}
                      {requiresOptions && hasOptions && (
                        <div className="space-y-2 mb-4">
                          {q.options.map((option, optIndex) => {
                            const isUserAnswer = option === userAnswer;
                            const isCorrectOption = option === correctAnswer;

                            let bgColor = "bg-gray-50";
                            let borderColor = "border-gray-200";
                            let textColor = "text-gray-700";

                            if (isCorrectOption) {
                              bgColor = "bg-green-50";
                              borderColor = "border-green-300";
                              textColor = "text-green-800";
                            }

                            if (isUserAnswer && !isCorrect) {
                              bgColor = "bg-red-50";
                              borderColor = "border-red-300";
                              textColor = "text-red-800";
                            }

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 rounded-lg border-2 ${bgColor} ${borderColor}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={`font-semibold ${textColor}`}
                                    >
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    <span className={textColor}>{option}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isUserAnswer && (
                                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        Your Answer
                                      </span>
                                    )}
                                    {isCorrectOption && (
                                      <span className="text-green-600 font-bold text-xl">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Show text answers for non-option question types */}
                      {!requiresOptions && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          {/* Your Answer */}
                          <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-300">
                            <p className="text-xs font-semibold text-blue-600 mb-2 uppercase">
                              Your Answer
                            </p>
                            <div
                              className={`bg-white rounded p-3 text-sm text-gray-800 whitespace-pre-wrap break-words max-h-48 overflow-y-auto ${
                                q.question_type === "coding" ? "font-mono" : ""
                              }`}
                            >
                              {userAnswer || "(No answer provided)"}
                            </div>
                          </div>

                          {/* Expected Answer / Keywords */}
                          {correctAnswer && (
                            <div className="p-4 rounded-lg border-2 bg-green-50 border-green-300">
                              <p className="text-xs font-semibold text-green-600 mb-2 uppercase">
                                Expected Answer / Keywords
                              </p>
                              <div
                                className={`bg-white rounded p-3 text-sm text-gray-800 whitespace-pre-wrap break-words max-h-48 overflow-y-auto ${
                                  q.question_type === "coding"
                                    ? "font-mono"
                                    : ""
                                }`}
                              >
                                {correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="mt-4 p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded">
                          <p className="text-sm font-semibold text-indigo-900 mb-1">
                            💡 Explanation
                          </p>
                          <p className="text-sm text-indigo-800">
                            {q.explanation}
                          </p>
                        </div>
                      )}

                      {/* Dynamic Explanation Based on Answer */}
                      {q.displayExplanation && (
                        <div
                          className={`mt-4 p-4 rounded-lg ${
                            isCorrect
                              ? "bg-green-50 border-l-4 border-green-400"
                              : "bg-yellow-50 border-l-4 border-yellow-400"
                          }`}
                        >
                          <p className="text-sm font-semibold mb-2 text-gray-900">
                            {isCorrect
                              ? "✓ Why this is correct"
                              : "⚠️ Why this is incorrect"}
                          </p>
                          <p className="text-sm text-gray-800">
                            {q.displayExplanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Summary */}
            <div className="mt-8 bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600 mb-2">Test completed on</p>
              <p className="text-lg font-semibold text-gray-800">
                {new Date(result.taken_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Clock, FileText, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

// Mock LoadingScreen component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading test...</p>
      </div>
    </div>
  );
}

export default function ViewTest({ testId, token, onBack, onEdit }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (testId && token) {
      fetchTest();
    }
  }, [testId, token]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching test from: ${API_BASE_URL}/tests/${testId}`);
      
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Fetched test data:', data);

      if (data.success) {
        const testData = {
          ...data.test,
          question_count: data.test.questions?.length || 0,
        };
        setTest(testData);
      } else {
        setError(data.message || "Failed to load test");
      }
    } catch (error) {
      console.error("Error fetching test:", error);
      setError(
        error.message || 
        "Error loading test. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (q, index) => {
    const isMultipleChoice = q.question_type === "multiple_choice";
    const isTrueFalse = q.question_type === "true_false";
    const isShortAnswer = q.question_type === "short_answer";

    return (
      <div key={q.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0698b2] text-white text-xs font-semibold">
                {index + 1}
              </span>
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${
                  isMultipleChoice
                    ? "bg-blue-100 text-blue-700"
                    : isTrueFalse
                    ? "bg-green-100 text-green-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {isMultipleChoice 
                  ? "MC" 
                  : isTrueFalse 
                  ? "T/F" 
                  : "SA"}
              </span>
            </div>
            <p className="text-gray-900 text-sm font-medium">
              {q.question_text}
            </p>
          </div>
        </div>

        {(isMultipleChoice || isTrueFalse) && q.options && q.options.length > 0 ? (
          <div className="space-y-1.5 mt-2">
            {q.options.map((opt, i) => {
              const isCorrect = opt === q.correct_answer;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 p-2 rounded border text-sm ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                    isCorrect
                      ? "bg-green-100 text-green-700"
                      : "bg-white border border-gray-300 text-gray-700"
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className={`flex-1 ${isCorrect ? "text-green-900 font-medium" : "text-gray-700"}`}>
                    {opt}
                  </span>
                  {isCorrect && (
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        ) : isShortAnswer && q.correct_answer ? (
          <div className="mt-2">
            <div className="bg-green-50 border border-green-200 rounded p-2.5">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-900 mb-0.5">Correct Answer:</p>
                  <p className="text-sm text-green-800">{q.correct_answer}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
            <p className="text-gray-500 text-xs">
              {isShortAnswer ? "No answer key provided" : "No options available"}
            </p>
          </div>
        )}

        {q.explanation && (
          <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs font-semibold text-blue-900 mb-1">EXPLANATION</p>
            <p className="text-xs text-blue-800">{q.explanation}</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md w-full">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 mb-1">Error Loading Test</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchTest}
              className="flex-1 px-4 py-2.5 bg-[#0698b2] hover:bg-[#0482a0] text-white font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-1">Test Not Found</p>
          <p className="text-gray-600 text-sm mb-4">The requested test could not be found.</p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-4 px-4">
        {/* Header Actions */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-300 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <button
            onClick={() => onEdit(testId)}
            className="flex items-center gap-2 px-3 py-2 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Edit size={16} />
            <span>Edit Test</span>
          </button>
        </div>

        {/* Test Header Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{test.title}</h1>
          <p className="text-sm text-gray-600 mb-4">
            {test.description || "No description provided"}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-[#0698b2] to-[#0482a0] rounded-lg p-3 text-white">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium opacity-90">Questions</p>
                <FileText size={16} className="opacity-75" />
              </div>
              <p className="text-2xl font-bold">{test.question_count || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3 text-white">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium opacity-90">Time Limit</p>
                <Clock size={16} className="opacity-75" />
              </div>
              <p className="text-2xl font-bold">{test.time_limit} <span className="text-sm">min</span></p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium opacity-90">Status</p>
                <CheckCircle size={16} className="opacity-75" />
              </div>
              <p className="text-lg font-semibold">Active</p>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Questions ({test.questions?.length || 0})</h2>
          </div>
          
          <div className="p-4">
            {test.questions && test.questions.length > 0 ? (
              <div className="space-y-3">
                {test.questions.map((q, index) => renderQuestion(q, index))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-gray-600 text-sm">No questions added yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
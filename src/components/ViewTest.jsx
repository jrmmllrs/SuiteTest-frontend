import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../constants/views";
import LoadingScreen from "./LoadingScreen";

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

      // Log response for debugging
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
      <div key={q.id} className="border rounded p-4 bg-gray-50">
        <div className="flex items-start justify-between mb-2">
          <p className="font-medium">
            {index + 1}. {q.question_text}
          </p>
          <span
            className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
              isMultipleChoice
                ? "bg-blue-100 text-blue-800"
                : isTrueFalse
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {isMultipleChoice 
              ? "Multiple Choice" 
              : isTrueFalse 
              ? "True/False" 
              : "Short Answer"}
          </span>
        </div>

        {(isMultipleChoice || isTrueFalse) && q.options && q.options.length > 0 ? (
          <div className="space-y-1 ml-4 mt-3">
            {q.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className={
                    opt === q.correct_answer
                      ? "text-green-600 font-medium"
                      : "text-gray-700"
                  }
                >
                  {String.fromCharCode(65 + i)}. {opt}
                  {opt === q.correct_answer && " ✓ (Correct)"}
                </span>
              </div>
            ))}
          </div>
        ) : isShortAnswer && q.correct_answer ? (
          <div className="ml-4 mt-3">
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="text-sm text-gray-600 mb-1">Correct Answer:</p>
              <p className="text-green-700 font-medium">{q.correct_answer}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 ml-4 mt-2">
            {isShortAnswer ? "No answer key provided" : "No options available"}
          </p>
        )}

        {q.explanation && (
          <div className="ml-4 mt-3 p-2 bg-blue-50 rounded">
            <p className="text-xs text-gray-600 mb-1">Explanation:</p>
            <p className="text-sm text-gray-700">{q.explanation}</p>
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-6 max-w-md w-full">
          <div className="text-red-600 mb-4">
            <p className="font-semibold mb-2">Error Loading Test</p>
            <p className="text-sm">{error}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchTest}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <p className="text-gray-600">Test not found</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => onEdit(testId)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <span>✏️</span> Edit Test
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{test.title}</h1>
          <p className="text-gray-600 mb-4">
            {test.description || "No description"}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-2xl font-bold">{test.question_count || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <p className="text-sm text-gray-600">Time Limit</p>
              <p className="text-2xl font-bold">{test.time_limit} min</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Questions</h3>
            {test.questions && test.questions.length > 0 ? (
              <div className="space-y-4">
                {test.questions.map((q, index) => renderQuestion(q, index))}
              </div>
            ) : (
              <p className="text-gray-500">No questions added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../constants/views";
import LoadingScreen from "./LoadingScreen";
import {
  ArrowLeft,
  Edit,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  BookOpen,
  BarChart3,
  Target,
  Zap,
  Lightbulb,
  ChevronRight,
  Copy,
  Share2,
  Download,
  Bookmark,
} from "lucide-react";

export default function ViewTest({ testId, token, onBack, onEdit }) {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());

  useEffect(() => {
    if (testId && token) {
      fetchTest();
    }
  }, [testId, token]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

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

  const toggleQuestion = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case "multiple_choice":
        return <Target size={16} className="text-blue-600" />;
      case "true_false":
        return <Zap size={16} className="text-green-600" />;
      case "short_answer":
        return <FileText size={16} className="text-purple-600" />;
      default:
        return <BookOpen size={16} className="text-gray-600" />;
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case "multiple_choice":
        return "from-blue-500 to-blue-600";
      case "true_false":
        return "from-green-500 to-green-600";
      case "short_answer":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const renderQuestionCard = (q, index) => {
    const isExpanded = expandedQuestions.has(q.id);
    const isMultipleChoice = q.question_type === "multiple_choice";
    const isTrueFalse = q.question_type === "true_false";
    const isShortAnswer = q.question_type === "short_answer";

    return (
      <div key={q.id} className="group">
        {/* Question Header - Always Visible */}
        <div 
          className="flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-300"
          onClick={() => toggleQuestion(q.id)}
        >
          {/* Question Number with Gradient */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getQuestionTypeColor(q.question_type)} flex items-center justify-center shadow-sm`}>
            <span className="text-white font-bold text-lg">{index + 1}</span>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-gray-900 font-semibold line-clamp-2 flex-1">
                {q.question_text}
              </h3>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full">
                {getQuestionTypeIcon(q.question_type)}
                <span className="text-xs font-medium text-gray-700">
                  {isMultipleChoice ? "Multiple Choice" : isTrueFalse ? "True/False" : "Short Answer"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{q.options?.length || 0} options</span>
              {q.correct_answer && <span className="text-green-600">✓ Has answer</span>}
              {q.explanation && <span className="text-blue-600">💡 Has explanation</span>}
            </div>
          </div>

          {/* Expand/Collapse Icon */}
          <ChevronRight 
            size={20} 
            className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="mt-3 ml-16 bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-in fade-in duration-300">
            {/* Options or Answer */}
            {(isMultipleChoice || isTrueFalse) && q.options && q.options.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Answer Options</h4>
                <div className="grid gap-3">
                  {q.options.map((opt, i) => {
                    const isCorrect = opt === q.correct_answer;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                          isCorrect
                            ? "bg-green-50 border-green-200 shadow-sm"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${
                            isCorrect
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span
                          className={`flex-1 ${isCorrect ? "text-green-800 font-medium" : "text-gray-700"}`}
                        >
                          {opt}
                        </span>
                        {isCorrect && (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={18} />
                            <span className="text-sm font-medium">Correct</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : isShortAnswer && q.correct_answer ? (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Correct Answer</h4>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-medium">{q.correct_answer}</p>
                </div>
              </div>
            ) : null}

            {/* Explanation */}
            {q.explanation && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb size={18} className="text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Explanation</h4>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-blue-800 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            )}
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Oops!</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchTest}
              className="px-6 py-3 bg-gradient-to-r from-[#0697b2] to-cyan-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText size={40} className="text-gray-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Test Not Found</h3>
          <p className="text-gray-600 mb-6">The test you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-[#0697b2] to-cyan-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 font-medium"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <div className="w-1 h-8 bg-gray-200 rounded-full"></div>
              <h1 className="text-2xl font-bold text-gray-900">Test Preview</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300">
                <Bookmark size={20} />
              </button>
              <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300">
                <Share2 size={20} />
              </button>
              <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300">
                <Download size={20} />
              </button>
              <button
                onClick={() => onEdit(testId)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0697b2] to-cyan-600 text-white rounded-2xl hover:shadow-lg transition-all duration-300 font-semibold"
              >
                <Edit size={18} />
                Edit Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Test Overview Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0697b2] to-cyan-600 flex items-center justify-center shadow-lg">
                  <FileText size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{test.title}</h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    {test.description || "No description provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid with Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-blue-700 text-sm font-semibold">Total Questions</p>
                  <p className="text-3xl font-bold text-gray-900">{test.question_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-sm">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-green-700 text-sm font-semibold">Time Limit</p>
                  <p className="text-3xl font-bold text-gray-900">{test.time_limit || 30} min</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shadow-sm">
                  <Target size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-purple-700 text-sm font-semibold">Test Type</p>
                  <p className="text-xl font-bold text-gray-900 capitalize">
                    {test.test_type || "Standard"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-sm">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-orange-700 text-sm font-semibold">Department</p>
                  <p className="text-xl font-bold text-gray-900">
                    {test.department_name || "General"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Questions</h2>
              <p className="text-gray-600">Review all questions and their answers</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-4 py-2 bg-gradient-to-r from-[#0697b2] to-cyan-600 text-white rounded-full font-semibold">
                {test.questions?.length || 0} Questions
              </span>
            </div>
          </div>

          {test.questions && test.questions.length > 0 ? (
            <div className="space-y-4">
              {test.questions.map((q, index) => renderQuestionCard(q, index))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gray-100 flex items-center justify-center">
                <FileText size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Questions Yet</h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                This test is empty. Add some questions to make it useful for assessments.
              </p>
              <button
                onClick={() => onEdit(testId)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0697b2] to-cyan-600 text-white rounded-2xl hover:shadow-xl transition-all duration-300 font-semibold text-lg"
              >
                <Edit size={20} />
                Add Questions Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
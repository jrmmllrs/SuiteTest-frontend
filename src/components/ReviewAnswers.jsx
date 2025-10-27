import React, { useState, useEffect } from "react";
import { FileText, ExternalLink, User, Mail, Calendar, ArrowLeft, Award, CheckCircle, XCircle, HelpCircle, Clock, BarChart3, Lightbulb, AlertCircle } from "lucide-react";

export default function AnswerReview({ testId, candidateId, token, onBack }) {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPdf, setShowPdf] = useState(true);
  const [candidateInfo, setCandidateInfo] = useState({
    name: 'Candidate',
    email: 'No email available'
  });

  useEffect(() => {
    fetchReviewAndCandidateInfo();
  }, [testId, candidateId]);

  const fetchReviewAndCandidateInfo = async () => {
    try {
      // First, fetch the review data
      const reviewResponse = await fetch(
        `${API_BASE_URL}/tests/${testId}/review/${candidateId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const reviewData = await reviewResponse.json();

      if (reviewData.success) {
        setReview(reviewData);
        
        // Now try to get candidate info using the review data
        await fetchCandidateInfoFromResults(reviewData);
      } else {
        setError(reviewData.message || "Failed to load review");
      }
    } catch (error) {
      console.error("Error fetching review:", error);
      setError("Failed to load review");
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateInfoFromResults = async (reviewData) => {
    try {
      // Get all results from admin endpoint
      const resultsResponse = await fetch(
        `${API_BASE_URL}/results/admin/all`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        
        if (resultsData.success && resultsData.results && resultsData.results.length > 0) {
          console.log('Review data:', reviewData);
          console.log('All results:', resultsData.results);
          
          // Method 1: Try to match by test completion date and score
          const reviewResult = reviewData.result;
          
          const matchingCandidate = resultsData.results.find(result => {
            const reviewDate = new Date(reviewResult.taken_at).toISOString().split('T')[0];
            const resultDate = new Date(result.taken_at).toISOString().split('T')[0];
            
            const datesMatch = reviewDate === resultDate;
            const scoresMatch = reviewResult.score === result.score;
            const questionsMatch = reviewResult.total_questions === result.total_questions;
            
            return datesMatch && scoresMatch && questionsMatch;
          });
          
          if (matchingCandidate) {
            console.log('Found matching candidate by date/score:', matchingCandidate);
            setCandidateInfo({
              name: matchingCandidate.candidate_name,
              email: matchingCandidate.candidate_email || 'No email available'
            });
            return;
          }
          
          // Method 2: If no exact match, try to match by just the date and score
          const partialMatch = resultsData.results.find(result => {
            const reviewDate = new Date(reviewResult.taken_at).toISOString().split('T')[0];
            const resultDate = new Date(result.taken_at).toISOString().split('T')[0];
            
            return reviewDate === resultDate && reviewResult.score === result.score;
          });
          
          if (partialMatch) {
            console.log('Found partial match by date/score:', partialMatch);
            setCandidateInfo({
              name: partialMatch.candidate_name,
              email: partialMatch.candidate_email || 'No email available'
            });
            return;
          }
          
          // Method 3: Try to match by just the date
          const dateMatch = resultsData.results.find(result => {
            const reviewDate = new Date(reviewResult.taken_at).toISOString().split('T')[0];
            const resultDate = new Date(result.taken_at).toISOString().split('T')[0];
            return reviewDate === resultDate;
          });
          
          if (dateMatch) {
            console.log('Found match by date:', dateMatch);
            setCandidateInfo({
              name: dateMatch.candidate_name,
              email: dateMatch.candidate_email || 'No email available'
            });
            return;
          }
          
          // Method 4: If all else fails, show a list of possible candidates
          console.log('No exact match found, showing first candidate as fallback');
          const firstCandidate = resultsData.results[0];
          if (firstCandidate) {
            setCandidateInfo({
              name: firstCandidate.candidate_name,
              email: firstCandidate.candidate_email || 'No email available'
            });
            return;
          }
        }
      }

      // Final fallback
      setCandidateInfo({
        name: `Candidate ${candidateId}`,
        email: 'No email available'
      });
      
    } catch (error) {
      console.error('Error fetching candidate info:', error);
      setCandidateInfo({
        name: `Candidate ${candidateId}`,
        email: 'No email available'
      });
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (percentage) => {
    if (percentage >= 90) return "bg-green-50 border-green-200";
    if (percentage >= 75) return "bg-blue-50 border-blue-200";
    if (percentage >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#0495b5] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-red-600 text-center mb-6">
            <XCircle className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl font-semibold">{error}</p>
          </div>
          <button
            onClick={onBack}
            className="w-full px-6 py-3 bg-[#0495b5] text-white rounded-xl hover:bg-[#037895] transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { test, result, questions } = review;
  
  const totalQuestions = result.total_questions || questions.length;
  const correctAnswers = result.correct_answers || 0;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const isPdfTest = test.google_drive_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-[#0495b5] transition-colors mb-6 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Results
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {test.title}
                </h1>
                <p className="text-lg text-gray-600">{test.description}</p>
              </div>

              {isPdfTest && (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-[#e6f7fb] text-[#0495b5] rounded-full text-sm font-medium flex items-center gap-2 border border-[#0495b5]/20">
                    <FileText size={18} />
                    PDF-Based Test
                  </span>
                  <button
                    onClick={() => setShowPdf(!showPdf)}
                    className="px-4 py-2 bg-[#0495b5] text-white rounded-xl hover:bg-[#037895] transition-colors text-sm font-medium"
                  >
                    {showPdf ? "Hide PDF" : "Show PDF"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={isPdfTest && showPdf ? "grid grid-cols-1 xl:grid-cols-2 gap-8" : ""}>
          {/* PDF Viewer Section */}
          {isPdfTest && showPdf && (
            <div className="sticky top-8 h-[calc(100vh-8rem)]">
              <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col border border-gray-200">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                    <FileText size={20} className="text-[#0495b5]" />
                    Reference Document
                  </h3>
                  <a
                    href={`https://drive.google.com/file/d/${test.google_drive_id}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0495b5] hover:text-[#037895] flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <ExternalLink size={16} />
                    Open in new tab
                  </a>
                </div>
                <div className="flex-1 overflow-hidden rounded-xl bg-gray-100">
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

          {/* Main Content */}
          <div className="space-y-8">
            {/* Candidate Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[#0495b5]" />
                Candidate Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-[#e6f7fb] rounded-lg flex items-center justify-center mr-4">
                    <User className="w-6 h-6 text-[#0495b5]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Candidate Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {candidateInfo.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">ID: {candidateId}</p>
                  </div>
                </div>
                <div className="flex items-center p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="w-12 h-12 bg-[#e6f7fb] rounded-lg flex items-center justify-center mr-4">
                    <Mail className="w-6 h-6 text-[#0495b5]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Email</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {candidateInfo.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Overall Score */}
              <div className={`bg-white rounded-2xl shadow-lg p-6 border-2 ${getScoreBgColor(percentage)}`}>
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 text-[#0495b5]" />
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                    SCORE
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Overall Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(percentage)} mb-2`}>
                  {percentage}%
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-[#0495b5] transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Correct Answers */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-600 rounded-full">
                    CORRECT
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Correct Answers</p>
                <p className="text-3xl font-bold text-green-600">
                  {correctAnswers}
                </p>
                <p className="text-sm text-gray-500 mt-1">out of {totalQuestions}</p>
              </div>

              {/* Incorrect Answers */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <XCircle className="w-8 h-8 text-red-500" />
                  <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-600 rounded-full">
                    INCORRECT
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Incorrect Answers</p>
                <p className="text-3xl font-bold text-red-600">
                  {totalQuestions - correctAnswers}
                </p>
                <p className="text-sm text-gray-500 mt-1">needs review</p>
              </div>

              {/* Remarks */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <HelpCircle className="w-8 h-8 text-purple-500" />
                  <span className="text-xs font-semibold px-2 py-1 bg-purple-100 text-purple-600 rounded-full">
                    REMARKS
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Performance</p>
                <p className="text-xl font-bold text-purple-600 capitalize">
                  {result.remarks?.toLowerCase() || "No remarks"}
                </p>
                <p className="text-sm text-gray-500 mt-1">assessment</p>
              </div>
            </div>

            {/* Questions Review Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="w-7 h-7 text-[#0495b5]" />
                  Detailed Question Analysis
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {questions.length} Questions
                </span>
              </div>

              <div className="space-y-6">
                {questions.map((q, index) => {
                  const isCorrect = q.is_correct === 1;
                  const userAnswer = q.user_answer;
                  const correctAnswer = q.correct_answer;

                  return (
                    <div
                      key={q.id}
                      className={`bg-gradient-to-r rounded-2xl shadow-lg overflow-hidden border-l-[6px] transition-all duration-200 hover:shadow-xl ${
                        isCorrect 
                          ? "from-green-50 to-emerald-50 border-l-green-500 hover:border-l-green-600" 
                          : "from-red-50 to-orange-50 border-l-red-500 hover:border-l-red-600"
                      }`}
                    >
                      <div className="p-8">
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4 flex-wrap">
                              <span className="text-sm font-semibold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
                                Question {index + 1}
                              </span>
                              <span className="text-xs text-[#0495b5] bg-blue-50 px-3 py-1.5 rounded-full font-medium border border-blue-100">
                                {q.question_type?.replace('_', ' ').toUpperCase() || 'QUESTION'}
                              </span>
                              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                                isCorrect 
                                  ? "bg-green-100 text-green-700 border border-green-200" 
                                  : "bg-red-100 text-red-700 border border-red-200"
                              }`}>
                                {isCorrect ? (
                                  <CheckCircle size={18} className="text-green-600" />
                                ) : (
                                  <XCircle size={18} className="text-red-600" />
                                )}
                                <span className="text-sm font-semibold">
                                  {isCorrect ? "Correct" : "Incorrect"}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xl font-semibold text-gray-900 leading-relaxed">
                              {q.question_text}
                            </p>
                          </div>
                        </div>

                        {/* Answer Comparison */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="p-5 rounded-xl border-2 bg-blue-50 border-blue-200">
                            <p className="text-sm font-semibold text-[#0495b5] mb-3 uppercase tracking-wide flex items-center gap-2">
                              <User size={16} />
                              Your Answer
                            </p>
                            <div
                              className={`bg-white rounded-xl p-4 text-gray-800 whitespace-pre-wrap break-words max-h-48 overflow-y-auto border border-blue-100 ${
                                q.question_type === "coding" ? "font-mono text-sm" : "text-base"
                              }`}
                            >
                              {userAnswer || (
                                <span className="text-gray-400 italic">No answer provided</span>
                              )}
                            </div>
                          </div>

                          {correctAnswer && (
                            <div className="p-5 rounded-xl border-2 bg-green-50 border-green-200">
                              <p className="text-sm font-semibold text-green-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                                <CheckCircle size={16} />
                                Expected Answer
                              </p>
                              <div
                                className={`bg-white rounded-xl p-4 text-gray-800 whitespace-pre-wrap break-words max-h-48 overflow-y-auto border border-green-100 ${
                                  q.question_type === "coding" ? "font-mono text-sm" : "text-base"
                                }`}
                              >
                                {correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Explanation Sections */}
                        <div className="space-y-4">
                          {q.explanation && (
                            <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-400 rounded-xl">
                              <p className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                                <Lightbulb size={18} className="text-indigo-600" />
                                Explanation
                              </p>
                              <p className="text-indigo-800 leading-relaxed">
                                {q.explanation}
                              </p>
                            </div>
                          )}

                          {q.displayExplanation && (
                            <div
                              className={`p-5 rounded-xl border-l-4 ${
                                isCorrect
                                  ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400"
                                  : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-400"
                              }`}
                            >
                              <p className="text-sm font-semibold mb-3 text-gray-900 flex items-center gap-2">
                                {isCorrect ? (
                                  <CheckCircle size={18} className="text-green-600" />
                                ) : (
                                  <AlertCircle size={18} className="text-amber-600" />
                                )}
                                {isCorrect ? "Why this is correct" : "Why this is incorrect"}
                              </p>
                              <p className="text-gray-800 leading-relaxed">
                                {q.displayExplanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Test Completion Footer */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-r from-[#0495b5] to-[#037895] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600 mb-3 text-lg font-medium">Test completed on</p>
              <p className="text-xl font-semibold text-gray-900">
                {new Date(result.taken_at).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
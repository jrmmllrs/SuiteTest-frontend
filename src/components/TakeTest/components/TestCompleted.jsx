import React from "react";
import { CheckCircle } from "lucide-react";

export function TestCompleted({ submission, user, onNavigate, testId, onBack }) {
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
                  <svg
                    className="w-5 h-5"
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
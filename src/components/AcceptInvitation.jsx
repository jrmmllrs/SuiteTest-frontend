import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";

// ✅ FIXED: Move API_BASE_URL outside component for consistency
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function InvitationAccept({ token, onNavigate, onLogin }) {
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const authToken = localStorage.getItem("token");
    setIsLoggedIn(!!authToken);

    acceptInvitation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const acceptInvitation = async () => {
    try {
      // ✅ FIXED: Removed duplicate /api
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/accept?token=${token}`
      );

      const data = await response.json();

      if (data.success) {
        setInvitation(data.invitation);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error accepting invitation:", err);
      setError("Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    // Navigate to test
    onNavigate("take-test", invitation.testId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={onLogin}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Test Invitation
          </h2>
          <p className="text-gray-600">
            You've been invited to take: <strong>{invitation.testTitle}</strong>
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Test Details</h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-700 min-w-[120px]">
                Candidate:
              </span>
              <span className="text-gray-900">{invitation.candidateName}</span>
            </div>

            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-700 min-w-[120px]">
                Email:
              </span>
              <span className="text-gray-900">{invitation.candidateEmail}</span>
            </div>

            {invitation.testDescription && (
              <div className="flex items-start gap-3">
                <span className="font-medium text-gray-700 min-w-[120px]">
                  Description:
                </span>
                <span className="text-gray-900">
                  {invitation.testDescription}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-gray-900">
                {invitation.questionCount} questions
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Clock size={20} className="text-blue-600" />
              <span className="text-gray-900">
                {invitation.timeLimit} minutes time limit
              </span>
            </div>

            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-700 min-w-[120px]">
                Expires:
              </span>
              <span className="text-gray-900">
                {new Date(invitation.expiresAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {!isLoggedIn ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You need to login or register with the
                email <strong>{invitation.candidateEmail}</strong> to take this
                test.
              </p>
            </div>

            <button
              onClick={onLogin}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Login / Register to Take Test
            </button>
          </>
        ) : (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">
                <strong>You're logged in!</strong> Click the button below to
                start the test.
              </p>
            </div>

            <button
              onClick={handleStartTest}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Start Test
            </button>
          </>
        )}
      </div>
    </div>
  );
}

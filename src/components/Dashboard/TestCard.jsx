import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Mail,
  Users,
  Eye,
  FileText,
  Building,
} from "lucide-react";
import InvitationsListModal from "./InvitationsListModal";
import { API_BASE_URL } from "../../constants"; // ✅ Add this import

export default function TestCard({ test, user, userRole, onNavigate, onInvite, token }) {
  const [invitations, setInvitations] = useState([]);
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);

  useEffect(() => {
    if (
      (userRole === "employer" || userRole === "admin") &&
      test.created_by_me
    ) {
      fetchInvitationCount();
    }
  }, [test.id, userRole, test.created_by_me]);

  const fetchInvitationCount = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/test/${test.id}/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvitationCount(data.invitations?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching invitation count:", error);
    }
  };

  const fetchInvitations = async () => {
    if (userRole === "candidate") return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/test/${test.id}/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations);
        setInvitationCount(data.invitations?.length || 0);
        setShowInvitations(true);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const handleNavigate = (view, id, additionalParam = null) => {
    try {
      if (additionalParam !== null) {
        onNavigate(view, id, additionalParam);
      } else {
        onNavigate(view, id);
      }
    } catch (error) {
      console.error("Navigation error:", error);
      alert(`Navigation failed: ${error.message}`);
    }
  };

  const canTakeTest = test.is_available_to_take && !test.created_by_me;

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-lg">{test.title}</h4>
        <div className="flex flex-col gap-1">
          {test.test_type === "pdf_based" && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              PDF Test
            </span>
          )}
          {test.target_role === "employer" && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              For Staff
            </span>
          )}
          {canTakeTest && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
              Available
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {test.description || "No description"}
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CheckCircle size={16} className="text-green-600" />
          <span>{test.question_count || 0} questions</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} className="text-blue-600" />
          <span>{test.time_limit} minutes</span>
        </div>
        {test.department_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building size={16} className="text-purple-600" />
            <span>{test.department_name}</span>
          </div>
        )}
        {userRole === "candidate" && test.created_by_name && (
          <p className="text-xs text-gray-500">By: {test.created_by_name}</p>
        )}
        {test.created_by_name && canTakeTest && (
          <p className="text-xs text-gray-500">
            Created by: {test.created_by_name}
          </p>
        )}
        {userRole === "candidate" && test.is_completed && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <CheckCircle size={16} />
            <span>Completed</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        {userRole === "employer" || userRole === "admin" ? (
          <div className="space-y-2">
            {canTakeTest ? (
              <div className="space-y-2">
                {test.is_completed ? (
                  <button
                    onClick={() =>
                      handleNavigate("answer-review", test.id, user.id)
                    }
                    className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                  >
                    <FileText size={16} />
                    View Answer Review
                  </button>
                ) : test.is_in_progress ? (
                  <button
                    onClick={() => handleNavigate("take-test", test.id)}
                    className="w-full px-4 py-2 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700 font-medium"
                  >
                    Continue Test
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate("take-test", test.id)}
                    className="w-full px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 font-medium"
                  >
                    Take Test
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavigate("view-test", test.id)}
                    className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={() => handleNavigate("test-results", test.id)}
                    className="px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={14} />
                    Results
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onInvite(test)}
                    className="px-3 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 flex items-center justify-center gap-1"
                  >
                    <Mail size={14} />
                    Invite
                  </button>
                  <button
                    onClick={fetchInvitations}
                    className="px-3 py-2 text-sm text-purple-700 bg-purple-50 rounded hover:bg-purple-100 flex items-center justify-center gap-1"
                  >
                    <Users size={14} />
                    Invites ({invitationCount})
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleNavigate("proctoring-events", test.id, null)
                  }
                  className="w-full px-3 py-2 text-sm text-red-700 bg-red-50 rounded hover:bg-red-100"
                >
                  View Proctoring Events
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {test.is_completed ? (
              <button
                onClick={() =>
                  handleNavigate("answer-review", test.id, user.id)
                }
                className="w-full px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
              >
                <FileText size={16} />
                View Answer Review
              </button>
            ) : test.is_in_progress ? (
              <button
                onClick={() => handleNavigate("take-test", test.id)}
                className="w-full px-4 py-2 text-sm text-white bg-yellow-600 rounded hover:bg-yellow-700 font-medium"
              >
                Continue Test
              </button>
            ) : (
              <button
                onClick={() => handleNavigate("take-test", test.id)}
                className="w-full px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700 font-medium"
              >
                Take Test
              </button>
            )}
          </div>
        )}
      </div>

      {showInvitations && (
        <InvitationsListModal
          invitations={invitations}
          testTitle={test.title}
          token={token}
          onClose={() => setShowInvitations(false)}
        />
      )}
    </div>
  );
}

// File path: src/components/dashboard/TestCard.jsx
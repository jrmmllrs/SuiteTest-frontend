import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Mail,
  Users,
  Eye,
  FileText,
  Building,
  Trash2,
  Edit,
  MoreVertical,
  Play,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import InvitationsListModal from "./InvitationsListModal";
import { API_BASE_URL } from "../../constants";

export default function TestCard({
  test,
  user,
  userRole,
  onNavigate,
  onInvite,
  onDelete,
  token,
}) {
  const [invitations, setInvitations] = useState([]);
  const [showInvitations, setShowInvitations] = useState(false);
  const [invitationCount, setInvitationCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const primaryColor = "#0697b2";

  useEffect(() => {
    if (
      (userRole === "employer" || userRole === "admin") &&
      test.created_by_me
    ) {
      fetchInvitationCount();
    }
  }, [test.id, userRole, test.created_by_me]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest(".menu-container")) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

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

  // FIXED: Added proper error handling and loading state
  const fetchInvitations = async () => {
    if (userRole === "candidate") return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/invitations/test/${test.id}/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations || []);
        setInvitationCount(data.invitations?.length || 0);
        setShowInvitations(true);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setIsLoading(false);
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

  const handleMenuAction = (action, e) => {
    e.stopPropagation();
    setShowMenu(false);

    switch (action) {
      case "edit":
        handleNavigate("edit-test", test.id);
        break;
      case "delete":
        onDelete(test);
        break;
      default:
        break;
    }
  };

  const canTakeTest = test.is_available_to_take && !test.created_by_me;
  const canManageTest =
    test.created_by_me && (userRole === "employer" || userRole === "admin");

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-300 group hover:border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            {test.test_type === "pdf_based" && (
              <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                PDF
              </span>
            )}
            {test.target_role === "employer" && (
              <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium border border-purple-100">
                Staff
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-gray-700 transition-colors">
            {test.title}
          </h3>

          <p className="text-sm text-gray-600 leading-relaxed">
            {test.description || "No description provided"}
          </p>
        </div>

        {/* Actions Menu */}
        {canManageTest && (
          <div className="menu-container relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-500"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-10 min-w-[140px]">
                <button
                  onClick={(e) => handleMenuAction("edit", e)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                >
                  <Edit size={16} />
                  Edit Test
                </button>
                <button
                  onClick={(e) => handleMenuAction("delete", e)}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Test
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-green-500" />
          <span>{test.question_count || 0} questions</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" />
          <span>{test.time_limit} min</span>
        </div>
        {test.department_name && (
          <div className="flex items-center gap-2">
            <Building size={16} className="text-purple-500" />
            <span>{test.department_name}</span>
          </div>
        )}
      </div>

      {/* Creator Info */}
      {test.created_by_name && (
        <div className="text-xs text-gray-500 mb-4">
          Created by {test.created_by_name}
        </div>
      )}

      {/* Actions */}
      <div className="pt-4 border-t border-gray-100">
        {userRole === "employer" || userRole === "admin" ? (
          <div className="space-y-3">
            {canTakeTest ? (
              <TestActionButton
                test={test}
                user={user}
                onNavigate={handleNavigate}
                primaryColor={primaryColor}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleNavigate("view-test", test.id)}
                    className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleNavigate("test-results", test.id)}
                    className="px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <BarChart3 size={16} />
                    Results
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onInvite(test)}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Mail size={16} />
                    Invite
                  </button>
                  <button
                    onClick={fetchInvitations}
                    disabled={isLoading}
                    className="px-4 py-2.5 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Users size={16} />
                    {isLoading ? "Loading..." : `Invites (${invitationCount})`}
                  </button>
                </div>

                <button
                  onClick={() => handleNavigate("proctoring-events", test.id)}
                  className="w-full px-4 py-2.5 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  View Proctoring Events
                </button>
              </>
            )}
          </div>
        ) : (
          <TestActionButton
            test={test}
            user={user}
            onNavigate={handleNavigate}
            primaryColor={primaryColor}
          />
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

// Separate component for test actions to reduce redundancy
const TestActionButton = ({ test, user, onNavigate, primaryColor }) => {
  if (test.is_completed) {
    return (
      <button
        onClick={() => onNavigate("answer-review", test.id, user.id)}
        className="w-full px-4 py-3 text-white rounded-lg hover:shadow-md transition-all flex items-center justify-between group"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <FileText size={16} />
          View Answer Review
        </div>
        <ChevronRight
          size={16}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>
    );
  }

  if (test.is_in_progress) {
    return (
      <button
        onClick={() => onNavigate("take-test", test.id)}
        className="w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-between group"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Play size={16} />
          Continue Test
        </div>
        <ChevronRight
          size={16}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </button>
    );
  }

  return (
    <button
      onClick={() => onNavigate("take-test", test.id)}
      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-between group"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Play size={16} />
        Take Test
      </div>
      <ChevronRight
        size={16}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </button>
  );
};

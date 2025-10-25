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
  AlertCircle,
  CheckCircle2,
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
  const [isDepartmentInactive, setIsDepartmentInactive] = useState(false);
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentName, setDepartmentName] = useState("");

  const primaryColor = "#0697b2";

  useEffect(() => {
    if (
      (userRole === "employer" || userRole === "admin") &&
      test.created_by_me
    ) {
      fetchInvitationCount();
    }
  }, [test.id, userRole, test.created_by_me, token]);

  useEffect(() => {
    // Check department status for ALL tests that have department_id
    if (test.department_id) {
      checkDepartmentStatus();
    } else {
      // If no department, set default state
      setIsDepartmentInactive(false);
      setDepartmentName("");
    }
  }, [test.department_id, token]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && !e.target.closest(".menu-container")) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  const checkDepartmentStatus = async () => {
    if (!test.department_id) {
      setIsDepartmentInactive(false);
      setDepartmentName("");
      return;
    }

    try {
      setDepartmentLoading(true);
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.departments) {
        const department = data.departments.find(
          (dept) => dept.id === test.department_id
        );
        if (department) {
          setIsDepartmentInactive(department.is_active === 0);
          setDepartmentName(department.name || test.department_name || "");
        } else {
          setIsDepartmentInactive(false);
          setDepartmentName(test.department_name || "");
        }
      }
    } catch (error) {
      console.error("Error checking department status:", error);
      setIsDepartmentInactive(false);
      setDepartmentName(test.department_name || "");
    } finally {
      setDepartmentLoading(false);
    }
  };

  const fetchInvitationCount = async () => {
    try {
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
        setInvitationCount(data.invitations?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching invitation count:", error);
    }
  };

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
        if (onDelete) {
          onDelete(test);
        }
        break;
      default:
        break;
    }
  };

  const canTakeTest = test.is_available_to_take && !test.created_by_me;
  const canManageTest =
    test.created_by_me && (userRole === "employer" || userRole === "admin");

  const DepartmentStatus = () => {
    if (!test.department_id) {
      // No department assigned - show neutral state
      return (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
          <Building size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              No Department Assigned
            </p>
            <p className="text-xs text-gray-700 mt-1">
              This test is not assigned to any specific department.
            </p>
          </div>
        </div>
      );
    }

    if (departmentLoading) {
      return (
        <div className="mb-3 p-3 bg-gray-100 border border-gray-200 rounded-lg flex items-start gap-2">
          <div className="animate-pulse bg-gray-300 rounded-full w-4 h-4 flex-shrink-0 mt-0.5"></div>
          <div className="flex-1 space-y-2">
            <div className="animate-pulse bg-gray-300 rounded h-3 w-24"></div>
            <div className="animate-pulse bg-gray-300 rounded h-2 w-32"></div>
          </div>
        </div>
      );
    }

    if (isDepartmentInactive) {
      return (
        <div className="mb-3 p-3 bg-red-100 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle
            size={16}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">
              Department is Inactive
            </p>
            <p className="text-xs text-red-700 mt-1">
              This test may not be accessible to candidates until the department
              is reactivated.
            </p>
          </div>
        </div>
      );
    }

    // Active department
    return (
      <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-start gap-2">
        <CheckCircle2
          size={16}
          className="text-gray-500 flex-shrink-0 mt-0.5"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Active Department</p>
          <p className="text-xs text-gray-700 mt-1">
            This test is available to candidates in the{" "}
            <strong>{departmentName}</strong> department.
          </p>
        </div>
      </div>
    );
  };

  // Determine card styling based on department status
  const getCardStyle = () => {
    if (!test.department_id) {
      return "border-gray-100 bg-white hover:border-gray-200";
    }
    if (isDepartmentInactive) {
      return "border-red-200 bg-red-50 hover:border-red-300";
    }
    return "border-green-100 bg-green-50 hover:border-green-200";
  };

  // Determine text color based on department status
  const getTextColor = () => {
    if (!test.department_id) {
      return "text-gray-600";
    }
    if (isDepartmentInactive) {
      return "text-red-700";
    }
    return "text-green-700";
  };

  return (
    <div
      className={`bg-white rounded-xl border p-5 hover:shadow-lg transition-all duration-300 group flex flex-col h-full min-h-[320px] ${getCardStyle()}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* Department Status Badge */}
            {test.department_id && (
              <>
                {isDepartmentInactive ? (
                  <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium border border-red-200 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Inactive Department
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium border border-green-200 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    Active Department
                  </span>
                )}
              </>
            )}

            {/* No Department Badge */}
            {!test.department_id && (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 flex items-center gap-1">
                <Building size={12} />
                No Department
              </span>
            )}

            {departmentLoading && (
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                Loading...
              </span>
            )}

            {/* Test Type Badges */}
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

            {/* Test Status Badges */}
            {test.is_completed && (
              <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                Completed
              </span>
            )}
            {test.is_in_progress && !test.is_completed && (
              <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                In Progress
              </span>
            )}
          </div>

          <h3
            className="font-semibold text-lg mb-2 group-hover:text-gray-700 transition-colors truncate text-gray-900"
            title={test.title}
          >
            {test.title}
          </h3>

          <p
            className="text-sm leading-relaxed line-clamp-2 text-gray-600"
            title={test.description || "No description provided"}
          >
            {test.description || "No description provided"}
          </p>
        </div>

        {/* Actions Menu */}
        {canManageTest && (
          <div className="menu-container relative flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={`p-2 rounded-lg transition-colors ${
                isDepartmentInactive
                  ? "text-red-500 hover:bg-red-100"
                  : test.department_id
                  ? "text-green-600 hover:bg-green-100"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
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

      {/* Content Area - Flexible */}
      <div className="flex-1 flex flex-col">
        {/* Metrics */}
        <div
          className={`flex items-center gap-4 mb-3 text-sm flex-wrap ${getTextColor()}`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle
              size={16}
              className={
                !test.department_id
                  ? "text-gray-500"
                  : isDepartmentInactive
                  ? "text-red-500"
                  : "text-green-500"
              }
            />
            <span>{test.question_count || 0} questions</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock
              size={16}
              className={
                !test.department_id
                  ? "text-gray-500"
                  : isDepartmentInactive
                  ? "text-red-500"
                  : "text-green-500"
              }
            />
            <span>{test.time_limit} min</span>
          </div>
          {departmentName && (
            <div className="flex items-center gap-2">
              <Building
                size={16}
                className={
                  !test.department_id
                    ? "text-gray-500"
                    : isDepartmentInactive
                    ? "text-red-500"
                    : "text-green-500"
                }
              />
              <span className="truncate max-w-[120px]" title={departmentName}>
                {departmentName}
              </span>
            </div>
          )}
        </div>

        {/* Creator Info */}
        {test.created_by_name && (
          <div className="text-xs mb-3 text-gray-500">
            Created by {test.created_by_name}
          </div>
        )}

        {/* Department Status Component - LAGI NAKADISPLAY */}
        <DepartmentStatus />
      </div>

      {/* Actions - Fixed at bottom */}
      <div
        className={`pt-4 border-t ${
          !test.department_id
            ? "border-gray-100"
            : isDepartmentInactive
            ? "border-red-200"
            : "border-green-200"
        }`}
      >
        {userRole === "employer" || userRole === "admin" ? (
          <div className="space-y-3">
            {canTakeTest ? (
              <TestActionButton
                test={test}
                user={user}
                onNavigate={handleNavigate}
                primaryColor={primaryColor}
                isDepartmentInactive={isDepartmentInactive}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleNavigate("view-test", test.id)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      !test.department_id
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : isDepartmentInactive
                        ? "bg-red-100 text-red-700 hover:bg-red-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    onClick={() => handleNavigate("test-results", test.id)}
                    className="px-4 py-2.5 text-sm font-medium text-white rounded-lg hover:shadow-md transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                    disabled={isDepartmentInactive}
                  >
                    <BarChart3 size={16} />
                    Results
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onInvite && onInvite(test)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isDepartmentInactive
                        ? "bg-red-200 text-red-700 hover:bg-red-300 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                    disabled={isDepartmentInactive || !onInvite}
                  >
                    <Mail size={16} />
                    {isDepartmentInactive ? "Cannot Invite" : "Invite"}
                  </button>
                  <button
                    onClick={fetchInvitations}
                    disabled={isLoading || isDepartmentInactive}
                    className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      !test.department_id
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : isDepartmentInactive
                        ? "bg-red-100 text-red-500 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Users size={16} />
                    {isLoading ? "Loading..." : `Invites (${invitationCount})`}
                  </button>
                </div>

                <button
                  onClick={() => handleNavigate("proctoring-events", test.id)}
                  className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    !test.department_id
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : isDepartmentInactive
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
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
            isDepartmentInactive={isDepartmentInactive}
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

// TestActionButton Component (walang pagbabago)
const TestActionButton = ({
  test,
  user,
  onNavigate,
  primaryColor,
  isDepartmentInactive,
}) => {
  if (test.is_completed) {
    return (
      <button
        onClick={() => onNavigate("answer-review", test.id, user?.id)}
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
        className={`w-full px-4 py-3 text-white rounded-lg transition-colors flex items-center justify-between group ${
          isDepartmentInactive
            ? "bg-red-400 cursor-not-allowed"
            : "bg-amber-500 hover:bg-amber-600"
        }`}
        disabled={isDepartmentInactive}
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <Play size={16} />
          {isDepartmentInactive ? "Test Unavailable" : "Continue Test"}
        </div>
        {!isDepartmentInactive && (
          <ChevronRight
            size={16}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => onNavigate("take-test", test.id)}
      className={`w-full px-4 py-3 text-white rounded-lg transition-colors flex items-center justify-between group ${
        isDepartmentInactive
          ? "bg-red-400 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-700"
      }`}
      disabled={isDepartmentInactive}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Play size={16} />
        {isDepartmentInactive ? "Test Unavailable" : "Take Test"}
      </div>
      {!isDepartmentInactive && (
        <ChevronRight
          size={16}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      )}
    </button>
  );
};

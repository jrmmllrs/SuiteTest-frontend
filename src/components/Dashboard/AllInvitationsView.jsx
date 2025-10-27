// File: src/components/dashboard/AllInvitationsView.jsx
import React, { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Search,
  Filter,
  Send,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Users,
  Calendar,
  Zap,
} from "lucide-react";
import InviteModal from "./InviteModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AllInvitationsView({ token, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [allInvitations, setAllInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTests, setExpandedTests] = useState(new Set());
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch tests
      const testsResponse = await fetch(`${API_BASE_URL}/tests/my-tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const testsData = await testsResponse.json();

      if (testsData.success && testsData.tests) {
        setTests(testsData.tests);

        // Fetch invitations for all tests
        const invitationsPromises = testsData.tests.map((test) =>
          fetch(`${API_BASE_URL}/invitations/test/${test.id}/invitations`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((res) => res.json())
            .then((data) => ({
              testId: test.id,
              testTitle: test.title,
              invitations: data.success ? data.invitations : [],
            }))
            .catch(() => ({
              testId: test.id,
              testTitle: test.title,
              invitations: [],
            }))
        );

        const invitationsData = await Promise.all(invitationsPromises);

        // Flatten invitations with test info
        const flatInvitations = invitationsData.flatMap((item) =>
          item.invitations.map((inv) => ({
            ...inv,
            test_id: item.testId,
            test_title: item.testTitle,
          }))
        );

        setAllInvitations(flatInvitations);

        // Auto-expand tests that have invitations
        const testsWithInvitations = new Set(
          flatInvitations.map((inv) => inv.test_id)
        );
        setExpandedTests(testsWithInvitations);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (invitationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/send-reminder/${invitationId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Reminder sent successfully!");
      } else {
        alert("Failed to send reminder: " + data.message);
      }
    } catch (err) {
      console.error("Error sending reminder:", err);
      alert("Failed to send reminder. Check your connection.");
    }
  };

  const deleteInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/invitation/${invitationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setAllInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitationId)
        );
        alert("Invitation cancelled");
      } else {
        alert("Failed to cancel invitation: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting invitation:", err);
      alert("Failed to cancel invitation. Check your connection.");
    }
  };

  const toggleTestExpanded = (testId) => {
    setExpandedTests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(testId)) {
        newSet.delete(testId);
      } else {
        newSet.add(testId);
      }
      return newSet;
    });
  };

  const openInviteModal = (test) => {
    setSelectedTest(test);
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedTest(null);
    fetchData(); // Refresh data after sending invitations
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-amber-500" size={16} />;
      case "accepted":
        return <AlertCircle className="text-blue-500" size={16} />;
      case "completed":
        return <CheckCircle className="text-emerald-500" size={16} />;
      case "expired":
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Mail className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 border border-amber-200";
      case "accepted":
        return "bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-700 border border-blue-200";
      case "completed":
        return "bg-gradient-to-r from-emerald-500/15 to-green-500/15 text-emerald-700 border border-emerald-200";
      case "expired":
        return "bg-gradient-to-r from-red-500/15 to-rose-500/15 text-red-700 border border-red-200";
      default:
        return "bg-gradient-to-r from-gray-500/15 to-gray-600/15 text-gray-700 border border-gray-200";
    }
  };

  // Filter invitations
  const filteredInvitations = allInvitations.filter((inv) => {
    const matchesSearch =
      inv.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.candidate_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.test_title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Group by test
  const invitationsByTest = tests
    .map((test) => ({
      test,
      invitations: filteredInvitations.filter((inv) => inv.test_id === test.id),
    }))
    .filter((item) => item.invitations.length > 0);

  // Calculate stats
  const stats = {
    total: allInvitations.length,
    pending: allInvitations.filter((i) => i.status === "pending").length,
    accepted: allInvitations.filter((i) => i.status === "accepted").length,
    completed: allInvitations.filter((i) => i.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block w-16 h-16 border-4 border-[#0495b5]/20 border-t-[#0495b5] rounded-full animate-spin mb-5" />
        <p className="text-gray-600 font-medium text-lg">
          Loading invitations...
        </p>
        <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm">
        <div className="p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shadow-inner border border-teal-100">
            <Mail className="text-[#0495b5]" size={48} />
          </div>
          <p className="text-gray-900 font-semibold text-xl mb-3">
            No tests created yet
          </p>
          <p className="text-gray-600 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            Create a test first to send invitations to candidates
          </p>
          <button
            onClick={() => onNavigate("create-test")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25 hover:shadow-xl hover:shadow-[#0495b5]/30 transform hover:-translate-y-0.5"
          >
            <Plus size={20} />
            Create New Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#0495b5]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Total Invitations
              </p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-[#0495b5] transition-colors">
                {stats.total}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30 group-hover:scale-110 transition-transform">
              <Mail size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-amber-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Pending</p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                {stats.pending}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
              <Clock size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-blue-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Accepted</p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {stats.accepted}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <AlertCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-emerald-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">
                Completed
              </p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {stats.completed}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by candidate name, email, or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200"
            />
          </div>

          <div className="relative">
            <Filter
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-10 pr-8 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] bg-white transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:shadow-sm"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Invitations List */}
      {filteredInvitations.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shadow-inner border border-teal-100">
            <Mail className="text-[#0495b5]" size={48} />
          </div>
          <p className="text-gray-900 font-semibold text-xl mb-3">
            {searchQuery || statusFilter !== "all"
              ? "No invitations found"
              : "No invitations sent yet"}
          </p>
          <p className="text-gray-600 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your filters or search terms"
              : "Send invitations to candidates from your test cards"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Zap size={16} className="text-amber-500" />
              <span>Start by inviting candidates to your tests</span>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {invitationsByTest.map(({ test, invitations }) => (
            <div
              key={test.id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Test Header - Collapsible - FIXED: Removed nested button */}
              <div
                onClick={() => toggleTestExpanded(test.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50/50 transition-all duration-200 border-b border-gray-200 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                    {expandedTests.has(test.id) ? (
                      <ChevronDown size={20} className="text-white" />
                    ) : (
                      <ChevronRight size={20} className="text-white" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">
                      {test.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                      <Users size={14} />
                      {invitations.length} invitation
                      {invitations.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openInviteModal(test);
                  }}
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25 hover:shadow-xl hover:shadow-[#0495b5]/30 transform hover:-translate-y-0.5"
                >
                  <Mail size={18} />
                  Send Invitation
                </button>
              </div>

              {/* Invitations Table - Collapsible */}
              {expandedTests.has(test.id) && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Candidate
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Invited
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Expires
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invitations.map((invitation) => (
                          <tr
                            key={invitation.id}
                            className={`transition-all duration-200 ${
                              hoveredRow === invitation.id
                                ? "bg-gradient-to-r from-teal-50/50 to-cyan-50/50 transform scale-[1.01] shadow-sm"
                                : "hover:bg-gray-50/50"
                            }`}
                            onMouseEnter={() => setHoveredRow(invitation.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                                  <span className="text-white font-bold text-sm">
                                    {invitation.candidate_name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "U"}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {invitation.candidate_name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {invitation.candidate_email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(invitation.status)}
                                <span
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${getStatusColor(
                                    invitation.status
                                  )}`}
                                >
                                  {invitation.status.charAt(0).toUpperCase() +
                                    invitation.status.slice(1)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar
                                  size={14}
                                  className="text-[#0495b5]"
                                />
                                {new Date(
                                  invitation.invited_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock size={14} className="text-[#0495b5]" />
                                {new Date(
                                  invitation.expires_at
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-end gap-2">
                                {invitation.status === "pending" && (
                                  <button
                                    onClick={() => sendReminder(invitation.id)}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                                    title="Send Reminder"
                                  >
                                    <Send size={14} />
                                    Remind
                                  </button>
                                )}
                                {invitation.status !== "completed" && (
                                  <button
                                    onClick={() =>
                                      deleteInvitation(invitation.id)
                                    }
                                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl hover:from-red-100 hover:to-rose-100 transition-all duration-200 border border-red-200 hover:border-red-300 hover:shadow-sm"
                                    title="Cancel Invitation"
                                  >
                                    <Trash2 size={14} />
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showInviteModal && selectedTest && (
        <InviteModal
          test={selectedTest}
          token={token}
          onClose={closeInviteModal}
        />
      )}
    </div>
  );
}

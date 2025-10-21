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
} from "lucide-react";
import InviteModal from "./InviteModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AllInvitationsView({ user, token, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [allInvitations, setAllInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedTests, setExpandedTests] = useState(new Set());

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
        const invitationsPromises = testsData.tests.map(test =>
          fetch(`${API_BASE_URL}/invitations/test/${test.id}/invitations`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then(res => res.json())
          .then(data => ({
            testId: test.id,
            testTitle: test.title,
            invitations: data.success ? data.invitations : []
          }))
          .catch(() => ({ testId: test.id, testTitle: test.title, invitations: [] }))
        );
        
        const invitationsData = await Promise.all(invitationsPromises);
        
        // Flatten invitations with test info
        const flatInvitations = invitationsData.flatMap(item =>
          item.invitations.map(inv => ({
            ...inv,
            test_id: item.testId,
            test_title: item.testTitle,
          }))
        );
        
        setAllInvitations(flatInvitations);
        
        // Auto-expand tests that have invitations
        const testsWithInvitations = new Set(
          flatInvitations.map(inv => inv.test_id)
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
        setAllInvitations(prev => prev.filter(inv => inv.id !== invitationId));
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
    setExpandedTests(prev => {
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
        return <Clock className="text-yellow-600" size={16} />;
      case "accepted":
        return <AlertCircle className="text-blue-600" size={16} />;
      case "completed":
        return <CheckCircle className="text-green-600" size={16} />;
      case "expired":
        return <XCircle className="text-red-600" size={16} />;
      default:
        return <Mail className="text-gray-600" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Filter invitations
  const filteredInvitations = allInvitations.filter(inv => {
    const matchesSearch = 
      inv.candidate_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.candidate_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.test_title?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group by test
  const invitationsByTest = tests.map(test => ({
    test,
    invitations: filteredInvitations.filter(inv => inv.test_id === test.id)
  })).filter(item => item.invitations.length > 0);

  // Calculate stats
  const stats = {
    total: allInvitations.length,
    pending: allInvitations.filter(i => i.status === "pending").length,
    accepted: allInvitations.filter(i => i.status === "accepted").length,
    completed: allInvitations.filter(i => i.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading invitations...</p>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Mail className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-2">
            No tests created yet
          </p>
          <p className="text-gray-600 text-sm mb-4">
            Create a test first to send invitations to candidates
          </p>
          <button
            onClick={() => onNavigate("create-test")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            Create New Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Total Invitations</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Accepted</p>
          <p className="text-3xl font-bold text-blue-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by candidate name, email, or test..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent bg-white"
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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {/* Invitations List */}
      {filteredInvitations.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Mail className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-2">
            {searchQuery || statusFilter !== "all" ? "No invitations found" : "No invitations sent yet"}
          </p>
          <p className="text-gray-600 text-sm">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your filters or search terms"
              : "Send invitations to candidates from your test cards"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invitationsByTest.map(({ test, invitations }) => (
            <div key={test.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Test Header - Collapsible */}
              <button
                onClick={() => toggleTestExpanded(test.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {expandedTests.has(test.id) ? (
                    <ChevronDown size={20} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={20} className="text-gray-400" />
                  )}
                  <div className="text-left">
                    <h3 className="text-base font-semibold text-gray-900">{test.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {invitations.length} invitation{invitations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openInviteModal(test);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Mail size={16} />
                  Send Invitation
                </button>
              </button>

              {/* Invitations Table - Collapsible */}
              {expandedTests.has(test.id) && (
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Candidate</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Invited</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Expires</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invitations.map((invitation) => (
                          <tr key={invitation.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{invitation.candidate_name}</p>
                                <p className="text-xs text-gray-600">{invitation.candidate_email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(invitation.status)}
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(invitation.status)}`}>
                                  {invitation.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(invitation.invited_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(invitation.expires_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {invitation.status === "pending" && (
                                  <button
                                    onClick={() => sendReminder(invitation.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                                    title="Send Reminder"
                                  >
                                    <Send size={12} />
                                    Remind
                                  </button>
                                )}
                                {invitation.status !== "completed" && (
                                  <button
                                    onClick={() => deleteInvitation(invitation.id)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
                                    title="Cancel Invitation"
                                  >
                                    <Trash2 size={12} />
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
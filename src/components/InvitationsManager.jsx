import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function InvitationsManager({ testId, token }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvitations();
  }, [testId]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/invitations/test/${testId}/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
      setError("Failed to load invitations. Check your connection.");
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
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));
        alert("Invitation cancelled");
      } else {
        alert("Failed to cancel invitation: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting invitation:", err);
      alert("Failed to cancel invitation. Check your connection.");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-600" size={18} />;
      case "accepted":
        return <AlertCircle className="text-blue-600" size={18} />;
      case "completed":
        return <CheckCircle className="text-green-600" size={18} />;
      case "expired":
        return <XCircle className="text-red-600" size={18} />;
      default:
        return <Mail className="text-gray-600" size={18} />;
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="text-center py-16">
          <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Loading invitations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-2">Error Loading Invitations</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInvitations}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = {
    pending: invitations.filter((i) => i.status === "pending").length,
    accepted: invitations.filter((i) => i.status === "accepted").length,
    completed: invitations.filter((i) => i.status === "completed").length,
    total: invitations.length,
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Test Invitations</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Manage invitations sent for this test
            </p>
          </div>
          <button
            onClick={fetchInvitations}
            className="p-2 text-gray-600 hover:text-[#0698b2] hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      {invitations.length > 0 && (
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {invitations.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Mail className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-900 font-semibold text-lg mb-2">No invitations sent yet</p>
          <p className="text-gray-600 text-sm">
            Click "Invite" on the test card to send invitations
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Invited
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {invitation.candidate_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invitation.candidate_email}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invitation.status)}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                          invitation.status
                        )}`}
                      >
                        {invitation.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {new Date(invitation.invited_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      {invitation.status === "pending" && (
                        <button
                          onClick={() => sendReminder(invitation.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                          title="Send Reminder"
                        >
                          <Send size={14} />
                          Remind
                        </button>
                      )}
                      {invitation.status !== "completed" && (
                        <button
                          onClick={() => deleteInvitation(invitation.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
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
      )}
    </div>
  );
}
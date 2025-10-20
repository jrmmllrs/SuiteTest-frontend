import React, { useState, useEffect } from "react";
import { Mail, Send, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

// Simple API URL - Change this if your backend is on different port
const API_BASE_URL = "http://localhost:5000";

export default function InvitationsManager({ testId, token }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/test/${testId}/invitations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvitations(data.invitations);
      }
    } catch (err) {
      console.error("Error fetching invitations:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (invitationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/send-reminder/${invitationId}`,
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
      alert("Failed to send reminder");
    }
  };

  const deleteInvitation = async (invitationId) => {
    if (!window.confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/invitations/invitation/${invitationId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));
        alert("Invitation cancelled");
      }
    } catch (err) {
      console.error("Error deleting invitation:", err);
      alert("Failed to cancel invitation");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="text-yellow-600" size={20} />;
      case "accepted":
        return <AlertCircle className="text-blue-600" size={20} />;
      case "completed":
        return <CheckCircle className="text-green-600" size={20} />;
      case "expired":
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <Mail className="text-gray-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "expired":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading invitations...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Test Invitations</h3>
        <p className="text-sm text-gray-600 mt-1">
          Manage invitations sent for this test
        </p>
      </div>

      {invitations.length === 0 ? (
        <div className="p-8 text-center">
          <Mail className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No invitations sent yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Click "Invite Candidates" to send test invitations
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invited
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.map((invitation) => (
                <tr key={invitation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {invitation.candidate_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invitation.candidate_email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invitation.status)}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          invitation.status
                        )}`}
                      >
                        {invitation.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(invitation.invited_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(invitation.expires_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {invitation.status === "pending" && (
                        <button
                          onClick={() => sendReminder(invitation.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                          title="Send Reminder"
                        >
                          <Send size={14} />
                          Remind
                        </button>
                      )}
                      {invitation.status !== "completed" && (
                        <button
                          onClick={() => deleteInvitation(invitation.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
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

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <div className="space-x-4">
            <span>
              Pending:{" "}
              <strong>
                {invitations.filter((i) => i.status === "pending").length}
              </strong>
            </span>
            <span>
              Accepted:{" "}
              <strong>
                {invitations.filter((i) => i.status === "accepted").length}
              </strong>
            </span>
            <span>
              Completed:{" "}
              <strong>
                {invitations.filter((i) => i.status === "completed").length}
              </strong>
            </span>
          </div>
          <span>Total: <strong>{invitations.length}</strong></span>
        </div>
      </div>
    </div>
  );
}
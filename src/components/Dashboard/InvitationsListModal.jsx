import React from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/";

export default function InvitationsListModal({ invitations, testTitle, token, onClose }) {
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
        alert(data.message || "Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      expired: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs rounded-full ${styles[status] || "bg-gray-100 text-gray-800"}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Invitations - {testTitle}</h2>
        </div>
        <div className="p-6">
          {invitations.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No invitations sent yet
            </p>
          ) : (
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{inv.candidate_name}</p>
                      <p className="text-sm text-gray-600">{inv.candidate_email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Invited: {new Date(inv.invited_at).toLocaleString()}
                      </p>
                      {inv.accepted_at && (
                        <p className="text-xs text-gray-500">
                          Accepted: {new Date(inv.accepted_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(inv.status)}
                      {inv.status === "pending" && (
                        <button
                          onClick={() => sendReminder(inv.id)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Send Reminder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-6 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

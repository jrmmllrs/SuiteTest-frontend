import React from "react";
import { 
  X, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Mail, 
  Calendar,
  User,
  Sparkles,
  RefreshCw
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function InvitationsListModal({ invitations, testTitle, token, onClose }) {
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
        alert(data.message || "Failed to send reminder");
      }
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-amber-500/15 text-amber-700 border-amber-200",
        icon: Clock,
        label: "Pending"
      },
      accepted: {
        color: "bg-blue-500/15 text-blue-700 border-blue-200",
        icon: CheckCircle,
        label: "Accepted"
      },
      completed: {
        color: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
        icon: CheckCircle,
        label: "Completed"
      },
      expired: {
        color: "bg-red-500/15 text-red-700 border-red-200",
        icon: AlertCircle,
        label: "Expired"
      },
    };
    
    return configs[status] || {
      color: "bg-gray-500/15 text-gray-700 border-gray-200",
      icon: Clock,
      label: status
    };
  };

  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${config.color}`}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calculate invitation statistics
  const stats = {
    total: invitations.length,
    pending: invitations.filter(inv => inv.status === 'pending').length,
    accepted: invitations.filter(inv => inv.status === 'accepted').length,
    completed: invitations.filter(inv => inv.status === 'completed').length,
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform animate-in fade-in-90 zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                  <Mail size={24} className="text-white" />
                </div>
                {/* <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles size={10} className="text-white" />
                </div> */}
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0495b5] to-[#027a96] bg-clip-text text-transparent">
                  Test Invitations
                </h2>
                <p className="text-gray-600 font-medium">
                  {testTitle}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {invitations.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-600 font-medium">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                <p className="text-xs text-gray-600 font-medium">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.accepted}</p>
                <p className="text-xs text-gray-600 font-medium">Accepted</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
                <p className="text-xs text-gray-600 font-medium">Completed</p>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shadow-inner border border-teal-100">
                <Mail size={32} className="text-[#0495b5]" />
              </div>
              <p className="text-gray-900 font-semibold text-xl mb-2">
                No Invitations Sent
              </p>
              <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                No invitations have been sent for this test yet. Start by inviting candidates to participate.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 hover:border-[#0495b5]/20 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                          <User size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {inv.candidate_name}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1.5">
                            <Mail size={14} />
                            {inv.candidate_email}
                          </p>
                        </div>
                        {getStatusBadge(inv.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          <Calendar size={14} className="text-[#0495b5]" />
                          <span className="font-medium">Invited:</span>
                          <span>{formatDate(inv.invited_at)}</span>
                        </div>
                        {inv.accepted_at && (
                          <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span className="font-medium">Accepted:</span>
                            <span>{formatDate(inv.accepted_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                    {inv.status === "pending" && (
                      <button
                        onClick={() => sendReminder(inv.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                      >
                        <Send size={14} />
                        Send Reminder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-6 py-3.5 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25 hover:shadow-xl hover:shadow-[#0495b5]/30 transform hover:-translate-y-0.5"
            >
              Close Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { API_BASE_URL } from "../../constants";
import { X, Plus, Mail, User, Send, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

export default function InviteModal({ test, token, onClose }) {
  const [candidates, setCandidates] = useState([{ name: "", email: "" }]);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState(null);

  const addCandidate = () => {
    setCandidates([...candidates, { name: "", email: "" }]);
  };

  const removeCandidate = (index) => {
    if (candidates.length === 1) {
      alert("At least one candidate is required");
      return;
    }
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const updateCandidate = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const sendInvitations = async () => {
    const validCandidates = candidates.filter(
      (c) => c.name.trim() && c.email.trim()
    );

    if (validCandidates.length === 0) {
      alert("Please add at least one candidate with name and email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = validCandidates.filter(
      (c) => !emailRegex.test(c.email)
    );
    if (invalidEmails.length > 0) {
      alert("Please enter valid email addresses for all candidates");
      return;
    }

    setSending(true);

    try {
      const url = `${API_BASE_URL}/invitations/send-invitation`;
      console.log("Sending to:", url);
      console.log("Test ID:", test.id);
      console.log("Candidates:", validCandidates);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId: test.id,
          candidates: validCandidates,
        }),
      });

      const data = await response.json();
      console.log("Response:", data);

      if (data.success) {
        setResults(data.results);
      } else {
        alert(data.message || "Failed to send invitations");
      }
    } catch (error) {
      console.error("Error sending invitations:", error);
      alert("Failed to send invitations. Check console for details.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0495b5] to-[#037895] p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Invite Candidates</h2>
                <p className="text-blue-100 text-sm mt-1">
                  Send test invitations via email
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 p-3 bg-white/10 rounded-lg">
            <p className="font-medium text-sm">{test.title}</p>
            <p className="text-blue-100 text-xs mt-1">
              {test.description || "No description available"}
            </p>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {!results ? (
            <>
              {/* Candidate Input Section */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#0495b5]" />
                    Candidate Details
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-4">
                  {candidates.map((candidate, index) => (
                    <div
                      key={index}
                      className="flex gap-3 p-4 border border-gray-200 rounded-xl bg-white hover:border-[#0495b5]/30 transition-all duration-200 group"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="relative">
                          <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="text"
                            value={candidate.name}
                            onChange={(e) =>
                              updateCandidate(index, "name", e.target.value)
                            }
                            placeholder="Candidate Name"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0495b5] focus:border-[#0495b5] transition-all duration-200"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="email"
                            value={candidate.email}
                            onChange={(e) =>
                              updateCandidate(index, "email", e.target.value)
                            }
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0495b5] focus:border-[#0495b5] transition-all duration-200"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeCandidate(index)}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 self-start"
                        title="Remove candidate"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Candidate Button */}
              <button
                onClick={addCandidate}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#0495b5] hover:bg-[#e6f7fb] transition-all duration-200 group"
              >
                <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-[#0495b5]">
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Add Another Candidate</span>
                </div>
              </button>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700 disabled:opacity-50"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={sendInvitations}
                  disabled={sending}
                  className="px-8 py-3 bg-gradient-to-r from-[#0495b5] to-[#037895] text-white rounded-xl hover:from-[#037895] hover:to-[#02657a] transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-medium flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Invitations
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Results Section */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Invitations Sent!
                </h3>
                <p className="text-gray-600">
                  {results.filter(r => r.success).length} of {results.length} invitations sent successfully
                </p>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      result.success
                        ? "bg-green-50 border-green-200 hover:border-green-300"
                        : "bg-red-50 border-red-200 hover:border-red-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{result.email}</p>
                        <p className="text-sm mt-1 flex items-center gap-2">
                          {result.success ? (
                            <span className="text-green-700 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Invitation sent successfully
                            </span>
                          ) : (
                            <span className="text-red-700 flex items-center gap-1">
                              <XCircle className="w-4 h-4" />
                              {result.error}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        result.success 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {result.success ? "Sent" : "Failed"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.success).length}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {results.filter(r => !r.success).length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-[#0495b5] to-[#037895] text-white rounded-xl hover:from-[#037895] hover:to-[#02657a] transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <CheckCircle className="w-5 h-5" />
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
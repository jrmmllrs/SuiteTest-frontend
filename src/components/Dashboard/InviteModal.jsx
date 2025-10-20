import React, { useState } from "react";

// ✅ OPTION 1: Remove /api from URL (use this if your .env has the full path)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
      // ✅ FIXED: Removed duplicate /api
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">
            Invite Candidates - {test.title}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Send test invitations to candidates via email
          </p>
        </div>

        <div className="p-6">
          {!results ? (
            <>
              <div className="space-y-4">
                {candidates.map((candidate, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={candidate.name}
                        onChange={(e) =>
                          updateCandidate(index, "name", e.target.value)
                        }
                        placeholder="Candidate Name"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="email"
                        value={candidate.email}
                        onChange={(e) =>
                          updateCandidate(index, "email", e.target.value)
                        }
                        placeholder="Email Address"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => removeCandidate(index)}
                      className="text-red-600 hover:text-red-800 px-2"
                      title="Remove candidate"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addCandidate}
                className="mt-4 px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                + Add Another Candidate
              </button>

              <div className="flex gap-3 justify-end mt-6 pt-6 border-t">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                  disabled={sending}
                >
                  Cancel
                </button>
                <button
                  onClick={sendInvitations}
                  disabled={sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Invitations"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold mb-4 text-lg">Invitation Results</h3>
              <div className="space-y-2">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg ${
                      result.success
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <p className="font-medium">{result.email}</p>
                    <p className="text-sm mt-1">
                      {result.success ? (
                        <span className="text-green-700">
                          ✓ Invitation sent successfully
                        </span>
                      ) : (
                        <span className="text-red-700">✗ {result.error}</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
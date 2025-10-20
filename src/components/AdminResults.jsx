import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../constants";
import { NavBar } from "./ui/Navbar";

export default function AdminResults({ token, onBack }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.results);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title="Admin: Test Results" onBack={onBack} />

      <main className="max-w-6xl mx-auto py-6 px-4">
        {loading ? (
          <p className="text-gray-600">Loading results...</p>
        ) : results.length === 0 ? (
          <p className="text-gray-600">No test results found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border-b text-left">Candidate</th>
                  <th className="px-4 py-2 border-b text-left">Email</th>
                  <th className="px-4 py-2 border-b text-left">Test</th>
                  <th className="px-4 py-2 border-b text-left">Score</th>
                  <th className="px-4 py-2 border-b text-left">Remarks</th>
                  <th className="px-4 py-2 border-b text-left">Taken At</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="text-gray-700">
                    <td className="px-4 py-2 border-b">{r.candidate_name}</td>
                    <td className="px-4 py-2 border-b">{r.candidate_email}</td>
                    <td className="px-4 py-2 border-b">{r.test_title}</td>
                    <td className="px-4 py-2 border-b">{r.score}%</td>
                    <td className="px-4 py-2 border-b">{r.remarks}</td>
                    <td className="px-4 py-2 border-b">
                      {new Date(r.taken_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
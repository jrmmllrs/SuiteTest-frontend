import React, { useState, useEffect } from "react";
import LoadingScreen from "./LoadingScreen";

export default function TestResults({ testId, token, onBack, onNavigate }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/tests/${testId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("✅ Raw results data:", data);

      if (data.success) {
        setResults(data.results || []);
        setTestInfo(data.test);
      } else {
        setError("Failed to load results");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Error loading results");
    } finally {
      setLoading(false);
    }
  };

  // Format UTC timestamp to Philippine time (premium look)
  const formatDate = (utcString) => {
    if (!utcString) return "—";

    const date = new Date(utcString);
    if (isNaN(date)) return "—";

    // PH timezone offset = +8 hours
    const phTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);

    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    return phTime.toLocaleString("en-PH", options).replace(",", " •");
  };

  // Duration between start and finish
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "—";

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;

    if (isNaN(diffMs) || diffMs < 0) return "—";

    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins === 0) return `${diffSecs}s`;
    return `${diffMins}m ${diffSecs}s`;
  };

  // Percentage calculation
  const calculatePercentage = (score, total) => {
    if (!total || total <= 0) return 0;
    const percent = (score / total) * 100;
    const rounded = Math.round(percent);
    if (score > 0 && rounded === 0) return 1;
    return Math.min(100, rounded);
  };

  if (loading) return <LoadingScreen />;

  if (error)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-6 max-w-md">
          <p className="text-red-600">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <button
          onClick={onBack}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-2">
            Test Results: {testInfo?.title || "—"}
          </h1>
          <p className="text-gray-600 mb-6">
            Total submissions: {results.length}
          </p>

          {results.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded">
              <p className="text-gray-600">No submissions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Candidate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Started At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Finished At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr
                      key={`${result.id}-${result.candidate_id}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.candidate_name || "No Name"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.candidate_email || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.correct_answers} / {result.total_questions}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          {result.remarks || "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {calculatePercentage(
                            result.score,
                            result.total_questions
                          )}
                          %
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {calculateDuration(
                            result.taken_at,
                            result.finished_at
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(result.taken_at)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(result.finished_at)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() =>
                            onNavigate(
                              "answer-review",
                              testId,
                              result.candidate_id
                            )
                          }
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          View Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

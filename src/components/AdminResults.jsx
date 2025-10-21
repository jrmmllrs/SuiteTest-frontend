import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../constants";
import LayoutWrapper from "./layout/LayoutWrapper";
import { TrendingUp, Users, FileText, Award } from "lucide-react";

// Content Component
function AdminResultsContent({ token }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalResults: results.length,
    averageScore:
      results.length > 0
        ? (
            results.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0) /
            results.length
          ).toFixed(1)
        : 0,
    passedCount: results.filter((r) => (parseFloat(r.score) || 0) >= 70).length,
    uniqueTests: new Set(results.map((r) => r.test_title)).size,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Results"
          count={stats.totalResults}
          gradient="bg-gradient-to-br from-[#0698b2] to-[#0482a0]"
          icon={FileText}
        />
        <StatsCard
          title="Average Score"
          count={`${stats.averageScore}%`}
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          icon={Award}
        />
        <StatsCard
          title="Passed (≥70%)"
          count={stats.passedCount}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          icon={TrendingUp}
        />
        <StatsCard
          title="Unique Tests"
          count={stats.uniqueTests}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={Users}
        />
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">All Test Results</h3>
          <p className="text-sm text-gray-600 mt-0.5">
            Complete overview of all candidate test performances
          </p>
        </div>

        <div className="p-5">
          {results.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <TrendingUp size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-900 font-semibold text-lg mb-2">
                No test results found
              </p>
              <p className="text-gray-600 text-sm">
                Test results will appear here once candidates complete their
                tests
              </p>
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
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taken At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0698b2] to-[#0482a0] flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {r.candidate_name?.charAt(0)?.toUpperCase() ||
                                "?"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {r.candidate_name || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {r.candidate_email || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {r.test_title || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ScoreBadge score={parseFloat(r.score) || 0} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RemarksBadge remarks={r.remarks} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {r.taken_at
                          ? new Date(r.taken_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Stats Card Component
function StatsCard({ title, count, gradient, icon: Icon }) {
  // it's fine to render Icon as a component when a valid icon component is passed
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg ${gradient} flex items-center justify-center shadow-sm`}
        >
          {Icon ? <Icon size={22} className="text-white" /> : null}
        </div>
      </div>
    </div>
  );
}

// Score Badge Component
function ScoreBadge({ score }) {
  const getScoreStyle = () => {
    if (score >= 90) return "bg-green-100 text-green-800 border-green-200";
    if (score >= 70) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getScoreStyle()}`}
    >
      {score}%
    </span>
  );
}

// Remarks Badge Component
function RemarksBadge({ remarks }) {
  const getRemarksStyle = () => {
    const lower = remarks?.toLowerCase() || "";
    if (lower.includes("excellent") || lower.includes("outstanding"))
      return "bg-green-100 text-green-800 border-green-200";
    if (lower.includes("good") || lower.includes("pass"))
      return "bg-blue-100 text-blue-800 border-blue-200";
    if (lower.includes("fair") || lower.includes("average"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (lower.includes("fail") || lower.includes("poor"))
      return "bg-red-100 text-red-800 border-red-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRemarksStyle()}`}
    >
      {remarks || "N/A"}
    </span>
  );
}

// Main Component with Layout
export default function AdminResults({
  token,
  user,
  onLogout,
  onNavigate,
  activeTab,
  setActiveTab,
}) {
  return (
    <LayoutWrapper
      user={user}
      token={token}
      onLogout={onLogout}
      onNavigate={onNavigate}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <AdminResultsContent token={token} />
    </LayoutWrapper>
  );
}

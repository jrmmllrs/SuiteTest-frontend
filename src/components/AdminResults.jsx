import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../constants";
import LayoutWrapper from "./layout/LayoutWrapper";
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Award, 
  Sparkles, 
  Calendar, 
  Mail, 
  CheckCircle,
  Search,
  Filter,
  X,
  Download,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// Content Component
function AdminResultsContent({ token }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    scoreRange: [0, 100],
    status: "all",
    test: "all",
    dateRange: {
      start: "",
      end: ""
    }
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'taken_at', direction: 'desc' });

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

  // Get unique tests for filter dropdown
  const uniqueTests = [...new Set(results.map(r => r.test_title).filter(Boolean))];

  // Filter and sort results
  const filteredAndSortedResults = React.useMemo(() => {
    let filtered = results.filter(result => {
      // Search filter
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        !filters.search ||
        result.candidate_name?.toLowerCase().includes(searchLower) ||
        result.candidate_email?.toLowerCase().includes(searchLower) ||
        result.test_title?.toLowerCase().includes(searchLower) ||
        result.remarks?.toLowerCase().includes(searchLower);

      // Score range filter
      const score = parseFloat(result.score) || 0;
      const matchesScore = 
        score >= filters.scoreRange[0] && 
        score <= filters.scoreRange[1];

      // Status filter
      const getStatus = (score) => {
        if (score >= 90) return "excellent";
        if (score >= 70) return "passed";
        if (score >= 50) return "average";
        return "failed";
      };
      
      const matchesStatus = 
        filters.status === "all" || 
        getStatus(score) === filters.status;

      // Test filter
      const matchesTest = 
        filters.test === "all" || 
        result.test_title === filters.test;

      // Date range filter
      const takenAt = new Date(result.taken_at);
      const matchesDate = 
        (!filters.dateRange.start || takenAt >= new Date(filters.dateRange.start)) &&
        (!filters.dateRange.end || takenAt <= new Date(filters.dateRange.end + 'T23:59:59'));

      return matchesSearch && matchesScore && matchesStatus && matchesTest && matchesDate;
    });

    // Sort results
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'score') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortConfig.key === 'taken_at') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        } else if (sortConfig.key === 'candidate_name') {
          aValue = aValue?.toLowerCase() || '';
          bValue = bValue?.toLowerCase() || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [results, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calculate stats based on filtered results
  const stats = {
    totalResults: filteredAndSortedResults.length,
    averageScore:
      filteredAndSortedResults.length > 0
        ? (
            filteredAndSortedResults.reduce((sum, r) => sum + (parseFloat(r.score) || 0), 0) /
            filteredAndSortedResults.length
          ).toFixed(1)
        : 0,
    passedCount: filteredAndSortedResults.filter((r) => (parseFloat(r.score) || 0) >= 70).length,
    uniqueTests: new Set(filteredAndSortedResults.map((r) => r.test_title)).size,
  };

  // ✅ PH timezone formatter
  const formatDate = (utcString) => {
    if (!utcString) return "—";
    const date = new Date(utcString);
    if (isNaN(date)) return "—";

    // PH timezone offset +8 hours
    const phTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);

    return phTime
      .toLocaleString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " •");
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      scoreRange: [0, 100],
      status: "all",
      test: "all",
      dateRange: {
        start: "",
        end: ""
      }
    });
  };

  const exportToCSV = () => {
    const headers = ['Candidate Name', 'Candidate Email', 'Test Title', 'Score', 'Remarks', 'Taken At'];
    const csvData = filteredAndSortedResults.map(result => [
      result.candidate_name || '',
      result.candidate_email || '',
      result.test_title || '',
      result.score || '',
      result.remarks || '',
      formatDate(result.taken_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hasActiveFilters = filters.search || filters.status !== "all" || filters.test !== "all" || 
                           filters.scoreRange[0] > 0 || filters.scoreRange[1] < 100 ||
                           filters.dateRange.start || filters.dateRange.end;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block w-16 h-16 border-4 border-[#0495b5]/20 border-t-[#0495b5] rounded-full animate-spin mb-5" />
        <p className="text-gray-600 font-medium text-lg">Loading results...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      {/* <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
              <TrendingUp size={24} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles size={10} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0495b5] to-[#027a96] bg-clip-text text-transparent">
              Test Results
            </h1>
            <p className="text-gray-600 font-medium">
              Complete overview of all candidate test performances
            </p>
          </div>
        </div>
      </div> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Results"
          count={stats.totalResults}
          gradient="from-[#0495b5] to-[#027a96]"
          icon={FileText}
        />
        <StatsCard
          title="Average Score"
          count={`${stats.averageScore}%`}
          gradient="from-amber-500 to-yellow-500"
          icon={Award}
        />
        <StatsCard
          title="Passed (≥70%)"
          count={stats.passedCount}
          gradient="from-emerald-500 to-green-500"
          icon={TrendingUp}
        />
        <StatsCard
          title="Unique Tests"
          count={stats.uniqueTests}
          gradient="from-purple-500 to-purple-600"
          icon={Users}
        />
      </div>

      {/* Filters and Actions */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by candidate name, email, test, or remarks..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
            >
              <Filter size={18} />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-[#0495b5] rounded-full"></span>
              )}
            </button>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-green-500/25"
            >
              <Download size={18} />
              Export CSV
            </button>

            <button
              onClick={fetchResults}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:text-[#0495b5]"
              title="Refresh results"
            >
              <CheckCircle size={20} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Score Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Score Range: {filters.scoreRange[0]}% - {filters.scoreRange[1]}%
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scoreRange[0]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      scoreRange: [parseInt(e.target.value), prev.scoreRange[1]] 
                    }))}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.scoreRange[1]}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      scoreRange: [prev.scoreRange[0], parseInt(e.target.value)] 
                    }))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5]"
                >
                  <option value="all">All Status</option>
                  <option value="excellent">Excellent (90-100%)</option>
                  <option value="passed">Passed (70-89%)</option>
                  <option value="average">Average (50-69%)</option>
                  <option value="failed">Failed (0-49%)</option>
                </select>
              </div>

              {/* Test Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Test
                </label>
                <select
                  value={filters.test}
                  onChange={(e) => setFilters(prev => ({ ...prev, test: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5]"
                >
                  <option value="all">All Tests</option>
                  {uniqueTests.map(test => (
                    <option key={test} value={test}>{test}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">All Test Results</h3>
              <p className="text-gray-600 mt-1">
                {filteredAndSortedResults.length} result{filteredAndSortedResults.length !== 1 ? 's' : ''} found
                {hasActiveFilters && (
                  <span className="text-[#0495b5] font-semibold ml-2">
                    (filtered)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredAndSortedResults.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shadow-inner border border-teal-100">
                <TrendingUp size={48} className="text-[#0495b5]" />
              </div>
              <p className="text-gray-900 font-semibold text-xl mb-3">
                No test results found
              </p>
              <p className="text-gray-600 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                {hasActiveFilters 
                  ? "Try adjusting your filters to see more results"
                  : "Test results will appear here once candidates complete their tests"
                }
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0495b5] hover:bg-[#027a96] text-white font-semibold rounded-xl transition-colors"
                >
                  <X size={18} />
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-white">
                  <tr>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('candidate_name')}
                    >
                      <div className="flex items-center gap-1">
                        Candidate
                        {sortConfig.key === 'candidate_name' && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Test
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('score')}
                    >
                      <div className="flex items-center gap-1">
                        Score
                        {sortConfig.key === 'score' && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('taken_at')}
                    >
                      <div className="flex items-center gap-1">
                        Taken At
                        {sortConfig.key === 'taken_at' && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedResults.map((r) => (
                    <tr
                      key={r.id}
                      className={`transition-all duration-200 ${
                        hoveredRow === r.id 
                          ? 'bg-gradient-to-r from-teal-50/50 to-cyan-50/50 transform scale-[1.01] shadow-sm' 
                          : 'hover:bg-gray-50/50'
                      }`}
                      onMouseEnter={() => setHoveredRow(r.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                            <span className="text-white font-bold text-base">
                              {r.candidate_name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900 block">
                              {r.candidate_name || "—"}
                            </span>
                            <span className="text-xs text-gray-500">
                              Candidate
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={16} className="text-[#0495b5]" />
                          {r.candidate_email || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                          {r.test_title || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ScoreBadge score={parseFloat(r.score) || 0} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RemarksBadge remarks={r.remarks} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-[#0495b5]" />
                          {formatDate(r.taken_at)}
                        </div>
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

// Stats Card Component (unchanged)
function StatsCard({ title, count, gradient, icon: Icon }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#0495b5]/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 group-hover:text-[#0495b5] transition-colors">
            {count}
          </p>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// Score Badge Component (unchanged)
function ScoreBadge({ score }) {
  const getScoreStyle = () => {
    if (score >= 90) return "bg-gradient-to-r from-emerald-500/15 to-green-500/15 text-emerald-700 border border-emerald-200";
    if (score >= 70) return "bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-700 border border-blue-200";
    if (score >= 50) return "bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 border border-amber-200";
    return "bg-gradient-to-r from-red-500/15 to-rose-500/15 text-red-700 border border-red-200";
  };

  return (
    <span
      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border ${getScoreStyle()}`}
    >
      {score}%
    </span>
  );
}

// Remarks Badge Component (unchanged)
function RemarksBadge({ remarks }) {
  const getRemarksStyle = () => {
    const lower = remarks?.toLowerCase() || "";
    if (lower.includes("excellent") || lower.includes("outstanding"))
      return "bg-gradient-to-r from-emerald-500/15 to-green-500/15 text-emerald-700 border border-emerald-200";
    if (lower.includes("good") || lower.includes("pass"))
      return "bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-700 border border-blue-200";
    if (lower.includes("fair") || lower.includes("average"))
      return "bg-gradient-to-r from-amber-500/15 to-yellow-500/15 text-amber-700 border border-amber-200";
    if (lower.includes("fail") || lower.includes("poor"))
      return "bg-gradient-to-r from-red-500/15 to-rose-500/15 text-red-700 border border-red-200";
    return "bg-gradient-to-r from-gray-500/15 to-gray-600/15 text-gray-700 border border-gray-200";
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold border ${getRemarksStyle()}`}
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
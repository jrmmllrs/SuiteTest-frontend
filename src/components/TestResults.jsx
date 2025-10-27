import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  FileText,
  Calendar,
  Mail,
  User,
  Sparkles,
  Eye,
  Download,
  RefreshCw
} from "lucide-react";
import LoadingScreen from "./LoadingScreen";

export default function TestResults({ testId, token, onBack, onNavigate }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testInfo, setTestInfo] = useState(null);
  const [error, setError] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchResults();
  }, [testId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Fetching results for test ID:", testId);

      const response = await fetch(`${API_BASE_URL}/tests/${testId}/results`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      console.log("✅ Full API response:", data);
      console.log("📊 Results data:", data.results);
      console.log("🏷️ Test info:", data.test);
      console.log("🔍 Available keys in response:", Object.keys(data));

      if (data.success) {
        setResults(data.results || []);
        
        // Debug: Check what test information we have
        if (data.test) {
          console.log("🎯 Test object structure:", data.test);
          console.log("📝 Test title:", data.test.title);
          console.log("🆔 Test ID:", data.test.id);
          setTestInfo(data.test);
        } else if (data.test_title) {
          // Some APIs might return test_title directly
          console.log("📝 Using test_title from response:", data.test_title);
          setTestInfo({ title: data.test_title });
        } else if (data.results && data.results.length > 0 && data.results[0].test_title) {
          // Try to get title from first result
          console.log("📝 Using test_title from first result:", data.results[0].test_title);
          setTestInfo({ title: data.results[0].test_title });
        } else {
          console.log("❌ No test info found in response");
          setTestInfo({ title: "Unknown Test" });
        }
      } else {
        setError(data.message || "Failed to load results");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Error loading results");
    } finally {
      setLoading(false);
    }
  };

  // If test title is still not available, let's try to fetch test details separately
  useEffect(() => {
    if (!testInfo?.title && testId) {
      fetchTestDetails();
    }
  }, [testInfo, testId]);

  const fetchTestDetails = async () => {
    try {
      console.log("🔄 Fetching test details separately for test ID:", testId);
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const data = await response.json();
      console.log("✅ Test details response:", data);
      
      if (data.success && data.test) {
        console.log("🎯 Found test details:", data.test.title);
        setTestInfo(data.test);
      }
    } catch (err) {
      console.error("Error fetching test details:", err);
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

  // Duration between start and finish - FIXED version
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "—";

    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "—";
    
    const diffMs = end - start;

    if (isNaN(diffMs) || diffMs < 0) return "—";

    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins === 0) return `${diffSecs}s`;
    return `${diffMins}m ${diffSecs}s`;
  };

  // Calculate duration in seconds for statistics - FIXED
  const calculateDurationInSeconds = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const diffMs = end - start;
    return isNaN(diffMs) || diffMs < 0 ? 0 : Math.floor(diffMs / 1000);
  };

  // Percentage calculation
  const calculatePercentage = (score, total) => {
    if (!total || total <= 0) return 0;
    const percent = (score / total) * 100;
    const rounded = Math.round(percent);
    if (score > 0 && rounded === 0) return 1;
    return Math.min(100, rounded);
  };

  // Calculate statistics - FIXED duration calculation
  const stats = {
    totalSubmissions: results.length,
    averageScore: results.length > 0 
      ? Math.round(results.reduce((sum, r) => sum + calculatePercentage(r.correct_answers || 0, r.total_questions || 1), 0) / results.length)
      : 0,
    averageDuration: results.length > 0
      ? (() => {
          const validDurations = results
            .map(r => calculateDurationInSeconds(r.taken_at, r.finished_at))
            .filter(duration => duration > 0); // Only include valid durations
            
          if (validDurations.length === 0) return 0;
          
          const totalSeconds = validDurations.reduce((sum, duration) => sum + duration, 0);
          return Math.round(totalSeconds / validDurations.length);
        })()
      : 0,
    passedCount: results.filter(r => calculatePercentage(r.correct_answers || 0, r.total_questions || 1) >= 70).length
  };

  // Format duration for display - FIXED
  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (percentage >= 70) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percentage >= 50) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getRemarksColor = (remarks) => {
    const lower = remarks?.toLowerCase() || "";
    if (lower.includes("excellent") || lower.includes("outstanding")) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (lower.includes("good") || lower.includes("pass")) return "text-blue-700 bg-blue-50 border-blue-200";
    if (lower.includes("fair") || lower.includes("average")) return "text-amber-700 bg-amber-50 border-amber-200";
    if (lower.includes("fail") || lower.includes("poor")) return "text-red-700 bg-red-50 border-red-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

  // Get display title with fallbacks
  const getDisplayTitle = () => {
    if (testInfo?.title) return testInfo.title;
    if (testInfo?.test_title) return testInfo.test_title;
    if (results.length > 0 && results[0]?.test_title) return results[0].test_title;
    return "Test Results";
  };

  if (loading) return <LoadingScreen />;

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm p-8 max-w-md text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center shadow-inner border border-red-100">
            <TrendingUp size={32} className="text-red-500" />
          </div>
          <p className="text-red-600 font-semibold text-lg mb-4">{error}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
            >
              <ArrowLeft size={20} />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                  <TrendingUp size={24} className="text-white" />
                </div>
                {/* <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles size={10} className="text-white" />
                </div> */}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0495b5] to-[#027a96] bg-clip-text text-transparent">
                  Test Results
                </h1>
                <p className="text-gray-600 font-medium">
                  {getDisplayTitle()}
                </p>
              </div>
            </div>
          </div>
          {/* <button
            onClick={fetchResults}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:text-[#0495b5]"
            title="Refresh results"
          >
            <RefreshCw size={20} />
          </button> */}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Submissions"
            value={stats.totalSubmissions}
            gradient="from-[#0495b5] to-[#027a96]"
            icon={Users}
          />
          <StatsCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            gradient="from-amber-500 to-yellow-500"
            icon={Award}
          />
          <StatsCard
            title="Passed (≥70%)"
            value={stats.passedCount}
            gradient="from-emerald-500 to-green-500"
            icon={TrendingUp}
          />
          <StatsCard
            title="Avg Duration"
            value={formatDuration(stats.averageDuration)}
            gradient="from-purple-500 to-purple-600"
            icon={Clock}
          />
        </div>

        {/* Results Table */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Submission Details</h2>
                <p className="text-gray-600 mt-1">
                  {results.length} submission{results.length !== 1 ? 's' : ''} recorded
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200">
                <Download size={18} />
                Export
              </button>
            </div>
          </div>

          <div className="p-6">
            {results.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shadow-inner border border-teal-100">
                  <FileText size={48} className="text-[#0495b5]" />
                </div>
                <p className="text-gray-900 font-semibold text-xl mb-3">
                  No Submissions Yet
                </p>
                <p className="text-gray-600 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                  Test results will appear here once candidates complete their assessments
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Clock size={16} className="text-amber-500" />
                  <span>Waiting for candidate submissions</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Percentage
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Timeline
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => {
                      const percentage = calculatePercentage(result.correct_answers || 0, result.total_questions || 1);
                      return (
                        <tr
                          key={`${result.id}-${result.candidate_id}-${index}`}
                          className={`transition-all duration-200 ${
                            hoveredRow === result.id 
                              ? 'bg-gradient-to-r from-teal-50/50 to-cyan-50/50 transform scale-[1.01] shadow-sm' 
                              : 'hover:bg-gray-50/50'
                          }`}
                          onMouseEnter={() => setHoveredRow(result.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                                <span className="text-white font-bold text-sm">
                                  {result.candidate_name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {result.candidate_name || "No Name"}
                                </div>
                                <div className="text-xs text-gray-600 flex items-center gap-1">
                                  <Mail size={12} />
                                  {result.candidate_email || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              {(result.correct_answers || 0)} / {(result.total_questions || 0)}
                            </div>
                            {result.remarks && (
                              <div className={`text-xs px-2 py-1 rounded-lg border ${getRemarksColor(result.remarks)}`}>
                                {result.remarks}
                              </div>
                            )}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-lg font-bold px-3 py-2 rounded-xl border ${getScoreColor(percentage)}`}>
                              {percentage}%
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-900">
                              <Clock size={16} className="text-[#0495b5]" />
                              {calculateDuration(result.taken_at, result.finished_at)}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1 text-xs text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-[#0495b5]" />
                                <span>Started: {formatDate(result.taken_at)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar size={12} className="text-emerald-500" />
                                <span>Finished: {formatDate(result.finished_at)}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() =>
                                onNavigate(
                                  "answer-review",
                                  testId,
                                  result.candidate_id
                                )
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#0495b5] bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all duration-200 border border-blue-200 hover:border-blue-300 hover:shadow-sm"
                            >
                              <Eye size={16} />
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, gradient, icon: Icon }) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#0495b5]/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-4xl font-bold text-gray-900 group-hover:text-[#0495b5] transition-colors">
            {value}
          </p>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
}
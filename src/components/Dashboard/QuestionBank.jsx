// File: src/components/QuestionBank.jsx
import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  BookOpen,
  X,
  MoreVertical,
  BarChart3,
  Users,
  Download,
  Bookmark,
  Layers,
  Database,
} from "lucide-react";
import LayoutWrapper from "../layout/LayoutWrapper";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Test Card Component
function TestCard({ test, onView, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeColor = (type) => {
    return type === "pdf_based"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-[#0697b2]/30 group relative">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#0697b2] to-cyan-500 rounded-l-xl" />

      <div className="flex items-start justify-between mb-4 ml-1">
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0697b2] transition-colors">
            {test.title}
          </h3>
          {test.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
              {test.description}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-50 rounded-lg transition-colors group/menu"
          >
            <MoreVertical
              size={18}
              className="text-gray-400 group-hover/menu:text-[#0697b2]"
            />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                <button
                  onClick={() => {
                    onView(test);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#0697b2]/5 flex items-center gap-3 transition-colors"
                >
                  <Eye size={16} className="text-[#0697b2]" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(test);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-[#0697b2]/5 flex items-center gap-3 transition-colors"
                >
                  <Edit size={16} className="text-[#0697b2]" />
                  Edit Test
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => {
                    onDelete(test);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete Test
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Test Metadata */}
      <div className="space-y-3 ml-1">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText size={16} className="text-[#0697b2]" />
            <span className="font-medium">
              {test.question_count || 0} questions
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-[#0697b2]" />
            <span className="font-medium">{test.time_limit || 30} mins</span>
          </div>
        </div>

        {/* Test Type Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getTypeColor(
              test.test_type
            )}`}
          >
            {test.test_type === "pdf_based" ? "📄 PDF Based" : "📝 Standard"}
          </span>
          <span className="px-3 py-1.5 bg-[#0697b2]/10 text-[#0697b2] rounded-full text-xs font-semibold border border-[#0697b2]/20">
            🏛️ Question Bank
          </span>
        </div>

        {/* Created Date */}
        <div className="pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">
            Created{" "}
            {new Date(test.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuestionBankContent({ token, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/my-tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        // Filter only tests from Question Bank department
        const questionBankTests = (data.tests || []).filter(
          (test) => test.department_name === "Question Bank"
        );
        setTests(questionBankTests);
      } else {
        console.error("Failed to fetch tests:", data.message);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === "all") return matchesSearch;
    if (filterType === "standard")
      return matchesSearch && test.test_type === "standard";
    if (filterType === "pdf_based")
      return matchesSearch && test.test_type === "pdf_based";

    return matchesSearch;
  });

  const stats = {
    total: tests.length,
    standard: tests.filter((t) => t.test_type === "standard").length,
    pdfBased: tests.filter((t) => t.test_type === "pdf_based").length,
    totalQuestions: tests.reduce((sum, t) => sum + (t.question_count || 0), 0),
  };

  const handleView = (test) => {
    onNavigate("view-test", test.id);
  };

  const handleEdit = (test) => {
    onNavigate("edit-test", test.id);
  };

  const handleDelete = async (test) => {
    if (!confirm(`Delete test "${test.title}"? This action cannot be undone.`))
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/tests/${test.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setTests((prev) => prev.filter((t) => t.id !== test.id));
      } else {
        alert("Failed to delete test: " + data.message);
      }
    } catch (err) {
      console.error("Error deleting test:", err);
      alert("Error deleting test");
    }
  };

  const handleCreateTest = () => {
    onNavigate("create-test");
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8 bg-white border-b border-gray-200 rounded-2xl shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 lg:mb-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0697b2] to-cyan-600 flex items-center justify-center shadow-sm">
                <Database size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Question Bank
                </h1>
                <p className="text-gray-600 text-lg">
                  Reusable test templates and questions library
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-xl transition-all duration-300">
                <Download size={18} />
                Export
              </button>
              <button
                onClick={handleCreateTest}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0697b2] hover:bg-[#05819a] text-white text-sm font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Plus size={18} />
                Create Test
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <BookOpen size={24} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Tests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <BarChart3 size={24} className="text-green-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalQuestions}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <CheckCircle size={24} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Standard Tests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.standard}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Users size={24} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-medium">PDF Tests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pdfBased}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 w-full">
              <div className="relative max-w-md">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search tests by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none w-full pl-11 pr-8 py-3 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent bg-white transition-all"
                >
                  <option value="all">All Test Types</option>
                  <option value="standard">Standard Tests</option>
                  <option value="pdf_based">PDF-Based Tests</option>
                </select>
                <Filter
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Question Bank Tests
              </h3>
              <p className="text-sm text-gray-600">
                {filteredTests.length} test
                {filteredTests.length !== 1 ? "s" : ""} found • Manage your
                reusable test templates
              </p>
            </div>

            {filteredTests.length > 0 && (
              <div className="flex items-center gap-2 mt-3 sm:mt-0">
                <span className="text-xs text-gray-500 font-medium">
                  Sort by:
                </span>
                <select className="text-sm border border-gray-300 bg-white rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#0697b2] focus:border-transparent">
                  <option>Newest First</option>
                  <option>Oldest First</option>
                  <option>Most Questions</option>
                  <option>Alphabetical</option>
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-14 h-14 border-4 border-[#0697b2] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium text-lg">
                Loading your tests...
              </p>
              <p className="text-gray-500 text-sm mt-1">
                This will just take a moment
              </p>
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0697b2]/10 to-cyan-500/10 flex items-center justify-center">
                <FileText size={48} className="text-[#0697b2]" />
              </div>
              <p className="text-gray-900 font-bold text-xl mb-2">
                {searchQuery || filterType !== "all"
                  ? "No matching tests found"
                  : "No tests in your question bank"}
              </p>
              <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search terms or filters to find what you're looking for."
                  : "Start building your reusable question library by creating your first test template."}
              </p>
              <button
                onClick={handleCreateTest}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0697b2] hover:bg-[#05819a] text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <Plus size={20} />
                Create Your First Test
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function QuestionBank({
  user,
  token,
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
      <QuestionBankContent token={token} onNavigate={onNavigate} />
    </LayoutWrapper>
  );
}

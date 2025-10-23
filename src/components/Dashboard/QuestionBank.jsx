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
} from "lucide-react";
import LayoutWrapper from "../layout/LayoutWrapper";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Test Card Component
function TestCard({ test, onView, onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow relative">
      {/* Test Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
            {test.title}
          </h3>
          {test.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {test.description}
            </p>
          )}
        </div>
        
        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical size={18} className="text-gray-600" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button
                  onClick={() => {
                    onView(test);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <button
                  onClick={() => {
                    onEdit(test);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit Test
                </button>
                <button
                  onClick={() => {
                    onDelete(test);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText size={16} />
            <span>{test.question_count || 0} questions</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} />
            <span>{test.time_limit || 30} mins</span>
          </div>
        </div>

        {/* Test Type Badge */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
            {test.test_type === "pdf_based" ? "PDF Based" : "Standard"}
          </span>
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs font-medium">
            Question Bank
          </span>
        </div>

        {/* Created Date */}
        <div className="pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Created {new Date(test.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
}

function QuestionBankContent({ user, token, onNavigate }) {
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
    // Navigate to create test with Question Bank pre-selected
    onNavigate("create-test");
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
              <p className="text-sm text-gray-600">
                Reusable test templates and questions
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateTest}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            Create Test
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Total Tests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Total Questions</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalQuestions}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Standard Tests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.standard}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">PDF Tests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pdfBased}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none w-full md:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent bg-white"
            >
              <option value="all">All Types</option>
              <option value="standard">Standard Tests</option>
              <option value="pdf_based">PDF-Based Tests</option>
            </select>
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900">Question Bank Tests</h3>
          <p className="text-sm text-gray-600">
            {filteredTests.length} test{filteredTests.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FileText size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-2">
              No tests found
            </p>
            <p className="text-gray-600 text-sm mb-4">
              {searchQuery || filterType !== "all"
                ? "Try adjusting your filters"
                : "Create tests in the Question Bank to build your reusable question library"}
            </p>
            <button
              onClick={handleCreateTest}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={18} />
              Create Your First Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <QuestionBankContent user={user} token={token} onNavigate={onNavigate} />
    </LayoutWrapper>
  );
}
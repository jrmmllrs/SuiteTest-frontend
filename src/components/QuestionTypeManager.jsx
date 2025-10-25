import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  FileText,
  ListChecks,
  Sparkles,
  LayoutGrid,
  Settings,
  Download,
  Zap,
  Target,
  Box,
  BookOpen,
  Type,
  CheckSquare,
} from "lucide-react";
import LayoutWrapper from "./layout/LayoutWrapper";

// Clean Card Component
function CleanCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

// Floating Action Button
function FloatingActionButton({ onClick, icon: IconComponent, label }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-[#0697b2] to-cyan-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300 group z-50"
      title={label}
    >
      {IconComponent ? (
        <IconComponent size={24} className="text-white" />
      ) : (
        <div className="text-white text-sm">No icon</div>
      )}
      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {label}
      </span>
    </button>
  );
}

// Stats Card
function StatsCard({ title, count, icon: IconComponent, color, delay }) {
  const [animatedCount, setAnimatedCount] = useState(0);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setAnimatedCount(count);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [count, delay]);

  return (
    <CleanCard className="p-6 hover:shadow-lg group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{animatedCount}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-transform duration-300`}
        >
          {IconComponent ? (
            <IconComponent size={24} className="text-white" />
          ) : (
            <div className="text-white text-sm">No icon</div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#0697b2]/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
    </CleanCard>
  );
}

// Question Type Card
function QuestionTypeCard({ type, usage, onEdit, onDelete, showUsageStats }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Card */}
      <div
        className={`bg-white rounded-2xl border border-gray-100 p-6 transition-all duration-300 ${
          isHovered
            ? "shadow-lg border-[#0697b2]/20 -translate-y-1"
            : "shadow-sm"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0697b2] transition-colors">
              {type.type_name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600 font-mono">
                {type.type_key}
              </span>
              {showUsageStats && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    usage > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {usage} question{usage !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div
            className={`flex gap-1 transition-all duration-300 ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(type);
              }}
              className="p-2 text-[#0697b2] hover:bg-cyan-50 rounded-xl transition-all duration-300 hover:scale-110"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(type.id);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Description */}
        {type.description && (
          <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
            {type.description}
          </p>
        )}

        {/* Features */}
        <div className="flex gap-6 text-sm">
          <span
            className={`flex items-center gap-2 font-medium ${
              type.requires_options ? "text-[#0697b2]" : "text-gray-400"
            }`}
          >
            {type.requires_options ? (
              <CheckCircle size={14} className="text-[#0697b2]" />
            ) : (
              <X size={14} />
            )}
            Options
          </span>
          <span
            className={`flex items-center gap-2 font-medium ${
              type.requires_correct_answer ? "text-green-600" : "text-gray-400"
            }`}
          >
            {type.requires_correct_answer ? (
              <CheckCircle size={14} className="text-green-600" />
            ) : (
              <X size={14} />
            )}
            Auto-Grade
          </span>
        </div>

        {/* Hover Effect Line */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#0697b2] to-cyan-400 transition-all duration-300 group-hover:w-3/4" />
      </div>
    </div>
  );
}

// Content Component
function QuestionTypeManagerContent({ token }) {
  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [showUsageStats, setShowUsageStats] = useState(true);
  const [usageStats, setUsageStats] = useState({});
  const [activeView, setActiveView] = useState("grid");
  const [formData, setFormData] = useState({
    type_key: "",
    type_name: "",
    description: "",
    requires_options: false,
    requires_correct_answer: false,
  });
  const [message, setMessage] = useState({ type: "", content: "" });

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    fetchQuestionTypes();
    fetchUsageStats();
  }, []);

  const fetchQuestionTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/question-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setQuestionTypes(data.questionTypes);
      }
    } catch (error) {
      console.error("Error fetching question types:", error);
      setMessage({ type: "error", content: "Failed to load question types" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/question-types/usage-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (data.success) {
        setUsageStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching usage stats:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.type_key || !formData.type_name) {
      setMessage({ type: "error", content: "Type key and name are required" });
      return;
    }

    try {
      const url = editingType
        ? `${API_BASE_URL}/question-types/${editingType.id}`
        : `${API_BASE_URL}/question-types`;

      const response = await fetch(url, {
        method: editingType ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          content: editingType
            ? "Question type updated successfully"
            : "Question type created successfully",
        });
        fetchQuestionTypes();
        fetchUsageStats();
        resetForm();
        setTimeout(() => setMessage({ type: "", content: "" }), 3000);
      } else {
        setMessage({ type: "error", content: data.message });
      }
    } catch (error) {
      console.error("Error saving question type:", error);
      setMessage({ type: "error", content: "Failed to save question type" });
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      type_key: type.type_key,
      type_name: type.type_name,
      description: type.description || "",
      requires_options: type.requires_options,
      requires_correct_answer: type.requires_correct_answer,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const usage = usageStats[id] || 0;
    if (usage > 0) {
      if (
        !confirm(
          `This question type is used in ${usage} question(s). Deactivating it will not delete existing questions. Continue?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm("Are you sure you want to deactivate this question type?")) {
        return;
      }
    }

    try {
      const response = await fetch(`${API_BASE_URL}/question-types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", content: "Question type deactivated" });
        fetchQuestionTypes();
        fetchUsageStats();
        setTimeout(() => setMessage({ type: "", content: "" }), 3000);
      } else {
        setMessage({ type: "error", content: data.message });
      }
    } catch (error) {
      console.error("Error deleting question type:", error);
      setMessage({ type: "error", content: "Failed to delete question type" });
    }
  };

  const resetForm = () => {
    setFormData({
      type_key: "",
      type_name: "",
      description: "",
      requires_options: false,
      requires_correct_answer: false,
    });
    setEditingType(null);
    setShowForm(false);
  };

  const filteredTypes = questionTypes.filter((type) => {
    const matchesSearch =
      type.type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.type_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (type.description &&
        type.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterOption === "all") return matchesSearch;
    if (filterOption === "with_options")
      return matchesSearch && type.requires_options;
    if (filterOption === "with_answer")
      return matchesSearch && type.requires_correct_answer;
    if (filterOption === "unused")
      return matchesSearch && (usageStats[type.id] || 0) === 0;
    if (filterOption === "most_used")
      return matchesSearch && (usageStats[type.id] || 0) > 0;

    return matchesSearch;
  });

  const totalUsage = Object.values(usageStats).reduce(
    (sum, count) => sum + count,
    0
  );

  // Message Alert Component
  const MessageAlert = () => {
    if (!message.content) return null;

    return (
      <div
        className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
          message.type === "success"
            ? "bg-green-50 text-green-800 border-green-200"
            : "bg-red-50 text-red-800 border-red-200"
        }`}
      >
        {message.type === "success" ? (
          <CheckCircle size={24} className="text-green-600" />
        ) : (
          <AlertCircle size={24} className="text-red-600" />
        )}
        <span className="font-medium flex-1">{message.content}</span>
        <button
          onClick={() => setMessage({ type: "", content: "" })}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0697b2] border-t-transparent rounded-full animate-spin mb-4 mx-auto" />
          <p className="text-gray-700 text-lg font-medium">
            Loading Question Types
          </p>
          <p className="text-gray-500 text-sm">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative z-10">
        {/* Message Alert */}
        <MessageAlert />

        {/* Header Section */}
      <div className="mb-5 bg-white border-b border-gray-200 rounded-2xl shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0697b2] to-cyan-600 flex items-center justify-center shadow-sm">
                  <Type size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Question Types
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Manage different types of questions for your assessments
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300">
                  <Settings size={20} />
                </button>
                <button className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300">
                  <Download size={20} />
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Total Types"
                count={questionTypes.length}
                icon={BookOpen}
                color="bg-gradient-to-br from-[#0697b2] to-cyan-600"
                delay={200}
              />
              <StatsCard
                title="Total Questions"
                count={totalUsage}
                icon={FileText}
                color="bg-gradient-to-br from-green-500 to-green-600"
                delay={400}
              />
              <StatsCard
                title="With Options"
                count={questionTypes.filter((t) => t.requires_options).length}
                icon={CheckSquare}
                color="bg-gradient-to-br from-purple-500 to-purple-600"
                delay={600}
              />
              <StatsCard
                title="Auto-Gradable"
                count={
                  questionTypes.filter((t) => t.requires_correct_answer).length
                }
                icon={Zap}
                color="bg-gradient-to-br from-yellow-500 to-yellow-600"
                delay={800}
              />
            </div>

            {/* Search and Filters */}
            <CleanCard className="p-6 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex-1 w-full">
                  <div className="relative max-w-md">
                    <Search
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      placeholder="Search question types..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Filter
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <select
                      value={filterOption}
                      onChange={(e) => setFilterOption(e.target.value)}
                      className="appearance-none pl-10 pr-8 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent transition-all"
                    >
                      <option value="all">All Types</option>
                      <option value="with_options">With Options</option>
                      <option value="with_answer">Auto-Gradable</option>
                      <option value="most_used">Most Used</option>
                      <option value="unused">Unused</option>
                    </select>
                  </div>

                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setActiveView("grid")}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        activeView === "grid"
                          ? "bg-white text-[#0697b2] shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => setActiveView("list")}
                      className={`p-2 rounded-lg transition-all duration-300 ${
                        activeView === "list"
                          ? "bg-white text-[#0697b2] shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <ListChecks size={18} />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowUsageStats(!showUsageStats)}
                    className={`px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-all ${
                      showUsageStats
                        ? "bg-[#0697b2] text-white hover:bg-[#05819a] shadow-sm"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Target size={16} />
                    {showUsageStats ? "Hide Usage" : "Show Usage"}
                  </button>
                </div>
              </div>
            </CleanCard>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Question Types Grid */}
          {filteredTypes.length === 0 ? (
            <CleanCard className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#0697b2]/10 to-cyan-500/10 flex items-center justify-center">
                <Sparkles size={48} className="text-[#0697b2]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {searchTerm || filterOption !== "all"
                  ? "No matching types found"
                  : "No question types yet"}
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                {searchTerm || filterOption !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start by creating your first question type to organize your questions"}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-3 px-6 py-3 bg-[#0697b2] hover:bg-[#05819a] text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                Create First Type
              </button>
            </CleanCard>
          ) : (
            <div
              className={`grid gap-6 ${
                activeView === "grid"
                  ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredTypes.map((type) => (
                <QuestionTypeCard
                  key={type.id}
                  type={type}
                  usage={usageStats[type.id] || 0}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  showUsageStats={showUsageStats}
                />
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          onClick={() => setShowForm(true)}
          icon={Plus}
          label="Create New Type"
        />
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingType ? "Edit Question Type" : "Create Question Type"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 font-semibold mb-3">
                      Type Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="type_key"
                      value={formData.type_key}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent transition-all"
                      placeholder="multiple_choice"
                      disabled={editingType !== null}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Lowercase with underscores. Cannot be changed after
                      creation.
                    </p>
                  </div>

                  <div>
                    <label className="block text-gray-900 font-semibold mb-3">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="type_name"
                      value={formData.type_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent transition-all"
                      placeholder="Multiple Choice"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-900 font-semibold mb-3">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent resize-none transition-all"
                    placeholder="Describe when and how to use this question type..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-[#0697b2] transition-all duration-300">
                    <input
                      type="checkbox"
                      name="requires_options"
                      checked={formData.requires_options}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-0.5 text-[#0697b2] rounded focus:ring-[#0697b2]"
                    />
                    <div>
                      <span className="text-gray-900 font-semibold block mb-1">
                        Requires Answer Options
                      </span>
                      <span className="text-gray-600 text-xs">
                        Enable for question types that need multiple choice
                        options
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:border-[#0697b2] transition-all duration-300">
                    <input
                      type="checkbox"
                      name="requires_correct_answer"
                      checked={formData.requires_correct_answer}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-0.5 text-[#0697b2] rounded focus:ring-[#0697b2]"
                    />
                    <div>
                      <span className="text-gray-900 font-semibold block mb-1">
                        Auto-Gradable
                      </span>
                      <span className="text-gray-600 text-xs">
                        Enable for question types that can be automatically
                        graded
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-3 bg-[#0697b2] hover:bg-[#05819a] text-white font-semibold rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {editingType ? "Update Type" : "Create Type"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Component
export default function QuestionTypeManager({
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
      <QuestionTypeManagerContent token={token} />
    </LayoutWrapper>
  );
}

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Search, Filter, CheckCircle, AlertCircle, FileText, ListChecks } from "lucide-react";
import LayoutWrapper from "./layout/LayoutWrapper";

// Content Component
function QuestionTypeManagerContent({ token }) {
  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [showUsageStats, setShowUsageStats] = useState(false);
  const [usageStats, setUsageStats] = useState({});
  const [formData, setFormData] = useState({
    type_key: "",
    type_name: "",
    description: "",
    requires_options: false,
    requires_correct_answer: false,
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
      setMessage({ type: "error", text: "Failed to load question types" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/question-types/usage-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      setMessage({ type: "error", text: "Type key and name are required" });
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
          text: editingType
            ? "Question type updated successfully"
            : "Question type created successfully",
        });
        fetchQuestionTypes();
        fetchUsageStats();
        resetForm();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Error saving question type:", error);
      setMessage({ type: "error", text: "Failed to save question type" });
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
      if (!confirm(`This question type is used in ${usage} question(s). Deactivating it will not delete existing questions. Continue?`)) {
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
        setMessage({ type: "success", text: "Question type deactivated" });
        fetchQuestionTypes();
        fetchUsageStats();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Error deleting question type:", error);
      setMessage({ type: "error", text: "Failed to delete question type" });
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
      (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (filterOption === "all") return matchesSearch;
    if (filterOption === "with_options") return matchesSearch && type.requires_options;
    if (filterOption === "with_answer") return matchesSearch && type.requires_correct_answer;
    if (filterOption === "unused") return matchesSearch && (usageStats[type.id] || 0) === 0;
    if (filterOption === "most_used") return matchesSearch && (usageStats[type.id] || 0) > 0;
    
    return matchesSearch;
  });

  const sortedTypes = [...filteredTypes].sort((a, b) => {
    if (filterOption === "most_used") {
      return (usageStats[b.id] || 0) - (usageStats[a.id] || 0);
    }
    return 0;
  });

  const totalUsage = Object.values(usageStats).reduce((sum, count) => sum + count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );
  }

  return (
    <>
      {/* Message Alert */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg border flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span className="font-medium">{message.text}</span>
          <button
            onClick={() => setMessage({ type: "", text: "" })}
            className="ml-auto text-gray-500 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Types"
          count={questionTypes.length}
          gradient="bg-gradient-to-br from-[#0698b2] to-[#0482a0]"
          icon={ListChecks}
        />
        <StatsCard
          title="Total Questions"
          count={totalUsage}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          icon={FileText}
        />
        <StatsCard
          title="With Options"
          count={questionTypes.filter(t => t.requires_options).length}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={CheckCircle}
        />
        <StatsCard
          title="With Answer"
          count={questionTypes.filter(t => t.requires_correct_answer).length}
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          icon={CheckCircle}
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Question Types</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {sortedTypes.length} type{sortedTypes.length !== 1 ? "s" : ""} found
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <select
                  value={filterOption}
                  onChange={(e) => setFilterOption(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="with_options">With Options</option>
                  <option value="with_answer">With Answer</option>
                  <option value="most_used">Most Used</option>
                  <option value="unused">Unused</option>
                </select>
              </div>

              {/* Toggle Stats */}
              <button
                onClick={() => setShowUsageStats(!showUsageStats)}
                className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  showUsageStats 
                    ? "bg-[#0698b2] text-white hover:bg-[#0482a0]" 
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <FileText size={18} />
                {showUsageStats ? "Hide" : "Show"} Usage
              </button>

              {/* Add Button */}
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Plus size={18} />
                  Add Type
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          {showForm && (
            <div className="mb-6 p-6 border-2 border-[#0698b2] rounded-lg bg-cyan-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingType ? "Edit Question Type" : "New Question Type"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type Key <span className="text-red-500">*</span>
                    <span className="text-gray-500 font-normal ml-1">(lowercase, underscores only)</span>
                  </label>
                  <input
                    type="text"
                    name="type_key"
                    value={formData.type_key}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
                    placeholder="e.g., multiple_choice"
                    disabled={editingType !== null}
                    required
                  />
                  {editingType && (
                    <p className="text-xs text-gray-500 mt-1">Type key cannot be changed after creation</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Type Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="type_name"
                    value={formData.type_name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
                    placeholder="e.g., Multiple Choice"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent resize-none"
                    placeholder="Describe this question type and when to use it..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="requires_options"
                      checked={formData.requires_options}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-0.5 text-[#0698b2] rounded focus:ring-[#0698b2]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">
                        Requires Options
                      </span>
                      <span className="text-xs text-gray-500">
                        Enable if this type needs multiple answer choices
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      name="requires_correct_answer"
                      checked={formData.requires_correct_answer}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-0.5 text-[#0698b2] rounded focus:ring-[#0698b2]"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900 block">
                        Requires Correct Answer
                      </span>
                      <span className="text-xs text-gray-500">
                        Enable if this type can be auto-graded
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2.5 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
                  >
                    <Save size={16} />
                    {editingType ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {sortedTypes.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <ListChecks size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-900 font-semibold text-lg mb-2">
                {searchTerm || filterOption !== "all"
                  ? "No question types match your search or filter"
                  : "No question types created yet"}
              </p>
              <p className="text-gray-600 text-sm">
                {searchTerm || filterOption !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Get started by adding your first question type"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTypes.map((type) => {
                const usage = usageStats[type.id] || 0;
                return (
                  <div
                    key={type.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h4 className="font-semibold text-base text-gray-900">
                            {type.type_name}
                          </h4>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                            {type.type_key}
                          </span>
                          {showUsageStats && (
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              usage > 0 
                                ? "bg-green-100 text-green-700 border border-green-200" 
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {usage} question{usage !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                        {type.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {type.description}
                          </p>
                        )}
                        <div className="flex gap-4 text-xs">
                          <span className={`flex items-center gap-1 ${
                            type.requires_options ? "text-[#0698b2] font-medium" : "text-gray-400"
                          }`}>
                            {type.requires_options ? <CheckCircle size={14} /> : <X size={14} />}
                            Options
                          </span>
                          <span className={`flex items-center gap-1 ${
                            type.requires_correct_answer ? "text-green-600 font-medium" : "text-gray-400"
                          }`}>
                            {type.requires_correct_answer ? <CheckCircle size={14} /> : <X size={14} />}
                            Auto-Grade
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2 text-[#0698b2] hover:bg-cyan-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(type.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Stats Card Component
function StatsCard({ title, count, gradient, icon: Icon }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

// Main Component with Layout
export default function QuestionTypeManager({
  token,
  user,
  onBack,
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
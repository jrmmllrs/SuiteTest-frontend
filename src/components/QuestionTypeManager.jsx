import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Search, Filter, Eye, CheckCircle, AlertCircle, FileText } from "lucide-react";

export default function QuestionTypeManager({ token, onBack }) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading question types...</p>
      </div>
    );
  }

  const totalUsage = Object.values(usageStats).reduce((sum, count) => sum + count, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Question Type Manager
              </h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {message.text && (
            <div
              className={`mb-4 p-4 rounded flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {message.text}
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-600">Total Types</h3>
              <p className="text-2xl font-bold text-blue-600">{questionTypes.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-600">Total Questions</h3>
              <p className="text-2xl font-bold text-green-600">{totalUsage}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-600">With Options</h3>
              <p className="text-2xl font-bold text-purple-600">
                {questionTypes.filter(t => t.requires_options).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-600">With Answer</h3>
              <p className="text-2xl font-bold text-orange-600">
                {questionTypes.filter(t => t.requires_correct_answer).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Question Types ({sortedTypes.length})
              </h2>
              
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
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
                  className={`px-4 py-2 rounded flex items-center gap-2 ${
                    showUsageStats 
                      ? "bg-blue-600 text-white" 
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
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={20} />
                    Add Type
                  </button>
                )}
              </div>
            </div>

            {showForm && (
              <div className="mb-6 p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                <h3 className="text-lg font-semibold mb-4">
                  {editingType ? "Edit Question Type" : "New Question Type"}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type Key * <span className="text-gray-500">(lowercase, underscores only)</span>
                    </label>
                    <input
                      type="text"
                      name="type_key"
                      value={formData.type_key}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., multiple_choice"
                      disabled={editingType !== null}
                      required
                    />
                    {editingType && (
                      <p className="text-xs text-gray-500 mt-1">Type key cannot be changed after creation</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type Name *
                    </label>
                    <input
                      type="text"
                      name="type_name"
                      value={formData.type_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Multiple Choice"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe this question type and when to use it..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        name="requires_options"
                        checked={formData.requires_options}
                        onChange={handleInputChange}
                        className="w-5 h-5 mt-0.5"
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

                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        name="requires_correct_answer"
                        checked={formData.requires_correct_answer}
                        onChange={handleInputChange}
                        className="w-5 h-5 mt-0.5"
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

                  <div className="flex gap-2 justify-end pt-4 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save size={16} />
                      {editingType ? "Update" : "Create"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sortedTypes.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600">
                  {searchTerm || filterOption !== "all"
                    ? "No question types match your search or filter"
                    : "No question types created yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTypes.map((type) => {
                  const usage = usageStats[type.id] || 0;
                  return (
                    <div
                      key={type.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {type.type_name}
                            </h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">
                              {type.type_key}
                            </span>
                            {showUsageStats && (
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                usage > 0 
                                  ? "bg-green-100 text-green-700" 
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
                              type.requires_options ? "text-blue-600" : "text-gray-400"
                            }`}>
                              {type.requires_options ? <CheckCircle size={14} /> : <X size={14} />}
                              Options
                            </span>
                            <span className={`flex items-center gap-1 ${
                              type.requires_correct_answer ? "text-green-600" : "text-gray-400"
                            }`}>
                              {type.requires_correct_answer ? <CheckCircle size={14} /> : <X size={14} />}
                              Auto-Grade
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(type)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(type.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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
      </main>
    </div>
  );
}
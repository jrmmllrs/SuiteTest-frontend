import React, { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  FileText,
  Save,
  X,
  CheckCircle,
  XCircle,
  MoreVertical,
  Sparkles,
} from "lucide-react";
import LayoutWrapper from "./layout/LayoutWrapper";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function DepartmentManagement({
  user,
  token,
  onLogout,
  onNavigate,
  activeTab,
  setActiveTab,
}) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    department_name: "",
    description: "",
    is_active: true,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
      setError("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        department_name: dept.department_name,
        description: dept.description || "",
        is_active: dept.is_active,
      });
    } else {
      setEditingDept(null);
      setFormData({
        department_name: "",
        description: "",
        is_active: true,
      });
    }
    setShowModal(true);
    setError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDept(null);
    setFormData({
      department_name: "",
      description: "",
      is_active: true,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.department_name.trim()) {
      setError("Department name is required");
      return;
    }

    try {
      const url = editingDept
        ? `${API_BASE_URL}/departments/${editingDept.id}`
        : `${API_BASE_URL}/departments`;

      const response = await fetch(url, {
        method: editingDept ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(
          editingDept
            ? "Department updated successfully"
            : "Department created successfully"
        );
        setTimeout(() => setSuccess(""), 3000);
        handleCloseModal();
        fetchDepartments();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error saving department:", err);
      setError("Failed to save department");
    }
  };

  const handleDelete = async (deptId) => {
    if (
      !confirm(
        "Are you sure you want to delete this department? Users and tests associated with it will be unassigned."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/departments/${deptId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Department deleted successfully");
        setTimeout(() => setSuccess(""), 3000);
        fetchDepartments();
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error deleting department:", err);
      setError("Failed to delete department");
    }
  };

  const filteredDepartments = departments
    .filter((dept) => dept.department_name.toLowerCase() !== "question bank")
    .filter((dept) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        dept.department_name.toLowerCase().includes(searchLower) ||
        (dept.description &&
          dept.description.toLowerCase().includes(searchLower))
      );
    });

  // Teal color scheme gradients
  const cardGradients = [
    "from-teal-50 to-cyan-50 border-teal-200",
    "from-blue-50 to-teal-50 border-blue-200",
    "from-cyan-50 to-sky-50 border-cyan-200",
    "from-sky-50 to-blue-50 border-sky-200",
    "from-teal-50 to-emerald-50 border-teal-200",
    "from-cyan-50 to-teal-50 border-cyan-200",
  ];

  const getCardGradient = (index) => {
    return cardGradients[index % cardGradients.length];
  };

  return (
    <LayoutWrapper
      user={user}
      token={token}
      onLogout={onLogout}
      onNavigate={onNavigate}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      {/* Header */}
      {/* <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
              <Building2 size={24} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles size={10} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0495b5] to-[#027a96] bg-clip-text text-transparent">
              Department Management
            </h1>
            <p className="text-gray-600 font-medium">
              Organize users and tests with structured departments
            </p>
          </div>
        </div>
      </div> */}

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <CheckCircle size={16} className="text-teal-600" />
          </div>
          <p className="text-teal-800 font-medium">{success}</p>
        </div>
      )}

      {error && !showModal && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle size={16} className="text-red-600" />
          </div>
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#0495b5]/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Departments</p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-[#0495b5] transition-colors">
                {departments.length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30 group-hover:scale-110 transition-transform">
              <Building2 size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-emerald-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Active</p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {departments.filter((d) => d.is_active).length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <CheckCircle size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-gray-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Inactive</p>
              <p className="text-4xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">
                {departments.filter((d) => !d.is_active).length}
              </p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg shadow-gray-400/30 group-hover:scale-110 transition-transform">
              <XCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search departments by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200 shadow-sm"
              />
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25 hover:shadow-xl hover:shadow-[#0495b5]/30 transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
              Add Department
            </button>
          </div>
        </div>

        {/* Departments Grid */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-[#0495b5]/20 border-t-[#0495b5] rounded-full animate-spin mb-5" />
              <p className="text-gray-600 font-medium text-lg">
                Loading departments...
              </p>
              <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
            </div>
          ) : filteredDepartments.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shadow-inner border border-teal-100">
                <Building2 size={48} className="text-[#0495b5]" />
              </div>
              <p className="text-gray-900 font-semibold text-xl mb-3">
                {searchQuery ? "No departments found" : "No departments yet"}
              </p>
              <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search terms or create a new department"
                  : "Start by creating your first department to organize users and tests efficiently"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25 hover:shadow-xl hover:shadow-[#0495b5]/30 transform hover:-translate-y-0.5"
                >
                  <Plus size={20} />
                  Create First Department
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDepartments.map((dept, index) => (
                <div
                  key={dept.id}
                  className={`relative bg-gradient-to-br ${getCardGradient(index)} border rounded-2xl p-6 transition-all duration-300 transform hover:-translate-y-2 shadow-sm hover:shadow-xl cursor-pointer ${
                    hoveredCard === dept.id ? 'scale-[1.02]' : ''
                  }`}
                  onMouseEnter={() => setHoveredCard(dept.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        dept.is_active
                          ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
                          : "bg-gray-500/20 text-gray-600 border border-gray-500/30"
                      }`}
                    >
                      {dept.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Department Icon */}
                  <div className="w-14 h-14 rounded-xl bg-white/70 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-sm mb-4">
                    <Building2 size={24} className="text-[#0495b5]" />
                  </div>

                  {/* Department Info */}
                  <h3 className="font-bold text-gray-900 text-lg mb-2 pr-16">
                    {dept.department_name}
                  </h3>

                  {dept.description && (
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {dept.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <Users size={14} className="text-[#0495b5]" />
                      </div>
                      <span className="font-semibold text-gray-700">{dept.user_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm">
                        <FileText size={14} className="text-[#0495b5]" />
                      </div>
                      <span className="font-semibold text-gray-700">{dept.test_count || 0}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenModal(dept);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/80 hover:bg-white text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-white/50 backdrop-blur-sm hover:text-[#0495b5]"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(dept.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/80 hover:bg-white text-red-600 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-white/50 backdrop-blur-sm"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-in fade-in-90 zoom-in-95">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0495b5] to-[#027a96] bg-clip-text text-transparent">
                    {editingDept ? "Edit Department" : "Create Department"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {editingDept ? "Update department details" : "Add a new department to your organization"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle size={16} className="text-red-600" />
                  </div>
                  <p className="text-red-800 font-medium text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.department_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200 shadow-sm"
                  placeholder="e.g., Engineering, Marketing, Sales"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200 shadow-sm resize-none"
                  placeholder="Brief description of the department's purpose and responsibilities..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-teal-50 rounded-2xl border border-teal-100">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-5 h-5 text-[#0495b5] border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0495b5]/20"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Active Department
                </label>
                <span className="text-xs text-gray-500 ml-auto">
                  {formData.is_active ? "Visible to users" : "Hidden from users"}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25"
                >
                  <Save size={18} />
                  {editingDept ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}

export default DepartmentManagement;
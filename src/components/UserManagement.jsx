// File: src/components/UserManagement.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Edit2,
  Trash2,
  Plus,
  Search,
  UserPlus,
  Mail,
  Shield,
  Building,
  Filter,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";

// UserManagement Content Component (without header/sidebar)
function UserManagementContent({ token }) {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hoveredRow, setHoveredRow] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    department_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const deptResponse = await fetch(`${API_BASE_URL}/users/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deptData = await deptResponse.json();
      if (deptData.success) setDepartments(deptData.departments);

      const usersResponse = await fetch(`${API_BASE_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usersData = await usersResponse.json();
      if (usersData.success) setUsers(usersData.users);
      else setMessage({ type: "error", text: "Failed to load users" });
    } catch (err) {
      console.error("Error fetching data:", err);
      setMessage({ type: "error", text: "Failed to load data" });
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "candidate",
      department_id: "",
    });
    setCurrentUser(null);
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      department_id: user.department_id || "",
    });
    setCurrentUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "candidate",
      department_id: "",
    });
    setCurrentUser(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setMessage({ type: "error", text: "Name and email are required" });
      return;
    }

    if (modalMode === "create" && !formData.password.trim()) {
      setMessage({ type: "error", text: "Password is required for new users" });
      return;
    }

    if (formData.role === "candidate" && !formData.department_id) {
      setMessage({
        type: "error",
        text: "Department is required for candidates",
      });
      return;
    }

    try {
      const url =
        modalMode === "create"
          ? `${API_BASE_URL}/users/create`
          : `${API_BASE_URL}/users/update/${currentUser.id}`;

      const payload =
        modalMode === "edit" && !formData.password.trim()
          ? {
              name: formData.name,
              email: formData.email,
              role: formData.role,
              department_id: formData.department_id,
            }
          : formData;

      const response = await fetch(url, {
        method: modalMode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setMessage({
          type: "success",
          text: `User ${
            modalMode === "create" ? "created" : "updated"
          } successfully!`,
        });
        fetchData();
        closeModal();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Operation failed" });
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage({
        type: "error",
        text: "Operation failed. Please try again.",
      });
    }
  };

  const handleDelete = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to delete user "${userName}"? This action cannot be undone.`
      )
    )
      return;

    try {
      const response = await fetch(`${API_BASE_URL}/users/delete/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: "success", text: "User deleted successfully!" });
        fetchData();
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({ type: "error", text: data.message || "Delete failed" });
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage({ type: "error", text: "Delete failed. Please try again." });
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    all: users.length,
    admin: users.filter((u) => u.role === "admin").length,
    employer: users.filter((u) => u.role === "employer").length,
    candidate: users.filter((u) => u.role === "candidate").length,
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="inline-block w-16 h-16 border-4 border-[#0495b5]/20 border-t-[#0495b5] rounded-full animate-spin mb-5" />
        <p className="text-gray-600 font-medium text-lg">Loading users...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
      </div>
    );

  return (
    <>
      {/* Header */}
      {/* <div className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
              <UserPlus size={24} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
              <Sparkles size={10} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0495b5] to-[#027a96] bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-600 font-medium">
              Manage system users and their permissions
            </p>
          </div>
        </div>
      </div> */}

      {/* Message Alert */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-2xl border ${
            message.type === "success"
              ? "bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200"
              : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
          } shadow-sm`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              message.type === "success" ? "bg-teal-100" : "bg-red-100"
            }`}>
              {message.type === "success" ? (
                <CheckCircle size={16} className="text-teal-600" />
              ) : (
                <XCircle size={16} className="text-red-600" />
              )}
            </div>
            <span className="font-medium flex-1">{message.text}</span>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-white/50"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          count={roleStats.all}
          gradient="from-[#0495b5] to-[#027a96]"
          icon={UserPlus}
        />
        <StatsCard
          title="Admins"
          count={roleStats.admin}
          gradient="from-purple-500 to-purple-600"
          icon={Shield}
        />
        <StatsCard
          title="Employers"
          count={roleStats.employer}
          gradient="from-emerald-500 to-green-600"
          icon={Building}
        />
        <StatsCard
          title="Candidates"
          count={roleStats.candidate}
          gradient="from-amber-500 to-yellow-600"
          icon={Mail}
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">All Users</h3>
              <p className="text-gray-600 mt-1">
                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-10 pr-8 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] bg-white transition-all duration-200"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="employer">Employer</option>
                  <option value="candidate">Candidate</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-initial">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200"
                />
              </div>

              <button
                onClick={openCreateModal}
                className="flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25 hover:shadow-xl hover:shadow-[#0495b5]/30 transform hover:-translate-y-0.5"
              >
                <Plus size={20} />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shadow-inner border border-teal-100 mb-4">
                        <UserPlus size={40} className="text-[#0495b5]" />
                      </div>
                      <p className="text-gray-900 font-semibold text-xl mb-2">
                        No users found
                      </p>
                      <p className="text-gray-600 text-sm mb-6 max-w-sm leading-relaxed">
                        {searchTerm || filterRole !== "all"
                          ? "Try adjusting your filters or search terms"
                          : "Get started by adding your first user to the system"}
                      </p>
                      {!searchTerm && filterRole === "all" && (
                        <button
                          onClick={openCreateModal}
                          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25 hover:shadow-xl hover:shadow-[#0495b5]/30 transform hover:-translate-y-0.5"
                        >
                          <Plus size={20} />
                          Add First User
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className={`transition-all duration-200 ${
                      hoveredRow === user.id 
                        ? 'bg-gradient-to-r from-teal-50/50 to-cyan-50/50 transform scale-[1.01] shadow-sm' 
                        : 'hover:bg-gray-50/50'
                    }`}
                    onMouseEnter={() => setHoveredRow(user.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                          <span className="text-white font-bold text-base">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail size={16} className="text-[#0495b5]" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.department_name ? (
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Building size={16} className="text-[#0495b5]" />
                          {user.department_name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2.5 text-[#0495b5] hover:text-[#027a96] hover:bg-teal-50 rounded-xl transition-all duration-200 border border-transparent hover:border-teal-200"
                          title="Edit user"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border border-transparent hover:border-red-200"
                          title="Delete user"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          formData={formData}
          setFormData={setFormData}
          departments={departments}
          modalMode={modalMode}
          handleSubmit={handleSubmit}
          closeModal={closeModal}
        />
      )}
    </>
  );
}

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

function RoleBadge({ role }) {
  const styles = {
    admin: "bg-gradient-to-r from-purple-500/15 to-purple-600/15 text-purple-700 border border-purple-200",
    employer: "bg-gradient-to-r from-emerald-500/15 to-green-600/15 text-emerald-700 border border-emerald-200",
    candidate: "bg-gradient-to-r from-amber-500/15 to-yellow-600/15 text-amber-700 border border-amber-200",
  };
  const icons = { admin: Shield, employer: Building, candidate: Mail };
  const Icon = icons[role];
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold ${styles[role]}`}
    >
      <Icon size={14} />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
  );
}

function UserModal({
  formData,
  setFormData,
  departments,
  modalMode,
  handleSubmit,
  closeModal,
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto transform animate-in fade-in-90 zoom-in-95">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#0495b5] to-[#027a96] bg-clip-text text-transparent">
                {modalMode === "create" ? "Create New User" : "Edit User"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {modalMode === "create"
                  ? "Add a new user to the system"
                  : "Update user information"}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200"
              placeholder="john@example.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password{" "}
              {modalMode === "create" && (
                <span className="text-red-500">*</span>
              )}
              {modalMode === "edit" && (
                <span className="text-gray-500 text-xs font-normal ml-1">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value,
                  department_id:
                    e.target.value === "candidate"
                      ? formData.department_id
                      : "",
                })
              }
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200"
            >
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formData.role === "candidate" && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department_id}
                onChange={(e) =>
                  setFormData({ ...formData, department_id: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0495b5]/20 focus:border-[#0495b5] transition-all duration-200"
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-4 pt-4">
            <button
              onClick={closeModal}
              className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#0495b5] to-[#027a96] hover:from-[#0384a1] hover:to-[#026880] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-[#0495b5]/25"
            >
              {modalMode === "create" ? "Create User" : "Update User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main export with LayoutWrapper integration
import LayoutWrapper from "./layout/LayoutWrapper";

export default function UserManagement({
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
      <UserManagementContent token={token} />
    </LayoutWrapper>
  );
}
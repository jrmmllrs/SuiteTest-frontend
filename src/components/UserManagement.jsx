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
      <div className="flex items-center justify-center py-16">
        <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
      </div>
    );

  return (
    <>
      {/* Message Alert */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border-green-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{message.text}</span>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Users"
          count={roleStats.all}
          gradient="bg-gradient-to-br from-[#0698b2] to-[#0482a0]"
          icon={UserPlus}
        />
        <StatsCard
          title="Admins"
          count={roleStats.admin}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={Shield}
        />
        <StatsCard
          title="Employers"
          count={roleStats.employer}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          icon={Building}
        />
        <StatsCard
          title="Candidates"
          count={roleStats.candidate}
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          icon={Mail}
        />
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">All Users</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {filteredUsers.length} user
                {filteredUsers.length !== 1 ? "s" : ""} found
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
                  className="appearance-none w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent bg-white"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="employer">Employer</option>
                  <option value="candidate">Candidate</option>
                </select>
              </div>

              <div className="relative flex-1 sm:flex-initial">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
                />
              </div>

              <button
                onClick={openCreateModal}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus size={18} />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <UserPlus size={32} className="text-gray-300" />
                      </div>
                      <p className="text-gray-900 font-semibold text-lg mb-1">
                        No users found
                      </p>
                      <p className="text-gray-600 text-sm">
                        {searchTerm || filterRole !== "all"
                          ? "Try adjusting your filters or search terms"
                          : "Get started by adding your first user"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#0698b2] to-[#0482a0] flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail size={16} className="text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.department_name ? (
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Building size={16} className="text-gray-400" />
                          {user.department_name}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-[#0698b2] hover:text-[#0482a0] hover:bg-cyan-50 rounded-lg transition-colors"
                          title="Edit user"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{count}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-lg ${gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    admin: "bg-purple-100 text-purple-800 border-purple-200",
    employer: "bg-green-100 text-green-800 border-green-200",
    candidate: "bg-blue-100 text-blue-800 border-blue-200",
  };
  const icons = { admin: Shield, employer: Building, candidate: Mail };
  const Icon = icons[role];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${styles[role]}`}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {modalMode === "create" ? "Create New User" : "Edit User"}
            </h2>
            <p className="text-sm text-gray-600 mt-0.5">
              {modalMode === "create"
                ? "Add a new user to the system"
                : "Update user information"}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
            >
              <option value="candidate">Candidate</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formData.role === "candidate" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department_id}
                onChange={(e) =>
                  setFormData({ ...formData, department_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
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
          <div className="flex gap-3 pt-4">
            <button
              onClick={closeModal}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2.5 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
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

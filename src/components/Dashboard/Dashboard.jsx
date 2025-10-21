import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Target,
  Filter,
  ListChecks,
} from "lucide-react";
import TestCard from "./TestCard";
import InviteModal from "./InviteModal";
import DeleteTestModal from "./DeleteTestModal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Sidebar Component
function Sidebar({
  user,
  userDepartment,
  onNavigate,
  onLogout,
  isMobileOpen,
  setIsMobileOpen,
  activeTab,
  setActiveTab,
}) {
  const getNavItems = () => {
    if (user?.role === "admin") {
      return [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { id: "tests", icon: FileText, label: "Tests" },
        { id: "user-management", icon: Users, label: "User Management" },
        { id: "admin-results", icon: TrendingUp, label: "All Results" },
        {
          id: "question-type-manager",
          icon: ListChecks,
          label: "Question Types",
        },
        { id: "settings", icon: Settings, label: "Settings" },
      ];
    } else if (user?.role === "employer") {
      return [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { id: "tests", icon: FileText, label: "Tests" },
        { id: "settings", icon: Settings, label: "Settings" },
      ];
    } else {
      return [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { id: "tests", icon: FileText, label: "My Tests" },
        { id: "settings", icon: Settings, label: "Settings" },
      ];
    }
  };

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    if (item.id !== "dashboard") {
      onNavigate(item.id);
    }
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0698b2] to-[#0482a0] flex items-center justify-center">
                <FileText size={18} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span
                  className="text-cyan-600 inline-block animate-float"
                  style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
                >
                  Suite
                </span>
                <span
                  className="text-gray-900 inline-block animate-float animation-delay-200"
                  style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
                >
                  Test
                </span>
              </h1>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0698b2] to-[#0482a0] flex items-center justify-center text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            {userDepartment && (
              <div className="mt-2 flex items-center gap-1.5 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-xs text-gray-700 font-medium truncate">
                  {userDepartment}
                </span>
              </div>
            )}
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {getNavItems().map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? "bg-[#0698b2] text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// Stats Card Component
function StatsCard({ label, value, icon: Icon, gradient }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
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

// Main Dashboard Component
export default function Dashboard({ user, token, onLogout, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTestForInvite, setSelectedTestForInvite] = useState(null);
  const [selectedTestForDelete, setSelectedTestForDelete] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchUserDepartment();
    fetchTests();
  }, []);

  const fetchUserDepartment = async () => {
    try {
      if (user?.role === "candidate" && user?.department_name) {
        setUserDepartment(user.department_name);
      }
    } catch (error) {
      console.error("Error setting user department:", error);
    }
  };

  const fetchTests = async () => {
    try {
      if (user?.role === "candidate") {
        const response = await fetch(`${API_BASE_URL}/tests/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setTests(data.tests);
          console.log("Candidate tests:", data.tests);
        } else {
          console.error("Failed to fetch tests:", data.message);
        }
      } else if (user?.role === "employer" || user?.role === "admin") {
        const [myTestsRes, availableTestsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/tests/my-tests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/tests/available`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const myTestsData = await myTestsRes.json();
        const availableTestsData = await availableTestsRes.json();

        const allTests = [...(myTestsData.tests || [])];
        const myTestIds = new Set(allTests.map((t) => t.id));

        if (availableTestsData.success && availableTestsData.tests) {
          availableTestsData.tests.forEach((test) => {
            if (!myTestIds.has(test.id)) {
              allTests.push({
                ...test,
                is_available_to_take: true,
                created_by_me: false,
              });
            }
          });
        }

        allTests.forEach((test) => {
          if (myTestIds.has(test.id)) {
            test.created_by_me = true;
          }
        });

        setTests(allTests);
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const openInviteModal = (test) => {
    setSelectedTestForInvite(test);
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setSelectedTestForInvite(null);
  };

  const openDeleteModal = (test) => {
    setSelectedTestForDelete(test);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedTestForDelete(null);
  };

  const handleTestDeleted = (testId) => {
    setTests((prevTests) => prevTests.filter((test) => test.id !== testId));
    closeDeleteModal();
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "completed") return matchesSearch && test.is_completed;
    if (filterStatus === "pending")
      return matchesSearch && !test.is_completed && !test.is_in_progress;
    if (filterStatus === "in-progress")
      return matchesSearch && test.is_in_progress;

    return matchesSearch;
  });

  const totalQuestions = tests.reduce(
    (sum, test) => sum + (test.question_count || 0),
    0
  );

  const stats = {
    totalTests: tests.length,
    completedTests: tests.filter((t) => t.is_completed).length,
    inProgressTests: tests.filter((t) => t.is_in_progress && !t.is_completed)
      .length,
    myTests: tests.filter((t) => t.created_by_me).length,
    totalQuestions: totalQuestions,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        user={user}
        userDepartment={userDepartment}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-xs text-gray-500">
                  Greetings, {user?.name || user?.email?.split("@")[0]}!
                </p>
              </div>
            </div>

            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* Admin Quick Actions */}
          {user?.role === "admin" && (
            <div className="mb-6 bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">
                Quick Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate("create-test")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Plus size={18} />
                  Create New Test
                </button>
                <button
                  onClick={() => onNavigate("user-management")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Users size={18} />
                  User Management
                </button>
                <button
                  onClick={() => onNavigate("admin-results")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <TrendingUp size={18} />
                  View All Results
                </button>
                <button
                  onClick={() => onNavigate("question-type-manager")}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  <ListChecks size={18} />
                  Question Types
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              label={
                user?.role === "candidate"
                  ? "Available Tests"
                  : user?.role === "admin"
                  ? "Total Tests"
                  : "My Tests"
              }
              value={
                user?.role === "candidate"
                  ? stats.totalTests
                  : user?.role === "admin"
                  ? stats.totalTests
                  : stats.myTests
              }
              icon={FileText}
              gradient="bg-gradient-to-br from-[#0698b2] to-[#0482a0]"
            />
            <StatsCard
              label="Completed"
              value={stats.completedTests}
              icon={CheckCircle}
              gradient="bg-gradient-to-br from-green-500 to-green-600"
            />
            <StatsCard
              label="In Progress"
              value={stats.inProgressTests}
              icon={Clock}
              gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
            />
            <StatsCard
              label="Total Questions"
              value={stats.totalQuestions}
              icon={Target}
              gradient="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </div>

          {/* Tests Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {user?.role === "candidate"
                      ? "Available Tests"
                      : user?.role === "admin"
                      ? "All Tests"
                      : "Your Tests"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {filteredTests.length} test
                    {filteredTests.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="appearance-none w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent bg-white"
                    >
                      <option value="all">All Tests</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <Filter
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>

                  <div className="relative flex-1 sm:flex-initial">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search tests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent"
                    />
                  </div>

                  {user?.role !== "candidate" && (
                    <button
                      onClick={() => onNavigate("create-test")}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                    >
                      <Plus size={18} />
                      <span>New Test</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-5">
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
                    {searchQuery || filterStatus !== "all"
                      ? "No tests found"
                      : "No tests available"}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your filters or search terms"
                      : user?.role === "candidate"
                      ? "No tests available for your department at the moment"
                      : 'No tests created yet. Click "New Test" to get started!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      user={user}
                      userRole={user?.role}
                      onNavigate={onNavigate}
                      onInvite={openInviteModal}
                      onDelete={openDeleteModal}
                      token={token}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {showInviteModal && selectedTestForInvite && (
        <InviteModal
          test={selectedTestForInvite}
          token={token}
          onClose={closeInviteModal}
        />
      )}

      {showDeleteModal && selectedTestForDelete && (
        <DeleteTestModal
          test={selectedTestForDelete}
          token={token}
          onClose={closeDeleteModal}
          onDeleted={handleTestDeleted}
        />
      )}
    </div>
  );
}

// File path: src/components/dashboard/Dashboard.jsx
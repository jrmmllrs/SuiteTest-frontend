// File: src/components/dashboard/Tests.jsx
import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Building,
  Users,
  AlertCircle,
  CheckCircle2,
  Grid3X3,
  List,
  SortAsc,
} from "lucide-react";
import TestCard from "./TestCard";
import InviteModal from "./InviteModal";
import DeleteTestModal from "./DeleteTestModal";
import LayoutWrapper from "../layout/LayoutWrapper";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Department Filter Badge Component
function DepartmentBadge({
  department,
  isSelected,
  onClick,
  testCount,
  isInactive,
}) {
  const isEmployerTests = department === "Employer Tests";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
        isSelected
          ? isInactive
            ? "bg-red-100 border-red-300 text-red-800"
            : isEmployerTests
            ? "bg-purple-100 border-purple-300 text-purple-800"
            : "bg-[#0698b2] border-[#0698b2] text-white"
          : isInactive
          ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
          : isEmployerTests
          ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
      }`}
    >
      {isEmployerTests ? <FileText size={16} /> : <Building size={16} />}
      <span className="text-sm font-medium">{department}</span>
      <span
        className={`px-1.5 py-0.5 rounded-full text-xs ${
          isSelected
            ? isInactive
              ? "bg-red-200 text-red-800"
              : isEmployerTests
              ? "bg-purple-200 text-purple-800"
              : "bg-white text-[#0698b2]"
            : isInactive
            ? "bg-red-100 text-red-700"
            : isEmployerTests
            ? "bg-purple-100 text-purple-700"
            : "bg-white text-gray-600"
        }`}
      >
        {testCount}
      </span>
      {isInactive && !isEmployerTests && (
        <AlertCircle
          size={14}
          className={isSelected ? "text-red-200" : "text-red-500"}
        />
      )}
    </button>
  );
}

// Tests Content Component
function TestsContent({ user, token, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTestForInvite, setSelectedTestForInvite] = useState(null);
  const [selectedTestForDelete, setSelectedTestForDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetchTests();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error("Error fetching departments:", err);
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

  const isDepartmentInactive = (deptName) => {
    const dept = departments.find((d) => d.department_name === deptName);
    return dept ? dept.is_active === 0 : false;
  };

  // Fixed: Properly handle department names for employers
  const getCleanDepartmentName = (test) => {
    const deptName = test.department_name;

    // If it's Question Bank, return null to filter it out
    if (deptName && deptName.toLowerCase() === "question bank") {
      return null;
    }

    // If target_role is "employer", always show as "Employer Tests"
    if (test.target_role === "employer") {
      return "Employer Tests";
    }

    // If department_name is NULL or empty, show "General"
    if (!deptName || deptName.trim() === "") {
      return "General";
    }

    return deptName;
  };

  // Get unique departments from tests
  const getDepartmentStats = () => {
    const deptMap = {};

    tests.forEach((test) => {
      const cleanDeptName = getCleanDepartmentName(test);

      // Skip if it's Question Bank (cleanDeptName will be null)
      if (cleanDeptName === null) {
        return;
      }

      if (!deptMap[cleanDeptName]) {
        deptMap[cleanDeptName] = {
          name: cleanDeptName,
          count: 0,
          inactive: isDepartmentInactive(cleanDeptName),
        };
      }
      deptMap[cleanDeptName].count++;
    });

    return Object.values(deptMap).sort((a, b) => {
      // Put "Employer Tests" first
      if (a.name === "Employer Tests") return -1;
      if (b.name === "Employer Tests") return 1;

      // Put "General" at the end
      if (a.name === "General") return 1;
      if (b.name === "General") return -1;

      // Then sort by active/inactive status
      if (a.inactive !== b.inactive) return a.inactive ? 1 : -1;

      // Then alphabetically
      return a.name.localeCompare(b.name);
    });
  };

  const departmentStats = getDepartmentStats();
  const inactiveDepartmentCount = departmentStats.filter(
    (dept) => dept.inactive && dept.name !== "Employer Tests"
  ).length;

  // Filter tests
  const filteredTests = tests.filter((test) => {
    const cleanDeptName = getCleanDepartmentName(test);

    // Completely exclude Question Bank tests
    if (cleanDeptName === null) {
      return false;
    }

    const matchesSearch =
      test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cleanDeptName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTestStatus = true;
    if (filterStatus === "completed") matchesTestStatus = test.is_completed;
    else if (filterStatus === "pending")
      matchesTestStatus = !test.is_completed && !test.is_in_progress;
    else if (filterStatus === "in-progress")
      matchesTestStatus = test.is_in_progress;

    let matchesDepartment = true;
    if (selectedDepartment !== "all") {
      matchesDepartment = cleanDeptName === selectedDepartment;
    }

    return matchesSearch && matchesTestStatus && matchesDepartment;
  });

  // Sort tests
  const sortedTests = [...filteredTests].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "date":
        return new Date(b.created_at) - new Date(a.created_at);
      case "status":
        if (a.is_completed && !b.is_completed) return -1;
        if (!a.is_completed && b.is_completed) return 1;
        if (a.is_in_progress && !b.is_in_progress) return -1;
        if (!a.is_in_progress && b.is_in_progress) return 1;
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const hasEmployerTests = departmentStats.some(
    (dept) => dept.name === "Employer Tests"
  );

  return (
    <>
      {/* Inactive Department Warning */}
      {(user?.role === "admin" || user?.role === "employer") &&
        inactiveDepartmentCount > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-1">
                {inactiveDepartmentCount} Inactive Department
                {inactiveDepartmentCount !== 1 ? "s" : ""} Detected
              </h4>
              <p className="text-sm text-red-700">
                Tests in inactive departments may not be accessible to
                candidates.
              </p>
            </div>
            <button
              onClick={() => onNavigate("department-management")}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Manage Departments
            </button>
          </div>
        )}

      {/* Tests Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
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
                {filteredTests.length !== 1 ? "s" : ""}
                {departmentStats.length > 0 && (
                  <>
                    {" "}
                    in {departmentStats.length}{" "}
                    {user?.role === "employer" ? "category" : "department"}
                    {departmentStats.length !== 1 ? "s" : ""}
                  </>
                )}
                {hasEmployerTests && (
                  <span className="text-purple-600 ml-2">
                    • Includes employer tests
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-[#0698b2] text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-[#0698b2] text-white"
                      : "bg-white text-gray-600"
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent bg-white"
                >
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                  <option value="status">Sort by Status</option>
                </select>
                <SortAsc
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
              </div>

              {user?.role === "candidate" && (
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
              )}

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

          {/* Department Filter Bar */}
          {departmentStats.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <DepartmentBadge
                department="All Departments"
                isSelected={selectedDepartment === "all"}
                onClick={() => setSelectedDepartment("all")}
                testCount={filteredTests.length}
              />
              {departmentStats.map((dept) => (
                <DepartmentBadge
                  key={dept.name}
                  department={dept.name}
                  isSelected={selectedDepartment === dept.name}
                  onClick={() => setSelectedDepartment(dept.name)}
                  testCount={dept.count}
                  isInactive={dept.inactive}
                />
              ))}
            </div>
          )}
        </div>

        {/* Tests Content */}
        <div className="p-5">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading tests...</p>
            </div>
          ) : sortedTests.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-900 font-semibold text-lg mb-2">
                {searchQuery ||
                selectedDepartment !== "all" ||
                filterStatus !== "all"
                  ? "No tests found"
                  : "No tests available"}
              </p>
              <p className="text-gray-600 text-sm">
                {searchQuery ||
                selectedDepartment !== "all" ||
                filterStatus !== "all"
                  ? "Try adjusting your filters or search terms"
                  : user?.role === "candidate"
                  ? "No tests available for your department at the moment"
                  : 'No tests created yet. Click "New Test" to get started!'}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTests.map((test) => (
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
          ) : (
            <div className="space-y-3">
              {sortedTests.map((test) => (
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
    </>
  );
}

// Main Tests Component with Layout
export default function Tests({
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
      <TestsContent user={user} token={token} onNavigate={onNavigate} />
    </LayoutWrapper>
  );
}

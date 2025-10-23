// File: src/components/dashboard/Tests.jsx
import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Search,
  Filter,
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import TestCard from "./TestCard";
import InviteModal from "./InviteModal";
import DeleteTestModal from "./DeleteTestModal";
import LayoutWrapper from "../layout/LayoutWrapper";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Folder Component (Shows active/inactive status)
function TestFolder({
  folderName,
  tests,
  isOpen,
  onToggle,
  user,
  onNavigate,
  onInvite,
  onDelete,
  token,
  isInactive,
}) {
  const completedCount = tests.filter((t) => t.is_completed).length;
  const inProgressCount = tests.filter(
    (t) => t.is_in_progress && !t.is_completed
  ).length;

  return (
    <div
      className={`border ${
        isInactive ? "border-red-300 bg-red-50" : "border-gray-200"
      } rounded-lg overflow-hidden mb-4`}
    >
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 ${
          isInactive
            ? "bg-red-50 hover:bg-red-100"
            : "bg-gray-50 hover:bg-gray-100"
        } transition-colors`}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <FolderOpen
              size={20}
              className={isInactive ? "text-red-500" : "text-[#0698b2]"}
            />
          ) : (
            <Folder
              size={20}
              className={isInactive ? "text-red-400" : "text-gray-400"}
            />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3
                className={`font-semibold ${
                  isInactive ? "text-red-900" : "text-gray-900"
                }`}
              >
                {folderName}
              </h3>
              {isInactive ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 border border-red-300 rounded-full text-xs font-medium text-red-700">
                  <AlertCircle size={12} />
                  Inactive
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 border border-green-300 rounded-full text-xs font-medium text-green-700">
                  <CheckCircle2 size={12} />
                  Active
                </span>
              )}
            </div>
            <p
              className={`text-xs ${
                isInactive ? "text-red-600" : "text-gray-500"
              } mt-0.5`}
            >
              {tests.length} test{tests.length !== 1 ? "s" : ""}
              {completedCount > 0 && ` • ${completedCount} completed`}
              {inProgressCount > 0 && ` • ${inProgressCount} in progress`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 ${
              isInactive
                ? "bg-red-100 border-red-300 text-red-700"
                : "bg-white border-gray-200 text-gray-700"
            } border rounded-full text-sm font-medium`}
          >
            {tests.length}
          </span>
          {isOpen ? (
            <ChevronDown
              size={20}
              className={isInactive ? "text-red-400" : "text-gray-400"}
            />
          ) : (
            <ChevronRight
              size={20}
              className={isInactive ? "text-red-400" : "text-gray-400"}
            />
          )}
        </div>
      </button>

      {isOpen && (
        <div className={`p-4 ${isInactive ? "bg-red-50/50" : "bg-white"}`}>
          {isInactive && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
              <AlertCircle
                size={18}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-red-900">
                  This department is currently inactive
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Tests in this department may not be available to candidates
                  until the department is reactivated.
                </p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                user={user}
                userRole={user?.role}
                onNavigate={onNavigate}
                onInvite={onInvite}
                onDelete={onDelete}
                token={token}
              />
            ))}
          </div>
        </div>
      )}
    </div>
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
  const [filterDepartmentStatus, setFilterDepartmentStatus] = useState("all");
  const [openFolders, setOpenFolders] = useState({});

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

  const filteredTests = tests.filter((test) => {
    const departmentName = test.department_name || "Uncategorized";
    const matchesSearch =
      test.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      departmentName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTestStatus = true;
    if (filterStatus === "completed") matchesTestStatus = test.is_completed;
    else if (filterStatus === "pending")
      matchesTestStatus = !test.is_completed && !test.is_in_progress;
    else if (filterStatus === "in-progress")
      matchesTestStatus = test.is_in_progress;

    let matchesDeptStatus = true;
    if (filterDepartmentStatus === "active") {
      matchesDeptStatus = !isDepartmentInactive(departmentName);
    } else if (filterDepartmentStatus === "inactive") {
      matchesDeptStatus = isDepartmentInactive(departmentName);
    }

    return matchesSearch && matchesTestStatus && matchesDeptStatus;
  });

  const shouldUseFolders = user?.role === "admin" || user?.role === "employer";

  const testsByDepartment = shouldUseFolders
    ? filteredTests.reduce((acc, test) => {
        const deptName = test.department_name || "Uncategorized";

        if (deptName.toLowerCase() === "question bank") {
          return acc;
        }

        if (!acc[deptName]) {
          acc[deptName] = [];
        }
        acc[deptName].push(test);
        return acc;
      }, {})
    : {};

  const departmentNames = shouldUseFolders
    ? Object.keys(testsByDepartment).sort((a, b) => {
        const aInactive = isDepartmentInactive(a);
        const bInactive = isDepartmentInactive(b);

        if (aInactive !== bInactive) {
          return aInactive ? 1 : -1;
        }

        return a.localeCompare(b);
      })
    : [];

  const toggleFolder = (dept) => {
    setOpenFolders((prev) => ({
      ...prev,
      [dept]: !prev[dept],
    }));
  };

  const expandAll = () => {
    const allOpen = {};
    departmentNames.forEach((dept) => {
      allOpen[dept] = true;
    });
    setOpenFolders(allOpen);
  };

  const collapseAll = () => {
    setOpenFolders({});
  };

  const inactiveDepartmentCount = departmentNames.filter((deptName) =>
    isDepartmentInactive(deptName)
  ).length;

  const activeDepartmentCount =
    departmentNames.length - inactiveDepartmentCount;

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
                Some departments are currently inactive. Tests in inactive
                departments may not be accessible to candidates.
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
                {filteredTests.length !== 1 ? "s" : ""}
                {shouldUseFolders && (
                  <>
                    {" "}
                    in {departmentNames.length} folder
                    {departmentNames.length !== 1 ? "s" : ""}
                    <span className="text-green-600 font-medium">
                      {" "}
                      • {activeDepartmentCount} active
                    </span>
                    {inactiveDepartmentCount > 0 && (
                      <span className="text-red-600 font-medium">
                        {" "}
                        • {inactiveDepartmentCount} inactive
                      </span>
                    )}
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {shouldUseFolders && (
                <div className="relative">
                  <select
                    value={filterDepartmentStatus}
                    onChange={(e) => setFilterDepartmentStatus(e.target.value)}
                    className="appearance-none w-full sm:w-auto pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0698b2] focus:border-transparent bg-white"
                  >
                    <option value="all">All Departments</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                  <Folder
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                </div>
              )}

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
                {searchQuery ||
                filterStatus !== "all" ||
                filterDepartmentStatus !== "all"
                  ? "No tests found"
                  : "No tests available"}
              </p>
              <p className="text-gray-600 text-sm">
                {searchQuery ||
                filterStatus !== "all" ||
                filterDepartmentStatus !== "all"
                  ? "Try adjusting your filters or search terms"
                  : user?.role === "candidate"
                  ? "No tests available for your department at the moment"
                  : 'No tests created yet. Click "New Test" to get started!'}
              </p>
            </div>
          ) : shouldUseFolders ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing {departmentNames.length} department
                  {departmentNames.length !== 1 ? "s" : ""}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="text-sm text-[#0698b2] hover:text-[#0482a0] font-medium"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={collapseAll}
                    className="text-sm text-[#0698b2] hover:text-[#0482a0] font-medium"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {departmentNames.map((deptName) => (
                <TestFolder
                  key={deptName}
                  folderName={deptName}
                  tests={testsByDepartment[deptName]}
                  isOpen={openFolders[deptName]}
                  onToggle={() => toggleFolder(deptName)}
                  user={user}
                  onNavigate={onNavigate}
                  onInvite={openInviteModal}
                  onDelete={openDeleteModal}
                  token={token}
                  isInactive={isDepartmentInactive(deptName)}
                />
              ))}
            </>
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
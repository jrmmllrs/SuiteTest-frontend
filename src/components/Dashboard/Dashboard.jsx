/* eslint-disable no-unused-vars */
// File: src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  ListChecks,
  Users,
  AlertCircle,
} from "lucide-react";
import AllInvitationsView from "./AllInvitationsView";
import LayoutWrapper from "../layout/LayoutWrapper";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Stats Card Component
function StatsCard({ label, value, icon: Icon, gradient, onClick }) {
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
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

// Dashboard Content Component
function DashboardContent({ user, token, onNavigate, activeTab }) {
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    inProgressTests: 0,
    myTests: 0,
    totalQuestions: 0,
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [questionBankCount, setQuestionBankCount] = useState(0);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboardData();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      // Fetch tests
      let tests = [];
      if (user?.role === "candidate") {
        const response = await fetch(`${API_BASE_URL}/tests/available`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) tests = data.tests;
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

        tests = allTests;
      }

      // Calculate stats
      const totalQuestions = tests.reduce(
        (sum, test) => sum + (test.question_count || 0),
        0
      );

      setStats({
        totalTests: tests.length,
        completedTests: tests.filter((t) => t.is_completed).length,
        inProgressTests: tests.filter(
          (t) => t.is_in_progress && !t.is_completed
        ).length,
        myTests: tests.filter((t) => t.created_by_me).length,
        totalQuestions: totalQuestions,
      });

      // Fetch departments
      const deptResponse = await fetch(`${API_BASE_URL}/departments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const deptData = await deptResponse.json();
      if (deptData.success) {
        setDepartments(deptData.departments || []);
      }

      // Fetch question bank count
      const qbResponse = await fetch(
        `${API_BASE_URL}/tests/questions/all?source=question-bank`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const qbData = await qbResponse.json();
      if (qbData.success) {
        setQuestionBankCount(qbData.questions?.length || 0);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const inactiveDepartmentCount = departments.filter(
    (d) => d.is_active === 0
  ).length;

  // Show Invitations View when invitations tab is active
  if (activeTab === "invitations") {
    return (
      <AllInvitationsView user={user} token={token} onNavigate={onNavigate} />
    );
  }

  return (
    <>
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
            <button
              onClick={() => onNavigate("question-bank")}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              <Target size={18} />
              Question Bank
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
          onClick={() => onNavigate("tests")}
        />
        <StatsCard
          label="Completed"
          value={stats.completedTests}
          icon={CheckCircle}
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          onClick={() => onNavigate("tests")}
        />
        <StatsCard
          label="In Progress"
          value={stats.inProgressTests}
          icon={Clock}
          gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
          onClick={() => onNavigate("tests")}
        />
        <StatsCard
          label="Total Questions in Bank"
          value={questionBankCount}
          icon={Target}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          onClick={() => onNavigate("question-bank")}
        />
      </div>

      {/* Analytics Section - PLACEHOLDER FOR FUTURE ANALYTICS */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Analytics Overview
        </h3>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-[#0698b2] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading analytics...</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <TrendingUp size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-2">
              Analytics Coming Soon
            </p>
            <p className="text-gray-600 text-sm mb-4">
              Detailed analytics and insights will be available here
            </p>
            <button
              onClick={() => onNavigate("tests")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0698b2] hover:bg-[#0482a0] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <FileText size={18} />
              View All Tests
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// Main Dashboard Component with Layout
export default function Dashboard({
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
      <DashboardContent
        user={user}
        token={token}
        onNavigate={onNavigate}
        activeTab={activeTab}
      />
    </LayoutWrapper>
  );
}

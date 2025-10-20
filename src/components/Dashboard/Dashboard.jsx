import React, { useState, useEffect } from "react";
import DashboardNavigation from "./DashboardNavigation";
import DashboardStats from "./DashboardStats";
import DashboardActions from "./DashboardActions";
import TestCard from "./TestCard";
import InviteModal from "./InviteModal";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function Dashboard({ user, token, onLogout, onNavigate }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTestForInvite, setSelectedTestForInvite] = useState(null);
  const [userDepartment, setUserDepartment] = useState(null);

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
        const response = await fetch(`${API_BASE_URL}/api/tests/available`, {
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
          fetch(`${API_BASE_URL}/api/tests/my-tests`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/tests/available`, {
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

  const totalQuestions = tests.reduce(
    (sum, test) => sum + (test.question_count || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardNavigation
        user={user}
        userDepartment={userDepartment}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>

            <DashboardStats
              user={user}
              userDepartment={userDepartment}
              tests={tests}
              totalQuestions={totalQuestions}
            />

            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.role === "candidate"
                    ? "Available Tests"
                    : "Your Tests"}
                </h3>

                <DashboardActions
                  userRole={user?.role}
                  onNavigate={onNavigate}
                />
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading tests...</p>
                </div>
              ) : tests.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    {user?.role === "candidate"
                      ? "No tests available for your department at the moment"
                      : "No tests created yet. Click 'Create New Test' to get started!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      user={user}
                      userRole={user?.role}
                      onNavigate={onNavigate}
                      onInvite={openInviteModal}
                      token={token}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showInviteModal && selectedTestForInvite && (
        <InviteModal
          test={selectedTestForInvite}
          token={token}
          onClose={closeInviteModal}
        />
      )}
    </div>
  );
}

// File path: src/components/dashboard/Dashboard.jsx
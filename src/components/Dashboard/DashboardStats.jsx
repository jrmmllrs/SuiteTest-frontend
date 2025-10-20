import React from "react";
import { Building } from "lucide-react";
import DashboardStatsCard from "./DashboardStatsCard";

export default function DashboardStats({ user, userDepartment, tests, totalQuestions }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <DashboardStatsCard
        title="User Info"
        value={user?.email}
        subtitle={
          <>
            <span>Role: {user?.role}</span>
            {user?.role === "candidate" && userDepartment && (
              <span className="flex items-center gap-1 mt-1">
                <Building size={14} />
                Department: {userDepartment}
              </span>
            )}
          </>
        }
        bgColor="bg-blue-50"
        textColor="text-blue-900"
      />

      <DashboardStatsCard
        title={
          user?.role === "candidate"
            ? "Available Tests"
            : "Total Tests"
        }
        value={tests.length}
        subtitle={
          user?.role === "candidate"
            ? "For your department"
            : "Created & Available"
        }
        bgColor="bg-green-50"
        textColor="text-green-900"
      />

      <DashboardStatsCard
        title="Questions"
        value={totalQuestions}
        subtitle="Total questions"
        bgColor="bg-purple-50"
        textColor="text-purple-900"
      />
    </div>
  );
}

// File path: src/components/dashboard/DashboardStats.jsx
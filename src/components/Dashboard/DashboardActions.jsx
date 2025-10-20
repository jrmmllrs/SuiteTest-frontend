import React from "react";
import { Plus, Users, FileText } from "lucide-react";

export default function DashboardActions({ userRole, onNavigate }) {
  if (userRole !== "admin") return null;

  return (
    <div className="flex gap-2">
      <button
        onClick={() => onNavigate("admin-results")}
        className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-2"
      >
        <Users size={20} />
        View All Results
      </button>
      <button
        onClick={() => onNavigate("user-management")}
        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center gap-2"
      >
        <Users size={20} />
        User Management
      </button>
      <button
        onClick={() => onNavigate("question-type-manager")}
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-2"
      >
        <FileText size={20} />
        Question Types
      </button>
      <button
        onClick={() => onNavigate("create-test")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus size={20} />
        Create New Test
      </button>
    </div>
  );
}

// File path: src/components/dashboard/DashboardActions.jsx
import React from "react";
import { Building } from "lucide-react";

export default function DashboardNavigation({ user, userDepartment, onLogout }) {
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">TestGorilla</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.email}</span>
            {user?.role === "candidate" && userDepartment && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded">
                <Building size={16} />
                <span>{userDepartment}</span>
              </div>
            )}
            <span className="text-sm text-gray-500 capitalize">
              ({user?.role})
            </span>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

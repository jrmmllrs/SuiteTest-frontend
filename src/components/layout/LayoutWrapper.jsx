// File: src/components/layout/LayoutWrapper.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  Bell,
  X,
  TrendingUp,
  ListChecks,
  Mail,
  Target,
} from "lucide-react";

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
        { id: "invitations", icon: Mail, label: "Invitations" },
        { id: "user-management", icon: Users, label: "User Management" },
        { id: "admin-results", icon: TrendingUp, label: "All Results" },
        {
          id: "question-type-manager",
          icon: ListChecks,
          label: "Question Types",
        },
        {
          id: "question-bank",
          icon: Target, // ← import this icon from lucide-react
          label: "Question Bank",
        },
        { id: "settings", icon: Settings, label: "Settings" },
      ];
    } else if (user?.role === "employer") {
      return [
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { id: "tests", icon: FileText, label: "Tests" },
        { id: "invitations", icon: Mail, label: "Invitations" },
        {
          id: "question-bank",
          icon: Target,
          label: "Question Bank",
        },
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
    onNavigate(item.id);
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
                  className="text-cyan-600 inline-block"
                  style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
                >
                  Suite
                </span>
                <span
                  className="text-gray-900 inline-block"
                  style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}
                >
                  Test
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onLogout}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
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

          {/* Mobile Logout Button */}
          <div className="p-3 border-t border-gray-200 lg:hidden">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
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

// Layout Wrapper Component
export default function LayoutWrapper({
  user,
  token,
  onLogout,
  onNavigate,
  activeTab,
  setActiveTab,
  children,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [userDepartment, setUserDepartment] = useState(null);

  useEffect(() => {
    if (user?.role === "candidate" && user?.department_name) {
      setUserDepartment(user.department_name);
    }
  }, [user]);

  // Get page title based on active tab
  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      tests: "Tests",
      invitations: "Invitations",
      "user-management": "User Management",
      "admin-results": "All Results",
      "question-type-manager": "Question Types",
      settings: "Settings",
      "create-test": "Create Test",
    };
    return titles[activeTab] || "Dashboard";
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
                <h2 className="text-xl font-bold text-gray-900">
                  {getPageTitle()}
                </h2>
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

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

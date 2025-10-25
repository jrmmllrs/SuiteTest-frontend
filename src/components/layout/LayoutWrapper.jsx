// File: src/components/layout/LayoutWrapper.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  TrendingUp,
  ListChecks,
  Mail,
  Target,
  Building2,
  BookOpen,
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
        // Main Section
        { type: "section", label: "Main" },
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },

        // Test Management Section
        { type: "section", label: "Test Management" },
        { id: "tests", icon: FileText, label: "Tests" },
        { id: "question-bank", icon: Target, label: "Question Bank" },
        {
          id: "question-type-manager",
          icon: ListChecks,
          label: "Question Types",
        },

        // Communication Section
        { type: "section", label: "Communication" },
        { id: "invitations", icon: Mail, label: "Invitations" },

        // Administration Section
        { type: "section", label: "Administration" },
        { id: "user-management", icon: Users, label: "User Management" },
        { id: "department-management", icon: Building2, label: "Departments" },

        // Analytics Section
        { type: "section", label: "Analytics" },
        { id: "admin-results", icon: TrendingUp, label: "All Results" },
      ];
    } else if (user?.role === "employer") {
      return [
        // Main Section
        { type: "section", label: "Main" },
        { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },

        // Test Management Section
        { type: "section", label: "Test Management" },
        { id: "tests", icon: FileText, label: "Tests" },
        { id: "question-bank", icon: Target, label: "Question Bank" },

        // Communication Section
        { type: "section", label: "Communication" },
        { id: "invitations", icon: Mail, label: "Invitations" },
      ];
    } else {
      // Candidate - Includes Test Guide
      return [
        // Tests Section
        { type: "section", label: "Tests" },
        { id: "tests", icon: FileText, label: "My Tests" },
        { id: "test-guide", icon: BookOpen, label: "Test Guide" },
      ];
    }
  };

  const handleNavClick = (item) => {
    if (item.type === "section") return;
    setActiveTab(item.id);
    onNavigate(item.id);
    setIsMobileOpen(false);
  };

  const navItems = getNavItems();

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
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0698b2] to-[#0482a0] flex items-center justify-center">
                <FileText size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="text-cyan-600">Suite</span>
                <span className="text-gray-900">Test</span>
              </h1>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center space-x-3 p-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0698b2] to-[#0482a0] flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase() ||
                  user?.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-gray-400 capitalize mt-1">
                  {user?.role}
                </p>
              </div>
            </div>
            {userDepartment && (
              <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-xs text-gray-700 font-medium">
                  {userDepartment}
                </span>
              </div>
            )}
          </div>

          {/* Navigation with Sections */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item, index) => {
              if (item.type === "section") {
                return (
                  <div key={`section-${index}`} className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {item.label}
                    </h3>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === item.id
                      ? "bg-[#0698b2] text-white"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
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
      tests: user?.role === "candidate" ? "My Tests" : "Tests",
      invitations: "Invitations",
      "user-management": "User Management",
      "department-management": "Department Management",
      "admin-results": "All Results",
      "question-type-manager": "Question Types",
      "question-bank": "Question Bank",
      "test-guide": "Test Guide",
    };
    return (
      titles[activeTab] ||
      (user?.role === "candidate" ? "My Tests" : "Dashboard")
    );
  };

  // Set default tab for candidate (since they don't have dashboard)
  useEffect(() => {
    if (user?.role === "candidate" && activeTab === "dashboard") {
      setActiveTab("tests");
      onNavigate("tests");
    }
  }, [user, activeTab, setActiveTab, onNavigate]);

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
        {/* Clean Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="h-16 px-6 flex items-center justify-between">
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
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

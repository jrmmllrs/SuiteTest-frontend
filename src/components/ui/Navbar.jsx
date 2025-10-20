import React from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "./Button";

export const NavBar = ({ title, user, onLogout, onBack, children }) => (
  <nav className="bg-white shadow-lg sticky top-0 z-10">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16 items-center">
        <div className="flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center gap-4">
          {children}
          {user && (
            <>
              <span className="text-gray-700">
                Welcome, <span className="font-semibold">{user.name}</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {user.role}
              </span>
              {onLogout && (
                <Button variant="danger" onClick={onLogout} icon={LogOut}>
                  Logout
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </nav>
);
import React from "react";
import { ArrowLeft } from "lucide-react";
import AllInvitationsView from "../components/Dashboard/AllInvitationsView";
import LayoutWrapper from "./layout/LayoutWrapper";

export default function InvitationsManagerView({
  token,
  user,
  onBack,
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
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0698b2] font-medium transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
      </div>

      {/* Invitations Manager */}
      <AllInvitationsView user={user} token={token} onNavigate={onNavigate} />
    </LayoutWrapper>
  );
}

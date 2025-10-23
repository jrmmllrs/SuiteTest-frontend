import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard/Dashboard";
import CreateTest from "./components/CreateTest";
import EditTest from "./components/EditTest";
import TakeTest from "./components/TakeTest/TakeTest";
import AdminResults from "./components/AdminResults";
import ProctoringEvents from "./components/ProctoringEvents";
import InvitationAccept from "./components/AcceptInvitation";
import AnswerReview from "./components/ReviewAnswers";
import QuestionTypeManager from "./components/QuestionTypeManager";
import ViewTest from "./components/ViewTest";
import TestResults from "./components/TestResults";
import UserManagement from "./components/UserManagement";
import QuestionBank from "./components/Dashboard/QuestionBank"; // 🆕 Added
import { VIEWS } from "./constants/views";
import { API_BASE_URL } from "./constants";
import { useAuth } from "./hooks/useAuth";
import { useInvitation } from "./hooks/useInvitation";
import LoadingScreen from "./components/LoadingScreen";
import InvitationsManagerView from "./components/InvitationManagerView";

export default function App() {
  const [currentView, setCurrentView] = useState(VIEWS.LOADING);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [checkingActiveTest, setCheckingActiveTest] = useState(false);

  const { user, token, login, logout, restoreSession } = useAuth();
  const { invitationToken, checkForInvitation, clearInvitation } =
    useInvitation();

  useEffect(() => {
    initializeApp();
  }, []);

  // Check for active test when user is authenticated
  useEffect(() => {
    if (token && user && currentView === VIEWS.DASHBOARD) {
      checkForActiveTest();
    }
  }, [token, user]);

  const initializeApp = () => {
    const hasSession = restoreSession();
    const inviteToken = checkForInvitation();

    if (inviteToken) {
      setCurrentView(VIEWS.INVITATION_ACCEPT);
    } else if (hasSession) {
      setCurrentView(VIEWS.DASHBOARD);
      setActiveTab("dashboard");
    } else {
      setCurrentView(VIEWS.AUTH);
    }
  };

  const checkForActiveTest = async () => {
    if (checkingActiveTest) return; // Prevent duplicate checks
    
    setCheckingActiveTest(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tests/active-test`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.activeTest) {
        console.log('Found active test, redirecting...', data.activeTest);
        
        // Automatically navigate to the active test
        setSelectedTestId(data.activeTest.test_id);
        setCurrentView(VIEWS.TAKE_TEST);
        setActiveTab("tests");
        
        // Optional: Show a notification
        showNotification('info', 'Resuming your active test...');
      }
    } catch (error) {
      console.error('Error checking for active test:', error);
    } finally {
      setCheckingActiveTest(false);
    }
  };

  const showNotification = (type, message) => {
    // You can implement a toast notification here
    // For now, just console log
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  const handleAuthSuccess = (userData, authToken) => {
    login(userData, authToken);

    if (invitationToken) {
      setCurrentView(VIEWS.INVITATION_ACCEPT);
    } else {
      setCurrentView(VIEWS.DASHBOARD);
      setActiveTab("dashboard");
    }
  };

  const handleLogout = () => {
    logout();
    clearInvitation();
    setSelectedTestId(null);
    setSelectedCandidateId(null);
    setCurrentView(VIEWS.AUTH);
    setActiveTab("dashboard");
  };

  const handleNavigate = (view, testId = null, candidateId = null) => {
    console.log("handleNavigate called with:", { view, testId, candidateId });
    
    setSelectedTestId(testId);
    setSelectedCandidateId(candidateId);

    // ✅ FIXED: Handle string-based navigation from sidebar
    // Map sidebar navigation IDs to appropriate views and tabs
    switch(view) {
      case "dashboard":
        setCurrentView(VIEWS.DASHBOARD);
        setActiveTab("dashboard");
        break;
      
      case "tests":
        setCurrentView(VIEWS.DASHBOARD);
        setActiveTab("tests");
        break;
      
      case "invitations":
        // Keep user in dashboard view but change the active tab
        setCurrentView(VIEWS.DASHBOARD);
        setActiveTab("invitations");
        break;
      
      case "user-management":
        setCurrentView(VIEWS.USER_MANAGEMENT);
        setActiveTab("user-management");
        break;
      
      case "admin-results":
        setCurrentView(VIEWS.ADMIN_RESULTS);
        setActiveTab("admin-results");
        break;
      
      case "question-type-manager":
        setCurrentView(VIEWS.QUESTION_TYPE_MANAGER);
        setActiveTab("question-type-manager");
        break;
      
      // 🆕 Added Question Bank navigation
      case "question-bank":
        setCurrentView(VIEWS.QUESTION_BANK);
        setActiveTab("question-bank");
        break;
      
      case "settings":
        // You might want to add a settings view later
        setCurrentView(VIEWS.DASHBOARD);
        setActiveTab("settings");
        break;
      
      // Handle VIEWS constants (for programmatic navigation)
      case VIEWS.DASHBOARD:
        setCurrentView(VIEWS.DASHBOARD);
        setActiveTab("dashboard");
        break;
      
      case VIEWS.CREATE_TEST:
        setCurrentView(VIEWS.CREATE_TEST);
        setActiveTab("tests");
        break;
      
      case VIEWS.EDIT_TEST:
        setCurrentView(VIEWS.EDIT_TEST);
        setActiveTab("tests");
        break;
      
      case VIEWS.VIEW_TEST:
        setCurrentView(VIEWS.VIEW_TEST);
        setActiveTab("tests");
        break;
      
      case VIEWS.TEST_RESULTS:
        setCurrentView(VIEWS.TEST_RESULTS);
        setActiveTab("tests");
        break;
      
      case VIEWS.TAKE_TEST:
        setCurrentView(VIEWS.TAKE_TEST);
        setActiveTab("tests");
        break;
      
      case VIEWS.USER_MANAGEMENT:
        setCurrentView(VIEWS.USER_MANAGEMENT);
        setActiveTab("user-management");
        break;
      
      case VIEWS.ADMIN_RESULTS:
        setCurrentView(VIEWS.ADMIN_RESULTS);
        setActiveTab("admin-results");
        break;
      
      case VIEWS.QUESTION_TYPE_MANAGER:
        setCurrentView(VIEWS.QUESTION_TYPE_MANAGER);
        setActiveTab("question-type-manager");
        break;
      
      // 🆕 Added Question Bank VIEWS constant case
      case VIEWS.QUESTION_BANK:
        setCurrentView(VIEWS.QUESTION_BANK);
        setActiveTab("question-bank");
        break;
      
      case VIEWS.ANSWER_REVIEW:
        setCurrentView(VIEWS.ANSWER_REVIEW);
        setActiveTab("admin-results");
        break;
      
      case VIEWS.PROCTORING_EVENTS:
        setCurrentView(VIEWS.PROCTORING_EVENTS);
        setActiveTab("admin-results");
        break;
      
      case VIEWS.INVITATIONS_MANAGER:
        setCurrentView(VIEWS.INVITATIONS_MANAGER);
        setActiveTab("tests");
        break;
      
      case VIEWS.INVITATION_ACCEPT:
        setCurrentView(VIEWS.INVITATION_ACCEPT);
        if (invitationToken) {
          window.location.hash = `/invitation/${invitationToken}`;
        }
        break;
      
      case VIEWS.AUTH:
        setCurrentView(VIEWS.AUTH);
        setActiveTab("dashboard");
        window.location.hash = "";
        break;
      
      default:
        console.warn("Unknown navigation view:", view);
        setCurrentView(VIEWS.DASHBOARD);
        setActiveTab("dashboard");
    }
  };

  const handleEditTest = (testId) => {
    setSelectedTestId(testId);
    setCurrentView(VIEWS.EDIT_TEST);
    setActiveTab("tests");
  };

  const showLogin = () => {
    setCurrentView(VIEWS.AUTH);
    setActiveTab("dashboard");
    window.location.hash = "";
  };

  if (currentView === VIEWS.LOADING) {
    return <LoadingScreen />;
  }

  // Show loading overlay while checking for active test
  if (checkingActiveTest) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Checking for active tests...</p>
        </div>
      </div>
    );
  }

  console.log("App render:", { currentView, activeTab, user: user?.role });

  return (
    <>
      {currentView === VIEWS.AUTH && <Auth onAuthSuccess={handleAuthSuccess} />}

      {currentView === VIEWS.INVITATION_ACCEPT && invitationToken && (
        <InvitationAccept
          token={invitationToken}
          onNavigate={handleNavigate}
          onLogin={showLogin}
        />
      )}

      {currentView === VIEWS.DASHBOARD && (
        <Dashboard
          user={user}
          token={token}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.CREATE_TEST && (
        <CreateTest
          user={user}
          token={token}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.EDIT_TEST && (
        <EditTest
          testId={selectedTestId}
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.ADMIN_RESULTS && (
        <AdminResults
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.TAKE_TEST && (
        <TakeTest
          user={user}
          token={token}
          testId={selectedTestId}
          invitationToken={invitationToken}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === VIEWS.VIEW_TEST && (
        <ViewTest
          testId={selectedTestId}
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onEdit={handleEditTest}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.TEST_RESULTS && (
        <TestResults
          testId={selectedTestId}
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.ANSWER_REVIEW && (
        <AnswerReview
          testId={selectedTestId}
          candidateId={selectedCandidateId}
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.PROCTORING_EVENTS && (
        <ProctoringEvents
          testId={selectedTestId}
          candidateId={selectedCandidateId}
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.QUESTION_TYPE_MANAGER && (
        <QuestionTypeManager
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {currentView === VIEWS.USER_MANAGEMENT && (
        <UserManagement
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      
      {currentView === VIEWS.INVITATIONS_MANAGER && (
        <InvitationsManagerView
          testId={selectedTestId}
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* 🆕 Added Question Bank view */}
      {currentView === VIEWS.QUESTION_BANK && (
        <QuestionBank
          token={token}
          user={user}
          onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
    </>
  );
}
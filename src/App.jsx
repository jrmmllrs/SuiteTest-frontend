import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard/Dashboard";
import CreateTest from "./components/CreateTest";
import EditTest from "./components/EditTest";
import TakeTest from "./components/TakeTest";
import AdminResults from "./components/AdminResults";
import ProctoringEvents from "./components/ProctoringEvents";
import InvitationAccept from "./components/AcceptInvitation";
import AnswerReview from "./components/ReviewAnswers";
import QuestionTypeManager from "./components/QuestionTypeManager";
import ViewTest from "./components/ViewTest";
import TestResults from "./components/TestResults";
import UserManagement from "./components/UserManagement";
import { VIEWS } from "./constants/views";
import { useAuth } from "./hooks/useAuth";
import { useInvitation } from "./hooks/useInvitation";
import LoadingScreen from "./components/LoadingScreen";

export default function App() {
  const [currentView, setCurrentView] = useState(VIEWS.LOADING);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const { user, token, login, logout, restoreSession } = useAuth();
  const { invitationToken, checkForInvitation, clearInvitation } =
    useInvitation();

  useEffect(() => {
    initializeApp();
  }, []);

  // Debug: Log state changes
  useEffect(() => {
    console.log("=== STATE CHANGED ===");
    console.log("currentView:", currentView);
    console.log("selectedTestId:", selectedTestId);
    console.log("selectedCandidateId:", selectedCandidateId);
    console.log("VIEWS.VIEW_TEST:", VIEWS.VIEW_TEST);
    console.log("Is VIEW_TEST?", currentView === VIEWS.VIEW_TEST);
    console.log("===================");
  }, [currentView, selectedTestId, selectedCandidateId]);

  const initializeApp = () => {
    const hasSession = restoreSession();
    const inviteToken = checkForInvitation();

    if (inviteToken) {
      setCurrentView(VIEWS.INVITATION_ACCEPT);
    } else if (hasSession) {
      setCurrentView(VIEWS.DASHBOARD);
    } else {
      setCurrentView(VIEWS.AUTH);
    }
  };

  const handleAuthSuccess = (userData, authToken) => {
    login(userData, authToken);

    if (invitationToken) {
      setCurrentView(VIEWS.INVITATION_ACCEPT);
    } else {
      setCurrentView(VIEWS.DASHBOARD);
    }
  };

  const handleLogout = () => {
    logout();
    clearInvitation();
    setSelectedTestId(null);
    setSelectedCandidateId(null);
    setCurrentView(VIEWS.AUTH);
  };

  const handleNavigate = (view, testId = null, candidateId = null) => {
    console.log("=== HANDLE NAVIGATE CALLED ===");
    console.log("Requested view:", view);
    console.log("Test ID:", testId);
    console.log("Candidate ID:", candidateId);
    console.log("============================");

    setCurrentView(view);
    setSelectedTestId(testId);
    setSelectedCandidateId(candidateId);

    if (view === VIEWS.INVITATION_ACCEPT && invitationToken) {
      window.location.hash = `/invitation/${invitationToken}`;
    } else if (view === VIEWS.AUTH) {
      window.location.hash = "";
    }
  };

  const handleEditTest = (testId) => {
    console.log("Edit test clicked:", testId);
    setSelectedTestId(testId);
    setCurrentView(VIEWS.EDIT_TEST);
  };

  const showLogin = () => {
    setCurrentView(VIEWS.AUTH);
    window.location.hash = "";
  };

  if (currentView === VIEWS.LOADING) {
    return <LoadingScreen />;
  }

  // Debug: Log before rendering
  console.log("About to render. CurrentView:", currentView);

  return (
    <>
      {currentView === VIEWS.AUTH && (
        <>
          {console.log("Rendering AUTH")}
          <Auth onAuthSuccess={handleAuthSuccess} />
        </>
      )}

      {currentView === VIEWS.INVITATION_ACCEPT && invitationToken && (
        <>
          {console.log("Rendering INVITATION_ACCEPT")}
          <InvitationAccept
            token={invitationToken}
            onNavigate={handleNavigate}
            onLogin={showLogin}
          />
        </>
      )}

      {currentView === VIEWS.DASHBOARD && (
        <>
          {console.log("Rendering DASHBOARD")}
          <Dashboard
            user={user}
            token={token}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        </>
      )}

      {currentView === VIEWS.CREATE_TEST && (
        <>
          {console.log("Rendering CREATE_TEST")}
          <CreateTest
            user={user}
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          />
        </>
      )}

      {currentView === VIEWS.EDIT_TEST && (
        <>
          {console.log("Rendering EDIT_TEST")}
          <EditTest
            testId={selectedTestId}
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          />
        </>
      )}

      {currentView === VIEWS.ADMIN_RESULTS && (
        <>
          {console.log("Rendering ADMIN_RESULTS")}
          <AdminResults
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
            onNavigate={handleNavigate}
          />
        </>
      )}

      {currentView === VIEWS.TAKE_TEST && (
        <>
          {console.log("Rendering TAKE_TEST")}
          <TakeTest
            user={user}
            token={token}
            testId={selectedTestId}
            invitationToken={invitationToken}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
            onNavigate={handleNavigate}
          />
        </>
      )}

      {currentView === VIEWS.VIEW_TEST && (
        <>
          {console.log("Rendering VIEW_TEST with testId:", selectedTestId)}
          <ViewTest
            testId={selectedTestId}
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
            onEdit={handleEditTest}
          />
        </>
      )}

      {currentView === VIEWS.TEST_RESULTS && (
        <>
          {console.log("Rendering TEST_RESULTS")}
          <TestResults
            testId={selectedTestId}
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
            onNavigate={handleNavigate}
          />
        </>
      )}

      {currentView === VIEWS.ANSWER_REVIEW && (
        <>
          {console.log("Rendering ANSWER_REVIEW")}
          <AnswerReview
            testId={selectedTestId}
            candidateId={selectedCandidateId}
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          />
        </>
      )}

      {currentView === VIEWS.PROCTORING_EVENTS && (
        <>
          {console.log("Rendering PROCTORING_EVENTS")}
          <ProctoringEvents
            testId={selectedTestId}
            candidateId={selectedCandidateId}
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          />
        </>
      )}

      {currentView === VIEWS.QUESTION_TYPE_MANAGER && (
        <>
          {console.log("Rendering QUESTION_TYPE_MANAGER")}
          <QuestionTypeManager
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          />
        </>
      )}

      {currentView === VIEWS.USER_MANAGEMENT && (
        <>
          {console.log("Rendering USER_MANAGEMENT")}
          <UserManagement
            token={token}
            onBack={() => handleNavigate(VIEWS.DASHBOARD)}
          />
        </>
      )}
    </>
  );
}
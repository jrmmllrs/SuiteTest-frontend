export const VIEWS = {
  LOADING: "loading",
  AUTH: "auth",
  DASHBOARD: "dashboard",
  CREATE_TEST: "create-test",
  EDIT_TEST: "edit-test",
  VIEW_TEST: "view-test",
  TAKE_TEST: "take-test",
  TEST_RESULTS: "test-results",
  ADMIN_RESULTS: "admin-results",
  ANSWER_REVIEW: "answer-review",
  PROCTORING_EVENTS: "proctoring-events",
  INVITATION_ACCEPT: "invitation-accept",
  QUESTION_TYPE_MANAGER: "question-type-manager",
  USER_MANAGEMENT: "user-management",
  INVITATIONS_MANAGER: 'invitations-manager',
  QUESTION_BANK: "question-bank",
  DEPARTMENT_MANAGEMENT: 'department-management' // 🆕 New view

};

// ⚠️ IMPORTANT: Your backend uses /api prefix for ALL routes
// So we need to include it in the base URL
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// This will create URLs like:
// http://localhost:5000/api/tests/1
// http://localhost:5000/api/auth/login
// etc.

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};

// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log("🔗 API Base URL:", API_BASE_URL);
  console.log("📝 Example endpoints:");
  console.log("  - Tests:", `${API_BASE_URL}/tests`);
  console.log("  - Auth:", `${API_BASE_URL}/auth/login`);
  console.log("  - Health:", `${API_BASE_URL}/health`);
}

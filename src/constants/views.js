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
  USER_MANAGEMENT: 'user-management', // ADD THIS LINE
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
};

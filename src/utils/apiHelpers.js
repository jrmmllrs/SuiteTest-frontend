import { API_BASE_URL } from "../constants/views";

/**
 * Base fetch wrapper with error handling
 */
export const apiFetch = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Fetch question types from the API
 */
export const fetchQuestionTypes = async (token) => {
  const response = await apiFetch("/api/question-types", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.success && response.data.success) {
    return response.data.questionTypes || [];
  }

  throw new Error("Failed to fetch question types");
};

/**
 * Fetch a specific test by ID
 */
export const fetchTest = async (testId, token) => {
  const response = await apiFetch(`/api/tests/${testId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.success && response.data.success) {
    return response.data.test;
  }

  throw new Error("Failed to fetch test");
};

/**
 * Create a new test
 */
export const createTest = async (testData, token) => {
  const response = await apiFetch("/api/tests/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(testData),
  });

  return response;
};

/**
 * Update an existing test
 */
export const updateTest = async (testId, testData, token) => {
  const response = await apiFetch(`/api/tests/${testId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(testData),
  });

  return response;
};

/**
 * Fetch test results
 */
export const fetchTestResults = async (testId, token) => {
  const response = await apiFetch(`/api/tests/${testId}/results`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.success && response.data.success) {
    return {
      results: response.data.results || [],
      test: response.data.test,
    };
  }

  throw new Error("Failed to fetch results");
};

/**
 * Send test invitations
 */
export const sendInvitations = async (testId, candidates, token) => {
  const response = await apiFetch("/api/invitations/send-invitation", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ testId, candidates }),
  });

  return response;
};

/**
 * Fetch invitations for a test
 */
export const fetchTestInvitations = async (testId, token) => {
  const response = await apiFetch(
    `/api/invitations/test/${testId}/invitations`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (response.success && response.data.success) {
    return response.data.invitations || [];
  }

  return [];
};

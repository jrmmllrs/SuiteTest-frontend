import { useState } from "react";
import { API_BASE_URL } from "../../../constants";

export function useTestImport(token, testData, questions, addQuestionsToList, setMessage) {
  const [showTestImport, setShowTestImport] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);

  const fetchAvailableTests = async () => {
    setLoadingTests(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tests/my-tests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        const questionBankTests = (data.tests || []).filter(
          (test) => test.department_name === "Question Bank"
        );
        setAvailableTests(questionBankTests);
      } else {
        setMessage({ type: "error", text: "Failed to load tests" });
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      setMessage({ type: "error", text: "Failed to load tests" });
    } finally {
      setLoadingTests(false);
    }
  };

  const fetchTestDetails = async (testId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) return data.test;
      return null;
    } catch (error) {
      console.error("Error fetching test details:", error);
      return null;
    }
  };

  const openTestImport = () => {
    setShowTestImport(true);
    fetchAvailableTests();
  };

  const closeTestImport = () => {
    setShowTestImport(false);
  };

  const importTest = async (test) => {
    const testDetails = await fetchTestDetails(test.id);

    if (!testDetails) {
      setMessage({ type: "error", text: "Failed to load test details" });
      return;
    }

    const importedQuestions = testDetails.questions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options || [],
      correct_answer: q.correct_answer || "",
      explanation: q.explanation || "",
    }));

    addQuestionsToList(importedQuestions);
    closeTestImport();

    setMessage({
      type: "success",
      text: `Imported ${importedQuestions.length} questions from "${testDetails.title}"`,
    });
  };

  return {
    showTestImport,
    availableTests,
    loadingTests,
    openTestImport,
    closeTestImport,
    importTest,
  };
}
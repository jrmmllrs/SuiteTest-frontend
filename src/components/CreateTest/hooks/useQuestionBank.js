import { useState } from "react";
import { API_BASE_URL } from "../../../constants";

export function useQuestionBank(token, questionTypes, addQuestionsToList, setMessage) {
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState(new Set());
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterTest, setFilterTest] = useState("all");

  const fetchAvailableQuestions = async () => {
    setLoadingQuestions(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/tests/questions/all?source=question-bank`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (data.success) {
        setAvailableQuestions(data.questions || []);
      } else {
        setMessage({ type: "error", text: "Failed to load question bank" });
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setMessage({ type: "error", text: "Failed to load question bank" });
    } finally {
      setLoadingQuestions(false);
    }
  };

  const openQuestionBank = () => {
    setShowQuestionBank(true);
    fetchAvailableQuestions();
  };

  const closeQuestionBank = () => {
    setShowQuestionBank(false);
    setSearchQuery("");
    setFilterType("all");
    setFilterTest("all");
  };

  const toggleQuestionSelection = (question) => {
    const newSelected = new Set(selectedQuestionIds);
    const questionId = `existing_${question.id}`;

    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestionIds(newSelected);
  };

  const addSelectedQuestions = () => {
    const questionsToAdd = availableQuestions
      .filter((q) => selectedQuestionIds.has(`existing_${q.id}`))
      .map((q) => ({
        ...q,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.options
          ? typeof q.options === "string"
            ? JSON.parse(q.options)
            : q.options
          : [],
        correct_answer: q.correct_answer || "",
        explanation: q.explanation || "",
        existing_id: q.id,
      }));

    addQuestionsToList(questionsToAdd);
    setSelectedQuestionIds(new Set());
    setShowQuestionBank(false);
    setMessage({
      type: "success",
      text: `Added ${questionsToAdd.length} question(s) from bank`,
    });
  };

  return {
    showQuestionBank,
    availableQuestions,
    selectedQuestionIds,
    loadingQuestions,
    searchQuery,
    filterType,
    filterTest,
    setSearchQuery,
    setFilterType,
    setFilterTest,
    openQuestionBank,
    closeQuestionBank,
    toggleQuestionSelection,
    addSelectedQuestions,
  };
}
import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { API_BASE_URL } from "../../constants";
import { NavBar } from "../ui/Navbar";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import TestDetailsForm from "./TestDetailsForm";
import QuestionsSection from "./QuestionsSection";
import QuestionBankModal from "./QuestionBankModal";
import TestImportModal from "./TestImportModal";
import { useTestForm } from "./hooks/useTestForm";
import { useQuestions } from "./hooks/useQuestions";
import { useQuestionBank } from "./hooks/useQuestionBank";
import { useTestImport } from "./hooks/useTestImport";

export default function CreateTest({ user, token, onBack }) {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    testData,
    questionTypes,
    departments,
    handleTestDataChange,
    handlePdfUrlChange,
    clearPdfAttachment,
  } = useTestForm(token);

  const {
    questions,
    currentQuestion,
    editingIndex,
    showQuestionForm,
    setShowQuestionForm,
    handleQuestionChange,
    handleQuestionTypeChange,
    handleOptionChange,
    addOption,
    removeOption,
    saveQuestion,
    editQuestion,
    deleteQuestion,
    cancelQuestionForm,
    addQuestionsToList,
  } = useQuestions(questionTypes, setMessage);

  const {
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
  } = useQuestionBank(token, questionTypes, addQuestionsToList, setMessage);

  const {
    showTestImport,
    availableTests,
    loadingTests,
    openTestImport,
    closeTestImport,
    importTest,
  } = useTestImport(token, testData, questions, addQuestionsToList, setMessage);

  useEffect(() => {
    const initData = async () => {
      setLoading(false);
    };
    initData();
  }, []);

  const saveTest = async () => {
    if (!testData.title.trim()) {
      setMessage({ type: "error", text: "Test title is required" });
      return;
    }

    if (questions.length === 0) {
      setMessage({ type: "error", text: "At least one question is required" });
      return;
    }

    if (testData.test_type === "pdf_based" && !testData.pdf_url.trim()) {
      setMessage({
        type: "error",
        text: "PDF URL is required for PDF-based tests",
      });
      return;
    }

    if (testData.target_role === "candidate" && !testData.department_id) {
      setMessage({
        type: "error",
        text: "Department is required for candidate tests",
      });
      return;
    }

    setSaving(true);

    try {
      const testPayload = {
        title: testData.title,
        description: testData.description,
        time_limit: testData.time_limit,
        pdf_url: testData.pdf_url || null,
        google_drive_id: testData.google_drive_id || null,
        thumbnail_url: testData.thumbnail_url || null,
        test_type: testData.test_type,
        target_role: testData.target_role,
        department_id: testData.department_id || null,
        questions: questions.map((q) => {
          const questionType = questionTypes.find(
            (t) => t.type_key === q.question_type
          );
          return {
            ...q,
            options: questionType?.requires_options
              ? JSON.stringify(q.options.filter((opt) => opt.trim() !== ""))
              : null,
            explanation: q.explanation || null,
          };
        }),
      };

      const response = await fetch(`${API_BASE_URL}/tests/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testPayload),
      });

      const data = await response.json();

      if (!data.success) {
        setMessage({
          type: "error",
          text: data.message || "Failed to create test",
        });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: "Test created successfully!" });

      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text: "Failed to create test. Please try again.",
      });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title="Create New Test" user={user} onBack={onBack} />

      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage({ type: "", text: "" })}
          />

          <TestDetailsForm
            testData={testData}
            departments={departments}
            handleTestDataChange={handleTestDataChange}
            handlePdfUrlChange={handlePdfUrlChange}
            clearPdfAttachment={clearPdfAttachment}
          />

          <QuestionsSection
            questions={questions}
            currentQuestion={currentQuestion}
            editingIndex={editingIndex}
            showQuestionForm={showQuestionForm}
            questionTypes={questionTypes}
            onShowQuestionForm={setShowQuestionForm}
            onOpenQuestionBank={openQuestionBank}
            onOpenTestImport={openTestImport}
            onQuestionChange={handleQuestionChange}
            onQuestionTypeChange={handleQuestionTypeChange}
            onOptionChange={handleOptionChange}
            onAddOption={addOption}
            onRemoveOption={removeOption}
            onSaveQuestion={saveQuestion}
            onCancelQuestion={cancelQuestionForm}
            onEditQuestion={editQuestion}
            onDeleteQuestion={deleteQuestion}
          />

          <div className="flex justify-end gap-4">
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={saveTest}
              disabled={saving}
              icon={Save}
            >
              {saving ? "Saving..." : "Create Test"}
            </Button>
          </div>
        </div>
      </div>

      <QuestionBankModal
        show={showQuestionBank}
        availableQuestions={availableQuestions}
        selectedQuestionIds={selectedQuestionIds}
        loadingQuestions={loadingQuestions}
        searchQuery={searchQuery}
        filterType={filterType}
        filterTest={filterTest}
        questionTypes={questionTypes}
        onClose={closeQuestionBank}
        onSearchChange={setSearchQuery}
        onFilterTypeChange={setFilterType}
        onFilterTestChange={setFilterTest}
        onToggleSelection={toggleQuestionSelection}
        onAddSelected={addSelectedQuestions}
      />

      <TestImportModal
        show={showTestImport}
        availableTests={availableTests}
        loadingTests={loadingTests}
        onClose={closeTestImport}
        onImport={importTest}
      />
    </div>
  );
}
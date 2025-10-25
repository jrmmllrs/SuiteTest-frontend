import React, { useState, useEffect } from "react";
import { Save, Sparkles, Target, CheckCircle, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "../constants";
import { NavBar } from "./ui/Navbar";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import TestDetailsForm from "./CreateTest/TestDetailsForm";
import QuestionsSection from "./CreateTest/QuestionsSection";
import QuestionBankModal from "./CreateTest/QuestionBankModal";
import TestImportModal from "./CreateTest/TestImportModal";
import { useTestForm } from "./CreateTest/hooks/useTestForm";
import { useQuestions } from "./CreateTest/hooks/useQuestions";
import { useQuestionBank } from "./CreateTest/hooks/useQuestionBank";
import { useTestImport } from "./CreateTest/hooks/useTestImport";

export default function EditTest({ testId, user, token, onBack }) {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  const {
    testData,
    setTestData,
    questionTypes,
    departments,
    handleTestDataChange,
    handlePdfUrlChange,
    clearPdfAttachment,
  } = useTestForm(token);

  const {
    questions,
    setQuestions,
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
    const fetchTestData = async () => {
      try {
        setLoading(true);
        
        const testResponse = await fetch(`${API_BASE_URL}/tests/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const testData = await testResponse.json();
        
        if (testData.success) {
          const test = testData.test;
          
          // Set test data
          setTestData({
            title: test.title || "",
            description: test.description || "",
            time_limit: test.time_limit || 30,
            pdf_url: test.pdf_url || "",
            google_drive_id: test.google_drive_id || "",
            thumbnail_url: test.thumbnail_url || "",
            test_type: test.test_type || "standard",
            target_role: test.target_role || "candidate",
            department_id: test.department_id || "",
          });

          // Set questions
          if (test.questions && Array.isArray(test.questions)) {
            const normalizedQuestions = test.questions.map(q => ({
              question_text: q.question_text || "",
              question_type: q.question_type || "multiple_choice",
              options: Array.isArray(q.options) ? q.options : (q.options ? JSON.parse(q.options) : []),
              correct_answer: q.correct_answer || "",
              explanation: q.explanation || "",
            }));
            setQuestions(normalizedQuestions);
          }
        } else {
          setMessage({ type: "error", text: "Failed to load test" });
        }
      } catch (error) {
        console.error("Error fetching test:", error);
        setMessage({ type: "error", text: "Failed to load test" });
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [testId, token, setTestData, setQuestions]);

  const updateTest = async () => {
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

      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: "PUT",
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
          text: data.message || "Failed to update test",
        });
        setSaving(false);
        return;
      }

      setMessage({ type: "success", text: "Test updated successfully!" });

      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        type: "error",
        text: "Failed to update test. Please try again.",
      });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#0697b2] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading test...</p>
        </div>
      </div>
    );
  }

  const canProceedToQuestions = testData.title.trim() && testData.time_limit > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title="Edit Test" user={user} onBack={onBack} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                activeStep === 1 
                  ? 'bg-[#0697b2] text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                1
              </div>
              <span className={`font-medium ${activeStep === 1 ? 'text-[#0697b2]' : 'text-gray-600'}`}>
                Test Details
              </span>
            </div>
            
            <div className="w-12 h-0.5 bg-gray-200"></div>
            
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                activeStep === 2 
                  ? 'bg-[#0697b2] text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                2
              </div>
              <span className={`font-medium ${activeStep === 2 ? 'text-[#0697b2]' : 'text-gray-600'}`}>
                Questions ({questions.length})
              </span>
            </div>
          </div>
        </div>

        <Alert
          type={message.type}
          message={message.text}
          onClose={() => setMessage({ type: "", text: "" })}
        />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {activeStep === 1 ? (
              <TestDetailsForm
                testData={testData}
                departments={departments}
                handleTestDataChange={handleTestDataChange}
                handlePdfUrlChange={handlePdfUrlChange}
                clearPdfAttachment={clearPdfAttachment}
                onNext={() => setActiveStep(2)}
                canProceed={canProceedToQuestions}
              />
            ) : (
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
                onBack={() => setActiveStep(1)}
              />
            )}
          </div>

          {/* Sidebar - Compact */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-[#0697b2]" />
                Quick Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions</span>
                  <span className="font-semibold">{questions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Limit</span>
                  <span className="font-semibold">{testData.time_limit}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold capitalize">{testData.test_type}</span>
                </div>
              </div>
            </div>

            {/* Progress Check */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Ready Check</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className={testData.title ? "text-green-500" : "text-gray-300"} />
                  <span className={testData.title ? "text-gray-700" : "text-gray-400"}>Test title</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className={questions.length > 0 ? "text-green-500" : "text-gray-300"} />
                  <span className={questions.length > 0 ? "text-gray-700" : "text-gray-400"}>At least 1 question</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className={testData.time_limit > 0 ? "text-green-500" : "text-gray-300"} />
                  <span className={testData.time_limit > 0 ? "text-gray-700" : "text-gray-400"}>Time limit set</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <Button
                variant="success"
                onClick={updateTest}
                disabled={saving || questions.length === 0}
                icon={Save}
                className="w-full justify-center mb-3"
                size="sm"
              >
                {saving ? "Updating..." : "Update Test"}
              </Button>
              <Button
                variant="secondary"
                onClick={onBack}
                disabled={saving}
                className="w-full justify-center"
                size="sm"
              >
                Cancel
              </Button>
            </div>
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
import React, { useState, useEffect } from "react";
import { Plus, Save, Upload, FileText, X, ExternalLink } from "lucide-react";
import { API_BASE_URL } from "../constants";
import { NavBar } from "./ui/Navbar";
import { Alert } from "./ui/Alert";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { TextArea } from "./ui/TextArea";
import QuestionForm from "./QuestionForm";
import QuestionPreview from "./QuestionPreview";

export default function CreateTest({ user, token, onBack }) {
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    time_limit: 30,
    pdf_url: "",
    google_drive_id: "",
    thumbnail_url: "",
    test_type: "standard",
    target_role: "candidate",
    department_id: "",
  });
  const [questions, setQuestions] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: "",
    question_type: "multiple_choice",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch question types
      const qTypesResponse = await fetch(`${API_BASE_URL}/question-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const qTypesData = await qTypesResponse.json();
      if (qTypesData.success) {
        setQuestionTypes(qTypesData.questionTypes);
        if (qTypesData.questionTypes.length > 0) {
          const defaultType = qTypesData.questionTypes[0];
          setCurrentQuestion((prev) => ({
            ...prev,
            question_type: defaultType.type_key,
            options: defaultType.requires_options
              ? defaultType.type_key === "true_false"
                ? ["True", "False"]
                : ["", "", "", ""]
              : [],
          }));
        }
      }

      // Fetch departments
      const deptResponse = await fetch(`${API_BASE_URL}/users/departments`);
      const deptData = await deptResponse.json();
      if (deptData.success) {
        setDepartments(deptData.departments);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      setMessage({ type: "error", text: "Failed to load question types or departments" });
    } finally {
      setLoading(false);
    }
  };

  const handleTestDataChange = (e) => {
    setTestData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const extractDriveId = (url) => {
    if (!url) return "";
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /^([a-zA-Z0-9_-]{25,})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  const handlePdfUrlChange = (e) => {
    const url = e.target.value;
    const driveId = extractDriveId(url);
    
    setTestData((prev) => ({
      ...prev,
      pdf_url: url,
      google_drive_id: driveId,
      thumbnail_url: driveId ? `https://drive.google.com/thumbnail?id=${driveId}` : "",
    }));
  };

  const clearPdfAttachment = () => {
    setTestData((prev) => ({
      ...prev,
      pdf_url: "",
      google_drive_id: "",
      thumbnail_url: "",
    }));
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const handleQuestionTypeChange = (e) => {
    const type = e.target.value;
    const selectedType = questionTypes.find((t) => t.type_key === type);
    let newQuestion = { ...currentQuestion, question_type: type };

    if (selectedType?.requires_options) {
      if (type === "true_false") {
        newQuestion.options = ["True", "False"];
      } else if (currentQuestion.options.length < 2) {
        newQuestion.options = ["", "", "", ""];
      }
    } else {
      newQuestion.options = [];
    }

    if (!selectedType?.requires_correct_answer) {
      newQuestion.correct_answer = "";
    }

    setCurrentQuestion(newQuestion);
  };

  const saveQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      setMessage({ type: "error", text: "Question text is required" });
      return;
    }

    const selectedType = questionTypes.find(
      (t) => t.type_key === currentQuestion.question_type
    );

    if (selectedType?.requires_options) {
      const filledOptions = currentQuestion.options.filter(
        (opt) => opt.trim() !== ""
      );
      if (filledOptions.length < 2) {
        setMessage({ type: "error", text: "At least 2 options are required" });
        return;
      }
    }

    if (
      selectedType?.requires_correct_answer &&
      !currentQuestion.correct_answer
    ) {
      setMessage({ type: "error", text: "Please select the correct answer" });
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQuestion;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, currentQuestion]);
    }

    const defaultType = questionTypes[0];
    setCurrentQuestion({
      question_text: "",
      question_type: defaultType?.type_key || "multiple_choice",
      options: defaultType?.requires_options
        ? defaultType.type_key === "true_false"
          ? ["True", "False"]
          : ["", "", "", ""]
        : [],
      correct_answer: "",
      explanation: "",
    });
    setShowQuestionForm(false);
    setMessage({ type: "success", text: "Question saved!" });
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    setShowQuestionForm(true);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setMessage({ type: "success", text: "Question deleted!" });
  };

  const cancelQuestionForm = () => {
    const defaultType = questionTypes[0];
    setCurrentQuestion({
      question_text: "",
      question_type: defaultType?.type_key || "multiple_choice",
      options: defaultType?.requires_options
        ? defaultType.type_key === "true_false"
          ? ["True", "False"]
          : ["", "", "", ""]
        : [],
      correct_answer: "",
      explanation: "",
    });
    setEditingIndex(null);
    setShowQuestionForm(false);
  };

  const saveTest = async () => {
    if (!testData.title.trim()) {
      setMessage({ type: "error", text: "Test title is required" });
      return;
    }

    if (questions.length === 0) {
      setMessage({ type: "error", text: "At least one question is required" });
      return;
    }

    if (testData.test_type === 'pdf_based' && !testData.pdf_url.trim()) {
      setMessage({ type: "error", text: "PDF URL is required for PDF-based tests" });
      return;
    }

    if (testData.target_role === 'candidate' && !testData.department_id) {
      setMessage({ type: "error", text: "Department is required for candidate tests" });
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
        setTestData({ 
          title: "", 
          description: "", 
          time_limit: 30,
          pdf_url: "",
          google_drive_id: "",
          thumbnail_url: "",
          test_type: "standard",
          target_role: "candidate",
          department_id: "",
        });
        setQuestions([]);
        setMessage({ type: "", text: "" });
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <Alert
              type={message.type}
              message={message.text}
              onClose={() => setMessage({ type: "", text: "" })}
            />

            <div className="space-y-4">
              <Input
                label="Test Title *"
                type="text"
                name="title"
                value={testData.title}
                onChange={handleTestDataChange}
                placeholder="e.g., JavaScript Developer Assessment"
              />

              <TextArea
                label="Description"
                name="description"
                value={testData.description}
                onChange={handleTestDataChange}
                rows="4"
                placeholder="Describe what this test covers..."
              />

              <Input
                label="Time Limit (minutes)"
                type="number"
                name="time_limit"
                value={testData.time_limit}
                onChange={handleTestDataChange}
                min="1"
              />

              {/* Test Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Type
                </label>
                <select
                  name="test_type"
                  value={testData.test_type}
                  onChange={handleTestDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="standard">Standard Test</option>
                  <option value="pdf_based">PDF-Based Test</option>
                </select>
              </div>

              {/* Target Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  name="target_role"
                  value={testData.target_role}
                  onChange={handleTestDataChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="candidate">Candidates</option>
                  <option value="employer">Employers/Staff</option>
                </select>
              </div>

              {/* Department Selection (only for candidate tests) */}
              {testData.target_role === 'candidate' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    name="department_id"
                    value={testData.department_id}
                    onChange={handleTestDataChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department_name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This test will only be visible to candidates in the selected department
                  </p>
                </div>
              )}

              {/* PDF Upload Section */}
              {testData.test_type === "pdf_based" && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Upload className="text-blue-600" size={20} />
                    <h3 className="font-semibold text-gray-900">PDF Attachment</h3>
                  </div>

                  {!testData.pdf_url ? (
                    <div>
                      <Input
                        label="Google Drive URL or File ID"
                        type="text"
                        name="pdf_url"
                        value={testData.pdf_url}
                        onChange={handlePdfUrlChange}
                        placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view or just the FILE_ID"
                      />
                      <div className="mt-2 text-xs text-gray-600 space-y-1">
                        <p>• Paste the Google Drive sharing link</p>
                        <p>• Or just paste the file ID</p>
                        <p>• Make sure the file is set to "Anyone with the link can view"</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                        <div className="flex items-center gap-3">
                          <FileText className="text-blue-600" size={24} />
                          <div>
                            <p className="font-medium text-sm text-gray-900">PDF Attached</p>
                            <p className="text-xs text-gray-500">ID: {testData.google_drive_id}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <a
                            href={`https://drive.google.com/file/d/${testData.google_drive_id}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 p-1"
                          >
                            <ExternalLink size={18} />
                          </a>
                          <button
                            onClick={clearPdfAttachment}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Questions ({questions.length})
              </h2>
              {!showQuestionForm && (
                <Button onClick={() => setShowQuestionForm(true)} icon={Plus}>
                  Add Question
                </Button>
              )}
            </div>

            {showQuestionForm && (
              <QuestionForm
                currentQuestion={currentQuestion}
                editingIndex={editingIndex}
                onQuestionChange={handleQuestionChange}
                onQuestionTypeChange={handleQuestionTypeChange}
                onOptionChange={handleOptionChange}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onSave={saveQuestion}
                onCancel={cancelQuestionForm}
                questionTypes={questionTypes}
              />
            )}

            {questions.length > 0 && (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <QuestionPreview
                    key={index}
                    question={question}
                    index={index}
                    onEdit={() => editQuestion(index)}
                    onDelete={() => deleteQuestion(index)}
                    questionTypes={questionTypes}
                  />
                ))}
              </div>
            )}
          </div>

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
    </div>
  );
}
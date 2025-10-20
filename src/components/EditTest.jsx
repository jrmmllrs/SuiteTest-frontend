import React, { useState, useEffect } from "react";
import { Upload, FileText, X, ExternalLink } from "lucide-react";

export default function EditTest({ testId, token, onBack }) {
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  
  const [test, setTest] = useState({
    title: "",
    description: "",
    time_limit: 30,
    pdf_url: "",
    google_drive_id: "",
    thumbnail_url: "",
    test_type: "standard",
    target_role: "candidate",
    department_id: "",
    questions: [],
  });
  const [questionTypes, setQuestionTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchQuestionTypes();
    fetchDepartments();
    fetchTest();
  }, [testId]);

  const fetchQuestionTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/question-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.questionTypes && data.questionTypes.length > 0) {
        setQuestionTypes(data.questionTypes);
      } else {
        console.warn("No question types from API, using defaults");
        setQuestionTypes([
          {
            id: 1,
            type_key: "multiple_choice",
            display_name: "Multiple Choice",
            requires_options: true,
            requires_correct_answer: true
          },
          {
            id: 2,
            type_key: "short_answer",
            display_name: "Short Answer",
            requires_options: false,
            requires_correct_answer: true
          },
          {
            id: 3,
            type_key: "true_false",
            display_name: "True/False",
            requires_options: true,
            requires_correct_answer: true
          }
        ]);
      }
    } catch (error) {
      console.error("Error fetching question types:", error);
      setQuestionTypes([
        {
          id: 1,
          type_key: "multiple_choice",
          display_name: "Multiple Choice",
          requires_options: true,
          requires_correct_answer: true
        },
        {
          id: 2,
          type_key: "short_answer",
          display_name: "Short Answer",
          requires_options: false,
          requires_correct_answer: true
        }
      ]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/departments`);
      const data = await response.json();
      if (data.success) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchTest = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      if (data.success) {
        const normalizedTest = {
          ...data.test,
          description: data.test.description || "",
          pdf_url: data.test.pdf_url || "",
          google_drive_id: data.test.google_drive_id || "",
          thumbnail_url: data.test.thumbnail_url || "",
          test_type: data.test.test_type || "standard",
          target_role: data.test.target_role || "candidate",
          department_id: data.test.department_id || "",
          questions: data.test.questions.map(q => ({
            ...q,
            question_type: q.question_type || "multiple_choice",
            question_text: q.question_text || "",
            options: Array.isArray(q.options) ? q.options : [],
            correct_answer: q.correct_answer || "",
            explanation: q.explanation || "",
          }))
        };
        setTest(normalizedTest);
      } else {
        setError("Failed to load test");
      }
    } catch (error) {
      console.error("Error fetching test:", error);
      setError("Failed to load test");
    } finally {
      setLoading(false);
    }
  };

  const getQuestionType = (typeKey) => {
    return questionTypes.find(t => t.type_key === typeKey);
  };

  const handleTestInfoChange = (field, value) => {
    setTest((prev) => ({ ...prev, [field]: value || "" }));
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
    
    setTest((prev) => ({
      ...prev,
      pdf_url: url,
      google_drive_id: driveId,
      thumbnail_url: driveId ? `https://drive.google.com/thumbnail?id=${driveId}` : "",
    }));
  };

  const clearPdfAttachment = () => {
    setTest((prev) => ({
      ...prev,
      pdf_url: "",
      google_drive_id: "",
      thumbnail_url: "",
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value || "",
    };
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleQuestionTypeChange = (index, newType) => {
    const updatedQuestions = [...test.questions];
    const question = updatedQuestions[index];
    const selectedType = getQuestionType(newType);
    
    let newQuestion = {
      ...question,
      question_type: newType,
      correct_answer: "",
    };

    if (selectedType?.requires_options) {
      if (newType === "true_false") {
        newQuestion.options = ["True", "False"];
      } else if (!question.options || question.options.length < 2) {
        newQuestion.options = ["", "", "", ""];
      }
    } else {
      newQuestion.options = [];
    }
    
    updatedQuestions[index] = newQuestion;
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...test.questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value || "";
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options,
    };
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const addQuestion = () => {
    const defaultType = questionTypes[0] || { type_key: "multiple_choice", requires_options: true };
    const newQuestion = {
      question_text: "",
      question_type: defaultType.type_key,
      options: defaultType.requires_options 
        ? (defaultType.type_key === "true_false" ? ["True", "False"] : ["", "", "", ""])
        : [],
      correct_answer: "",
      explanation: "",
    };
    setTest((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const removeQuestion = (index) => {
    const updatedQuestions = test.questions.filter((_, i) => i !== index);
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...test.questions];
    updatedQuestions[questionIndex].options.push("");
    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...test.questions];
    const question = updatedQuestions[questionIndex];

    if (question.options.length <= 2) {
      setError("A question must have at least 2 options");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const removedOption = question.options[optionIndex];
    question.options = question.options.filter((_, i) => i !== optionIndex);

    if (question.correct_answer === removedOption) {
      question.correct_answer = "";
    }

    setTest((prev) => ({ ...prev, questions: updatedQuestions }));
  };

  const validateTest = () => {
    if (!test.title.trim()) {
      setError("Test title is required");
      return false;
    }

    if (test.time_limit < 1) {
      setError("Time limit must be at least 1 minute");
      return false;
    }

    if (test.test_type === 'pdf_based' && !test.pdf_url.trim()) {
      setError("PDF URL is required for PDF-based tests");
      return false;
    }

    if (test.target_role === 'candidate' && !test.department_id) {
      setError("Department is required for candidate tests");
      return false;
    }

    if (test.questions.length === 0) {
      setError("Add at least one question");
      return false;
    }

    for (let i = 0; i < test.questions.length; i++) {
      const q = test.questions[i];
      const questionType = getQuestionType(q.question_type);

      if (!q.question_text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      if (questionType?.requires_options) {
        const validOptions = q.options.filter((opt) => opt.trim() !== "");
        if (validOptions.length < 2) {
          setError(`Question ${i + 1} must have at least 2 options`);
          return false;
        }
      }

      if (questionType?.requires_correct_answer) {
        if (!q.correct_answer || !q.correct_answer.trim()) {
          setError(`Question ${i + 1} must have a correct answer`);
          return false;
        }

        if (questionType?.requires_options && !q.options.includes(q.correct_answer)) {
          setError(`Question ${i + 1} correct answer must match one of the options`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!validateTest()) {
      return;
    }

    setSaving(true);

    try {
      const cleanedQuestions = test.questions.map((q) => {
        const questionType = getQuestionType(q.question_type);
        return {
          ...q,
          options: questionType?.requires_options
            ? q.options.filter((opt) => opt.trim() !== "")
            : [],
        };
      });

      const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: test.title,
          description: test.description,
          time_limit: test.time_limit,
          pdf_url: test.pdf_url || null,
          google_drive_id: test.google_drive_id || null,
          thumbnail_url: test.thumbnail_url || null,
          test_type: test.test_type,
          target_role: test.target_role,
          department_id: test.department_id || null,
          questions: cleanedQuestions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Test updated successfully!");
        setTimeout(() => {
          onBack();
        }, 1500);
      } else {
        setError(data.message || "Failed to update test");
      }
    } catch (error) {
      console.error("Error updating test:", error);
      setError("Failed to update test. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Edit Test</h1>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Information</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Title *
            </label>
            <input
              type="text"
              value={test.title}
              onChange={(e) => handleTestInfoChange("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={test.description}
              onChange={(e) =>
                handleTestInfoChange("description", e.target.value)
              }
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test description"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (minutes) *
            </label>
            <input
              type="number"
              value={test.time_limit}
              onChange={(e) =>
                handleTestInfoChange(
                  "time_limit",
                  parseInt(e.target.value) || 1
                )
              }
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Type
            </label>
            <select
              value={test.test_type}
              onChange={(e) => handleTestInfoChange("test_type", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="standard">Standard Test</option>
              <option value="pdf_based">PDF-Based Test</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              value={test.target_role}
              onChange={(e) => handleTestInfoChange("target_role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="candidate">Candidates</option>
              <option value="employer">Employers/Staff</option>
            </select>
          </div>

          {test.target_role === 'candidate' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                value={test.department_id}
                onChange={(e) => handleTestInfoChange("department_id", e.target.value)}
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

          {test.test_type === "pdf_based" && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <Upload className="text-blue-600" size={20} />
                <h3 className="font-semibold text-gray-900">PDF Attachment</h3>
              </div>

              {!test.pdf_url ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Drive URL or File ID
                  </label>
                  <input
                    type="text"
                    value={test.pdf_url}
                    onChange={handlePdfUrlChange}
                    placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view or just the FILE_ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                        <p className="text-xs text-gray-500">ID: {test.google_drive_id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`https://drive.google.com/file/d/${test.google_drive_id}/view`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Preview PDF"
                      >
                        <ExternalLink size={18} />
                      </a>
                      <button
                        onClick={clearPdfAttachment}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove PDF"
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

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              onClick={addQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              + Add Question
            </button>
          </div>

          {test.questions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-600">
                No questions yet. Add your first question!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {test.questions.map((question, qIndex) => {
                const questionType = getQuestionType(question.question_type);
                const requiresOptions = questionType?.requires_options;
                const requiresCorrectAnswer = questionType?.requires_correct_answer;

                return (
                  <div
                    key={qIndex}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-lg">
                        Question {qIndex + 1}
                      </h3>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type *
                      </label>
                      <select
                        value={question.question_type}
                        onChange={(e) =>
                          handleQuestionTypeChange(qIndex, e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {questionTypes.length === 0 ? (
                          <option value="">Loading question types...</option>
                        ) : (
                          questionTypes.map((type) => (
                            <option key={type.id} value={type.type_key}>
                              {type.display_name || type.type_name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text *
                      </label>
                      <textarea
                        value={question.question_text}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "question_text",
                            e.target.value
                          )
                        }
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter question text"
                      />
                    </div>

                    {requiresOptions ? (
                      <>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Options * (at least 2)
                            </label>
                            {question.question_type !== "true_false" && (
                              <button
                                onClick={() => addOption(qIndex)}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                + Add Option
                              </button>
                            )}
                          </div>
                          <div className="space-y-2">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600 w-6">
                                  {String.fromCharCode(65 + oIndex)}.
                                </span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) =>
                                    handleOptionChange(qIndex, oIndex, e.target.value)
                                  }
                                  disabled={question.question_type === "true_false"}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                />
                                {question.options.length > 2 && question.question_type !== "true_false" && (
                                  <button
                                    onClick={() => removeOption(qIndex, oIndex)}
                                    className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {requiresCorrectAnswer && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Correct Answer *
                            </label>
                            <select
                              value={question.correct_answer}
                              onChange={(e) =>
                                handleQuestionChange(
                                  qIndex,
                                  "correct_answer",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select correct answer</option>
                              {question.options
                                .filter((opt) => opt.trim() !== "")
                                .map((option, oIndex) => (
                                  <option key={oIndex} value={option}>
                                    {String.fromCharCode(65 + oIndex)}. {option}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}
                      </>
                    ) : requiresCorrectAnswer ? (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Correct Answer *
                        </label>
                        <input
                          type="text"
                          value={question.correct_answer}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIndex,
                              "correct_answer",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter the correct answer"
                        />
                      </div>
                    ) : null}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Explanation (Optional)
                      </label>
                      <textarea
                        value={question.explanation}
                        onChange={(e) =>
                          handleQuestionChange(
                            qIndex,
                            "explanation",
                            e.target.value
                          )
                        }
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Explain why this is the correct answer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onBack}
            disabled={saving}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
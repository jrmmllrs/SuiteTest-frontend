import React, { useMemo } from "react";
import { X, FileText } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export default function QuestionBankModal({
  show,
  availableQuestions,
  selectedQuestionIds,
  loadingQuestions,
  searchQuery,
  filterType,
  filterTest,
  questionTypes,
  onClose,
  onSearchChange,
  onFilterTypeChange,
  onFilterTestChange,
  onToggleSelection,
  onAddSelected,
}) {
  const filteredQuestions = useMemo(() => {
    return availableQuestions.filter((q) => {
      const matchesSearch = q.question_text
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || q.question_type === filterType;
      const matchesTest =
        filterTest === "all" || String(q.test_id) === String(filterTest);
      return matchesSearch && matchesType && matchesTest;
    });
  }, [availableQuestions, searchQuery, filterType, filterTest]);

  const uniqueTests = useMemo(() => {
    return availableQuestions
      .filter((q) => q.test_title && q.test_id)
      .reduce((acc, q) => {
        const existing = acc.find((t) => t.id === q.test_id);
        if (!existing) {
          acc.push({ id: q.test_id, title: q.test_title });
        }
        return acc;
      }, [])
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [availableQuestions]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Question Bank</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1"
            />
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {questionTypes.map((type) => (
                <option key={type.type_key} value={type.type_key}>
                  {type.type_name}
                </option>
              ))}
            </select>
            <select
              value={filterTest}
              onChange={(e) => onFilterTestChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
            >
              <option value="all">All Tests</option>
              {uniqueTests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 text-sm text-gray-600">
            {selectedQuestionIds.size} question(s) selected
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadingQuestions ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || filterType !== "all" || filterTest !== "all"
                ? "No questions found matching your filters"
                : "No questions available in your department's question bank"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question) => {
                const isSelected = selectedQuestionIds.has(
                  `existing_${question.id}`
                );
                const qType = questionTypes.find(
                  (t) => t.type_key === question.question_type
                );
                const options = question.options
                  ? typeof question.options === "string"
                    ? JSON.parse(question.options)
                    : question.options
                  : [];

                return (
                  <div
                    key={question.id}
                    onClick={() => onToggleSelection(question)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded">
                            {qType?.type_name || question.question_type}
                          </span>
                          {question.test_title && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded flex items-center gap-1">
                              <FileText size={12} />
                              <span className="font-medium">Test:</span>{" "}
                              {question.test_title}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 mb-2">
                          {question.question_text}
                        </p>
                        {options.length > 0 && (
                          <div className="space-y-1">
                            {options.map((option, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-600 flex items-center gap-2"
                              >
                                <span className="font-medium">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                <span>{option}</span>
                                {question.correct_answer === option && (
                                  <span className="text-green-600 text-xs">
                                    (Correct)
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onAddSelected}
            disabled={selectedQuestionIds.size === 0}
          >
            Add{" "}
            {selectedQuestionIds.size > 0 ? `${selectedQuestionIds.size} ` : ""}
            Question(s)
          </Button>
        </div>
      </div>
    </div>
  );
}
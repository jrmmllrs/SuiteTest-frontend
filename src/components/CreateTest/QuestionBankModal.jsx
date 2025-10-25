import React, { useMemo } from "react";
import { X, FileText, Search, Filter, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";

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
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Question Bank</h2>
              <p className="text-sm text-gray-600 mt-1">Select questions to add to your test</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent text-sm"
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
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent text-sm min-w-[150px]"
            >
              <option value="all">All Tests</option>
              {uniqueTests.map((test) => (
                <option key={test.id} value={test.id}>
                  {test.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-3 text-sm text-gray-600 flex items-center gap-4">
            <span>{filteredQuestions.length} questions found</span>
            <span className="flex items-center gap-1">
              <CheckCircle size={14} />
              {selectedQuestionIds.size} selected
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingQuestions ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery || filterType !== "all" || filterTest !== "all"
                ? "No questions found matching your filters"
                : "No questions available in your question bank"}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((question) => {
                const isSelected = selectedQuestionIds.has(`existing_${question.id}`);
                const qType = questionTypes.find(t => t.type_key === question.question_type);
                const options = question.options
                  ? typeof question.options === "string"
                    ? JSON.parse(question.options)
                    : question.options
                  : [];

                return (
                  <div
                    key={question.id}
                    onClick={() => onToggleSelection(question)}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      isSelected
                        ? "border-[#0697b2] bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
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
                              <FileText size={10} />
                              {question.test_title}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-900 mb-2 text-sm">
                          {question.question_text}
                        </p>
                        {options.length > 0 && (
                          <div className="space-y-1 text-xs text-gray-600">
                            {options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="font-medium">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                <span className={question.correct_answer === option ? "text-green-600 font-medium" : ""}>
                                  {option}
                                  {question.correct_answer === option && " ✓"}
                                </span>
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {selectedQuestionIds.size} questions selected
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button
              onClick={onAddSelected}
              disabled={selectedQuestionIds.size === 0}
              size="sm"
            >
              Add Selected
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
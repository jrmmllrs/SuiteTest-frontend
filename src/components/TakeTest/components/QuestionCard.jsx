import React from "react";

export function QuestionCard({
  question,
  index,
  answer,
  onAnswerChange,
  questionTypes = [],
}) {
  const questionType = questionTypes.find(
    (qt) => qt.type_key === question.question_type
  );
  const requiresOptions = questionType?.requires_options || false;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded">
          Q{index + 1}
        </span>
        <div className="flex-1">
          <p className="text-gray-900 font-medium">{question.question_text}</p>
          {questionType && (
            <span className="inline-block mt-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {questionType.type_name}
            </span>
          )}
        </div>
      </div>

      {requiresOptions &&
        Array.isArray(question.options) &&
        question.options.length > 0 && (
          <div className="space-y-2 ml-12">
            {question.options.map((option, i) => (
              <label
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )}

      {!requiresOptions && (
        <textarea
          value={answer || ""}
          onChange={(e) => onAnswerChange(question.id, e.target.value)}
          className={`w-full ml-12 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            question.question_type === "coding" ? "font-mono text-sm" : ""
          }`}
          rows={
            question.question_type === "coding"
              ? 6
              : question.question_type === "essay"
              ? 8
              : 3
          }
          placeholder={
            question.question_type === "coding"
              ? "Write your code here..."
              : question.question_type === "essay"
              ? "Write your essay here..."
              : "Type your answer here..."
          }
        />
      )}
    </div>
  );
}
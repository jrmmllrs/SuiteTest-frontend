import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function QuestionPreview({
  question,
  index,
  onEdit,
  onDelete,
  questionTypes = [], // NEW: Accept dynamic question types
}) {
  const [expandedExplanation, setExpandedExplanation] = useState(false);

  // NEW: Get question type display name
  const getQuestionTypeName = () => {
    const qt = questionTypes.find((t) => t.type_key === question.question_type);
    return qt ? qt.type_name : question.question_type.replace("_", " ");
  };

  // NEW: Check if question type requires options
  const selectedType = questionTypes.find(
    (qt) => qt.type_key === question.question_type
  );

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
              Q{index + 1}
            </span>
            {/* UPDATED: Display dynamic question type name */}
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {getQuestionTypeName().toUpperCase()}
            </span>
          </div>
          <p className="text-gray-900 font-medium mb-2">
            {question.question_text}
          </p>

          {/* UPDATED: Show options only if question type requires them */}
          {selectedType?.requires_options &&
            question.options &&
            question.options.length > 0 && (
              <div className="ml-4 space-y-1">
                {question.options
                  .filter((opt) => opt.trim())
                  .map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          option === question.correct_answer
                            ? "text-green-600 font-semibold"
                            : "text-gray-600"
                        }`}
                      >
                        {option === question.correct_answer && "✓ "}
                        {option}
                      </span>
                    </div>
                  ))}
              </div>
            )}

          {/* NEW: Show expected answer for non-option questions */}
          {!selectedType?.requires_options &&
            question.correct_answer &&
            selectedType?.requires_correct_answer && (
              <div className="ml-4 mt-2">
                <p className="text-xs text-gray-500 font-medium">
                  Expected Answer:
                </p>
                <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-1">
                  {question.correct_answer}
                </p>
              </div>
            )}

          {question.explanation && (
            <div className="mt-3 border-t border-gray-200 pt-3">
              <button
                onClick={() => setExpandedExplanation(!expandedExplanation)}
                className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {expandedExplanation ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
                {expandedExplanation ? "Hide" : "Show"} Explanation
              </button>
              {expandedExplanation && (
                <p className="mt-2 text-sm text-gray-700 bg-indigo-50 p-3 rounded">
                  {question.explanation}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
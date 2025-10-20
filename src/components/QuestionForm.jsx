import React from "react";
import { Trash2, Save, X } from "lucide-react";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { TextArea } from "./ui/TextArea";

export default function QuestionForm({
  currentQuestion,
  editingIndex,
  onQuestionChange,
  onQuestionTypeChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSave,
  onCancel,
  questionTypes = [], // NEW: Accept dynamic question types
}) {
  // NEW: Find the selected question type details
  const selectedType = questionTypes.find(
    (qt) => qt.type_key === currentQuestion.question_type
  );

  return (
    <div className="border-2 border-indigo-200 rounded-lg p-6 mb-6 bg-indigo-50">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingIndex !== null ? "Edit Question" : "New Question"}
      </h3>

      <div className="space-y-4">
        {/* UPDATED: Dynamic question type options */}
        <Select
          label="Question Type *"
          value={currentQuestion.question_type}
          onChange={onQuestionTypeChange}
          options={[
            { value: "", label: "Select question type" },
            ...questionTypes.map((qt) => ({
              value: qt.type_key,
              label: qt.type_name,
            })),
          ]}
        />

        <TextArea
          label="Question Text *"
          name="question_text"
          value={currentQuestion.question_text}
          onChange={onQuestionChange}
          rows="3"
          placeholder="Enter your question..."
        />

        {/* UPDATED: Show options only if question type requires them */}
        {selectedType?.requires_options && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options *
            </label>
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => onOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder={`Option ${index + 1}`}
                    readOnly={currentQuestion.question_type === "true_false"}
                  />
                  {currentQuestion.question_type !== "true_false" &&
                    currentQuestion.options.length > 2 && (
                      <button
                        onClick={() => onRemoveOption(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                </div>
              ))}
              {currentQuestion.question_type !== "true_false" && (
                <button
                  onClick={onAddOption}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  + Add Option
                </button>
              )}
            </div>

            {/* Show correct answer selector only if required */}
            {selectedType?.requires_correct_answer && (
              <div className="mt-4">
                <Select
                  label="Correct Answer *"
                  name="correct_answer"
                  value={currentQuestion.correct_answer}
                  onChange={onQuestionChange}
                  options={[
                    { value: "", label: "Select correct answer" },
                    ...currentQuestion.options
                      .filter((opt) => opt.trim())
                      .map((opt) => ({ value: opt, label: opt })),
                  ]}
                />
              </div>
            )}
          </div>
        )}

        {/* UPDATED: Show answer field for types without options but requiring answer */}
        {!selectedType?.requires_options &&
          selectedType?.requires_correct_answer && (
            <TextArea
              label="Expected Answer / Keywords"
              name="correct_answer"
              value={currentQuestion.correct_answer}
              onChange={onQuestionChange}
              rows="3"
              placeholder="Enter expected answer or keywords for evaluation..."
            />
          )}

        <TextArea
          label="Explanation (Optional)"
          name="explanation"
          value={currentQuestion.explanation}
          onChange={onQuestionChange}
          rows="3"
          placeholder="Explain why this is the correct answer. This will be shown to candidates after they complete the test."
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button variant="secondary" onClick={onCancel} icon={X}>
            Cancel
          </Button>
          <Button onClick={onSave} icon={Save}>
            {editingIndex !== null ? "Update" : "Save"} Question
          </Button>
        </div>
      </div>
    </div>
  );
}
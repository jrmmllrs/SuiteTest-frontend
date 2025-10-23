import React from "react";
import { Plus, FileText, Library } from "lucide-react";
import { Button } from "../ui/Button";
import QuestionForm from "../QuestionForm";
import QuestionPreview from "../QuestionPreview";

export default function QuestionsSection({
  questions,
  currentQuestion,
  editingIndex,
  showQuestionForm,
  questionTypes,
  onShowQuestionForm,
  onOpenQuestionBank,
  onOpenTestImport,
  onQuestionChange,
  onQuestionTypeChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onSaveQuestion,
  onCancelQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Questions ({questions.length})
        </h2>
        {!showQuestionForm && (
          <div className="flex gap-2">
            <Button
              onClick={onOpenTestImport}
              icon={FileText}
              variant="secondary"
            >
              Import Test
            </Button>
            <Button
              onClick={onOpenQuestionBank}
              icon={Library}
              variant="secondary"
            >
              Question Bank
            </Button>
            <Button onClick={() => onShowQuestionForm(true)} icon={Plus}>
              New Question
            </Button>
          </div>
        )}
      </div>

      {showQuestionForm && (
        <QuestionForm
          currentQuestion={currentQuestion}
          editingIndex={editingIndex}
          onQuestionChange={onQuestionChange}
          onQuestionTypeChange={onQuestionTypeChange}
          onOptionChange={onOptionChange}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
          onSave={onSaveQuestion}
          onCancel={onCancelQuestion}
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
              onEdit={() => onEditQuestion(index)}
              onDelete={() => onDeleteQuestion(index)}
              questionTypes={questionTypes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
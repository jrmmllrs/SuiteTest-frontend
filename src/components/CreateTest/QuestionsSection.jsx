import React from "react";
import { Plus, FileText, Library, ArrowLeft } from "lucide-react";
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
  onBack,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Questions</h2>
              <p className="text-sm text-gray-600">
                {questions.length} question{questions.length !== 1 ? 's' : ''} added
              </p>
            </div>
          </div>
          
          {!showQuestionForm && (
            <div className="flex gap-2">
              <Button
                onClick={onOpenTestImport}
                icon={FileText}
                variant="secondary"
                size="sm"
              >
                Import Test
              </Button>
              <Button
                onClick={onOpenQuestionBank}
                icon={Library}
                variant="secondary"
                size="sm"
              >
                Question Bank
              </Button>
              <Button 
                onClick={() => onShowQuestionForm(true)} 
                icon={Plus}
                size="sm"
              >
                Add Question
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Question Form */}
        {showQuestionForm && (
          <div className="mb-6">
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
          </div>
        )}

        {/* Questions List */}
        {questions.length > 0 ? (
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
        ) : (
          !showQuestionForm && (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="w-12 h-12 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                <FileText size={20} className="text-gray-400" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">No Questions Yet</h3>
              <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                Add questions to create your assessment
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={onOpenTestImport}
                  icon={FileText}
                  variant="secondary"
                  size="sm"
                >
                  Import Test
                </Button>
                <Button
                  onClick={onOpenQuestionBank}
                  icon={Library}
                  variant="secondary"
                  size="sm"
                >
                  Question Bank
                </Button>
                <Button 
                  onClick={() => onShowQuestionForm(true)} 
                  icon={Plus}
                  size="sm"
                >
                  Create Question
                </Button>
              </div>
            </div>
          )
        )}

        {/* Add Question Button */}
        {questions.length > 0 && !showQuestionForm && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={() => onShowQuestionForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0697b2] hover:bg-[#0697b2]/5 transition-colors text-gray-600 hover:text-[#0697b2]"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus size={16} />
                <span className="font-medium">Add Another Question</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
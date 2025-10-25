import React from "react";
import { X, FileText, Clock } from "lucide-react";
import { Button } from "../ui/Button";

export default function TestImportModal({
  show,
  availableTests,
  loadingTests,
  onClose,
  onImport,
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import Test</h2>
              <p className="text-sm text-gray-600 mt-1">Import all questions from an existing test</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingTests ? (
            <div className="text-center py-8">Loading tests...</div>
          ) : availableTests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText size={32} className="mx-auto mb-3 text-gray-400" />
              <p>No tests found in Question Bank</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-[#0697b2] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {test.title}
                      </h3>
                      {test.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {test.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText size={12} />
                          <span>{test.question_count || 0} questions</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{test.time_limit || 30}m</span>
                        </div>
                        <span className={`px-2 py-1 rounded ${
                          test.test_type === "pdf_based"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {test.test_type === "pdf_based" ? "PDF" : "Standard"}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => onImport(test)}
                      size="sm"
                    >
                      Import
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <Button variant="secondary" onClick={onClose} size="sm">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
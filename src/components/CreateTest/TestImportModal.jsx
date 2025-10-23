import React from "react";
import { X, FileText } from "lucide-react";
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
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Import Test from Question Bank
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Import all questions from an existing test
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadingTests ? (
            <div className="text-center py-8">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-600">Loading tests...</p>
            </div>
          ) : availableTests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-semibold mb-2">
                No tests found in Question Bank
              </p>
              <p className="text-sm text-gray-600">
                Create tests in the Question Bank department first
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTests.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {test.title}
                      </h3>
                      {test.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {test.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText size={16} />
                          <span>{test.question_count || 0} questions</span>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                          {test.test_type === "pdf_based"
                            ? "PDF Based"
                            : "Standard"}
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => onImport(test)} size="sm">
                      Import
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
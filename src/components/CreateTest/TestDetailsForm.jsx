import React from "react";
import { Upload, FileText, X, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";

export default function TestDetailsForm({
  testData,
  departments,
  handleTestDataChange,
  handlePdfUrlChange,
  clearPdfAttachment,
  onNext,
  canProceed,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Test Details</h2>
        <p className="text-sm text-gray-600 mt-1">Configure the basic settings for your assessment</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Title & Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Title *
          </label>
          <input
            type="text"
            name="title"
            value={testData.title}
            onChange={handleTestDataChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent"
            placeholder="e.g., JavaScript Developer Assessment"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={testData.description}
            onChange={handleTestDataChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent resize-none"
            placeholder="Describe what this test covers..."
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Limit (min) *
            </label>
            <input
              type="number"
              name="time_limit"
              value={testData.time_limit}
              onChange={handleTestDataChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test Type
            </label>
            <select
              name="test_type"
              value={testData.test_type}
              onChange={handleTestDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent"
            >
              <option value="standard">Standard Test</option>
              <option value="pdf_based">PDF-Based Test</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Audience
            </label>
            <select
              name="target_role"
              value={testData.target_role}
              onChange={handleTestDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent"
            >
              <option value="candidate">Candidates</option>
              <option value="employer">Employers/Staff</option>
            </select>
          </div>
        </div>

        {testData.target_role === "candidate" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              name="department_id"
              value={testData.department_id}
              onChange={handleTestDataChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent"
            >
              <option value="">Select a department</option>
              {departments
                .filter((dept) => dept.department_name !== "Question Bank")
                .map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.department_name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* PDF Attachment */}
        {testData.test_type === "pdf_based" && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Upload size={16} className="text-[#0697b2]" />
              <span className="font-medium text-gray-900">PDF Attachment</span>
            </div>

            {!testData.pdf_url ? (
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Google Drive URL or File ID
                </label>
                <input
                  type="text"
                  name="pdf_url"
                  value={testData.pdf_url}
                  onChange={handlePdfUrlChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0697b2] focus:border-transparent"
                  placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Make sure the file is set to "Anyone with the link can view"
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-[#0697b2]" />
                    <div>
                      <p className="font-medium text-sm text-gray-900">PDF Attached</p>
                      <p className="text-xs text-gray-500">ID: {testData.google_drive_id}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <a
                      href={`https://drive.google.com/file/d/${testData.google_drive_id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-[#0697b2] hover:bg-[#0697b2]/10 rounded"
                    >
                      <ExternalLink size={16} />
                    </a>
                    <button
                      onClick={clearPdfAttachment}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Next Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={onNext}
            disabled={!canProceed}
            icon={ArrowRight}
            className="bg-[#0697b2] hover:bg-[#05819a] text-white"
          >
            Continue to Questions
          </Button>
        </div>
      </div>
    </div>
  );
}
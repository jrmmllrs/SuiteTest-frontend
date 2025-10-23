import React from "react";
import { Upload, FileText, X, ExternalLink } from "lucide-react";
import { Input } from "../ui/Input";
import { TextArea } from "../ui/TextArea";

export default function TestDetailsForm({
  testData,
  departments,
  handleTestDataChange,
  handlePdfUrlChange,
  clearPdfAttachment,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="space-y-4">
        <Input
          label="Test Title *"
          type="text"
          name="title"
          value={testData.title}
          onChange={handleTestDataChange}
          placeholder="e.g., JavaScript Developer Assessment"
        />

        <TextArea
          label="Description"
          name="description"
          value={testData.description}
          onChange={handleTestDataChange}
          rows="4"
          placeholder="Describe what this test covers..."
        />

        <Input
          label="Time Limit (minutes)"
          type="number"
          name="time_limit"
          value={testData.time_limit}
          onChange={handleTestDataChange}
          min="1"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Test Type
          </label>
          <select
            name="test_type"
            value={testData.test_type}
            onChange={handleTestDataChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="candidate">Candidates</option>
            <option value="employer">Employers/Staff</option>
          </select>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a department</option>

              <optgroup label="Departments">
                {departments
                  .filter((dept) => dept.department_name !== "Question Bank")
                  .map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Other">
                {departments
                  .filter((dept) => dept.department_name === "Question Bank")
                  .map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </option>
                  ))}
              </optgroup>
            </select>

            <p className="text-xs text-gray-500 mt-1">
              This test will only be visible to candidates in the selected
              department
            </p>
          </div>
        )}

        {testData.test_type === "pdf_based" && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <Upload className="text-blue-600" size={20} />
              <h3 className="font-semibold text-gray-900">PDF Attachment</h3>
            </div>

            {!testData.pdf_url ? (
              <div>
                <Input
                  label="Google Drive URL or File ID"
                  type="text"
                  name="pdf_url"
                  value={testData.pdf_url}
                  onChange={handlePdfUrlChange}
                  placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view or just the FILE_ID"
                />
                <div className="mt-2 text-xs text-gray-600 space-y-1">
                  <p>• Paste the Google Drive sharing link</p>
                  <p>• Or just paste the file ID</p>
                  <p>
                    • Make sure the file is set to "Anyone with the link can
                    view"
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText className="text-blue-600" size={24} />
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        PDF Attached
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {testData.google_drive_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={`https://drive.google.com/file/d/${testData.google_drive_id}/view`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 p-1"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button
                      onClick={clearPdfAttachment}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
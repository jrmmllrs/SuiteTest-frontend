import React from "react";
import { FileText } from "lucide-react";

export function PdfModal({ googleDriveId, onClose }) {
  if (!googleDriveId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} />
            Reference Document
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
            className="w-full h-full"
            allow="autoplay"
            title="Test Reference Document - Full View"
          />
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { FileText, ExternalLink } from "lucide-react";

export function PdfSection({ test, onOpenModal }) {
  if (test?.test_type !== "pdf_based" || !test?.google_drive_id) {
    return null;
  }

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <FileText size={20} />
            Reference Document
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Review this document before answering the questions below.
          </p>

          <div className="flex gap-2">
            <a
              href={`https://drive.google.com/file/d/${test.google_drive_id}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <ExternalLink size={16} />
              Open PDF in New Tab
            </a>

            <button
              onClick={onOpenModal}
              className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 text-sm font-medium"
            >
              View in Modal
            </button>
          </div>
        </div>

        {test.thumbnail_url && (
          <img
            src={test.thumbnail_url}
            alt="PDF Thumbnail"
            className="w-24 h-24 object-cover rounded border border-blue-200"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>

      {/* Embedded PDF Preview */}
      <div className="border-2 border-blue-300 rounded-lg overflow-hidden bg-white">
        <iframe
          src={`https://drive.google.com/file/d/${test.google_drive_id}/preview`}
          className="w-full h-96"
          allow="autoplay"
          title="Test Reference Document"
        />
      </div>
    </div>
  );
}
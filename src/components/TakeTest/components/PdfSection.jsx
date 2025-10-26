import React from "react";
import { FileText } from "lucide-react";

export function PdfSection({ test, onOpenModal }) {
  if (test?.test_type !== "pdf_based" || !test?.google_drive_id) {
    return null;
  }

  return (
    <div
      className="border rounded-xl p-6 mb-6 shadow-sm"
      style={{
        background: "linear-gradient(135deg, #e0f7fa 0%, #e3f2fd 100%)",
        borderColor: "#80deea",
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
            <div
              className="p-1.5 rounded-lg"
              style={{ backgroundColor: "#b2ebf2" }}
            >
              <FileText size={18} style={{ color: "#0697b2" }} />
            </div>
            Reference Document
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Review this document carefully before answering the questions below.
          </p>

          <button
            onClick={onOpenModal}
            className="px-5 py-2.5 text-white rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow-md"
            style={{
              background: "linear-gradient(135deg, #0697b2 0%, #0582a0 100%)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #0582a0 0%, #046d88 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, #0697b2 0%, #0582a0 100%)";
            }}
          >
            View Full Document
          </button>
        </div>

        {test.thumbnail_url && (
          <img
            src={test.thumbnail_url}
            alt="PDF Thumbnail"
            className="w-24 h-24 object-cover rounded-lg shadow-sm"
            style={{
              borderColor: "#80deea",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
      </div>
    </div>
  );
}

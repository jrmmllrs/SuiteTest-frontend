import React from "react";
import { FileText, X } from "lucide-react";

export function PdfModal({ googleDriveId, onClose }) {
  if (!googleDriveId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(6, 151, 178, 0.2)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow:
            "0 20px 60px rgba(6, 151, 178, 0.3), 0 0 0 1px rgba(6, 151, 178, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: "linear-gradient(135deg, #0697b2 0%, #0582a0 100%)",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <FileText size={20} style={{ color: "#ffffff" }} />
            </div>
            <h3 className="font-semibold text-white text-lg">
              Reference Document
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.1)";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* PDF Content */}
        <div
          className="flex-1 overflow-hidden"
          style={{
            backgroundColor: "#ffffff",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
          }}
        >
          <iframe
            src={`https://drive.google.com/file/d/${googleDriveId}/preview`}
            className="w-full h-full"
            allow="autoplay"
            title="Test Reference Document - Full View"
            style={{
              borderBottomLeftRadius: "16px",
              borderBottomRightRadius: "16px",
              border: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}

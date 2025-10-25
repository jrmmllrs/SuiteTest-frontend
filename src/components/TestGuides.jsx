// File: src/components/TestGuides.jsx
import React, { useState } from "react";
import {
  Shield,
  Clock,
  Monitor,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  Wifi,
  Camera,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Home,
  FileText,
} from "lucide-react";

export default function TestGuides({ onBack, onNavigate }) {
  const [openSections, setOpenSections] = useState({
    "before-you-begin": true, // Open first section by default
  });

  const toggleSection = (sectionId) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (onNavigate) {
      onNavigate("dashboard");
    }
  };

  const guideSections = [
    {
      id: "before-you-begin",
      title: "Before You Begin",
      icon: Settings,
      shortDesc: "System requirements and setup",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                System Requirements
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Monitor className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Browser:</strong> Chrome, Firefox, or Edge
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Wifi className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Internet:</strong> Stable 5 Mbps connection
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Camera className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Webcam:</strong> Required for proctoring
                  </span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Setup Checklist
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Quiet, well-lit room</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Stable internet connection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Device plugged in</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Other apps closed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "rules-guidelines",
      title: "Test Rules",
      icon: Shield,
      shortDesc: "What's allowed and prohibited",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Allowed Items
              </h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Government ID</li>
                <li>• Water in clear bottle</li>
                <li>• Blank paper & pen</li>
                <li>• Calculator (if specified)</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 text-sm mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Prohibited Items
              </h4>
              <ul className="space-y-1 text-sm text-red-700">
                <li>• Mobile phones</li>
                <li>• Headphones</li>
                <li>• Books or notes</li>
                <li>• Other people</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 text-sm mb-2">
              Proctoring Requirements
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Webcam must remain on</li>
              <li>• Audio may be monitored</li>
              <li>• Screen recording enabled</li>
              <li>• Environment scan required</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "taking-test",
      title: "Taking Test",
      icon: Zap,
      shortDesc: "Test process and navigation",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">
                Test Steps
              </h4>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-cyan-600 text-white rounded w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Use test link from email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-cyan-600 text-white rounded w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Complete verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-cyan-600 text-white rounded w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Environment scan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-cyan-600 text-white rounded w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    4
                  </span>
                  <span>Begin test</span>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="font-semibold text-amber-800 text-sm mb-1">
                  During Test
                </h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Monitor timer</li>
                  <li>• Use navigation buttons</li>
                  <li>• Stay in fullscreen</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-semibold text-purple-800 text-sm mb-1">
                  Restrictions
                </h4>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>• Limited tab switching</li>
                  <li>• Copy/paste disabled</li>
                  <li>• Right-click disabled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "technical-issues",
      title: "Technical Help",
      icon: HelpCircle,
      shortDesc: "Troubleshooting common issues",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">
                Quick Solutions
              </h4>
              <div className="space-y-2 text-sm">
                <div className="p-2 bg-gray-50 rounded border">
                  <strong className="text-gray-700">Internet Issues</strong>
                  <p className="text-gray-600 text-xs mt-1">
                    Reconnect - progress auto-saves
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <strong className="text-gray-700">Browser Crash</strong>
                  <p className="text-gray-600 text-xs mt-1">
                    Reload page to continue
                  </p>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <strong className="text-gray-700">Webcam Problems</strong>
                  <p className="text-gray-600 text-xs mt-1">
                    Check browser permissions
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Emergency Steps
              </h4>
              <ol className="space-y-2 text-sm text-red-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Don't panic - progress saves automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Take screenshot of error</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Contact support immediately</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Compact Header */}
        <div className="mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-2 bg-cyan-600 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Test Guide</h1>
            </div>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Essential information for your test success. Review carefully
              before starting.
            </p>
          </div>
        </div>

        {/* Compact Guide Sections */}
        <div className="space-y-3">
          {guideSections.map((section) => (
            <div key={section.id} className="quiz-card overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <section.icon className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-semibold text-gray-900 text-sm">
                      {section.title}
                    </h2>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {section.shortDesc}
                    </p>
                  </div>
                </div>
                <div className="p-1 bg-gray-100 rounded">
                  {openSections[section.id] ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </div>
              </button>

              {openSections[section.id] && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-3">{section.content}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Compact Quick Tips */}
        <div className="mt-6 quiz-card p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Quick Success Tips
          </h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
              <Clock className="w-3 h-3 text-amber-600" />
              <span className="text-amber-700">Rest well before test</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-200">
              <BookOpen className="w-3 h-3 text-blue-600" />
              <span className="text-blue-700">Read questions carefully</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
              <Monitor className="w-3 h-3 text-green-600" />
              <span className="text-green-700">Test equipment first</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-cyan-50 rounded border border-cyan-200">
              <Shield className="w-3 h-3 text-cyan-600" />
              <span className="text-cyan-700">Follow all guidelines</span>
            </div>
          </div>
        </div>

        {/* Compact Footer */}
        <div className="mt-6 text-center">
          <div className="bg-white quiz-card p-4">
            <p className="text-gray-600 text-sm mb-3">
              Ready to begin your test journey?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={handleBackClick}
                className="quiz-button-primary flex items-center gap-2 px-4 py-2 text-sm flex-1 justify-center"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => onNavigate && onNavigate("tests")}
                className="quiz-button-next flex items-center gap-2 px-4 py-2 text-sm flex-1 justify-center"
              >
                My Tests
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-xs">
              Need help? Contact support before testing
            </p>
            <p className="text-cyan-600 text-sm font-medium mt-1">
              Good luck! 🍀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing Settings icon component
function Settings(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

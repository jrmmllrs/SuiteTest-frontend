import React, { useState } from "react";
import {
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Copy,
  Maximize,
  XCircle,
  Monitor,
  AlertCircle,
  Eye,
  ArrowLeft,
} from "lucide-react";

export function TestInstructionsScreen({
  test,
  proctoringSettings,
  onStartTest,
  onBack,
}) {
  const [agreed, setAgreed] = useState(false);

  const handleStartTest = () => {
    if (agreed) {
      onStartTest();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all"
                title="Back to Dashboard"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: '#0698b2' }}>
                  {test?.title}
                </h1>
                <p className="text-sm text-slate-500 mt-1">Review instructions before starting</p>
              </div>
            </div>
            {proctoringSettings?.enable_proctoring && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-xl shadow-sm">
                <Shield className="text-red-600" size={18} />
                <span className="text-sm font-bold text-slate-900">Proctored</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Test Stats Row */}
            <div className="grid grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm" style={{ backgroundColor: '#0698b2' }}>
                  <FileText className="text-white" size={24} />
                </div>
                <p className="text-sm text-slate-500 font-medium mb-1">Questions</p>
                <p className="text-4xl font-bold text-slate-900">{test?.questions?.length || 0}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm" style={{ backgroundColor: '#0698b2' }}>
                  <Clock className="text-white" size={24} />
                </div>
                <p className="text-sm text-slate-500 font-medium mb-1">Time Limit</p>
                <p className="text-4xl font-bold text-slate-900">{test?.time_limit || 30}<span className="text-xl ml-1">min</span></p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-slate-200 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm" style={{ backgroundColor: '#0698b2' }}>
                  <CheckCircle className="text-white" size={24} />
                </div>
                <p className="text-sm text-slate-500 font-medium mb-1">Auto-Save</p>
                <p className="text-3xl font-bold text-slate-900">30s</p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
              <p className="text-base text-slate-700 leading-relaxed">
                {test?.description || "Complete this assessment to the best of your ability. Take your time to read each question carefully and provide thoughtful responses."}
              </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Important Guidelines */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: '#0698b2' }}>
                      <AlertCircle className="text-white" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Important Guidelines</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="flex-shrink-0" style={{ color: '#0698b2' }} size={20} />
                      <span>Read each question carefully</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="flex-shrink-0" style={{ color: '#0698b2' }} size={20} />
                      <span>Progress saved automatically</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="flex-shrink-0" style={{ color: '#0698b2' }} size={20} />
                      <span>Navigate freely between questions</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                      <span>Auto-submit when time expires</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle className="text-blue-600 flex-shrink-0" size={20} />
                      <span>Can resume if interrupted</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-700">
                      <XCircle className="text-red-600 flex-shrink-0" size={20} />
                      <span>No changes after submission</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Active */}
              {proctoringSettings?.enable_proctoring && (
                <div className="bg-white rounded-2xl shadow-sm border border-red-200">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-11 h-11 bg-red-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Shield className="text-white" size={20} />
                      </div>
                      <h2 className="text-lg font-bold text-slate-900">Security Active</h2>
                    </div>
                    <div className="space-y-3">
                      {proctoringSettings.require_fullscreen && (
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <Maximize className="text-red-600 flex-shrink-0" size={20} />
                          <span>Fullscreen required</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-slate-700">
                        <Monitor className="text-orange-600 flex-shrink-0" size={20} />
                        <span>Max {proctoringSettings.max_tab_switches} tab switches</span>
                      </div>
                      {!proctoringSettings.allow_copy_paste && (
                        <div className="flex items-center gap-3 text-sm text-slate-700">
                          <Copy className="text-amber-600 flex-shrink-0" size={20} />
                          <span>Copy/paste blocked</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-slate-700">
                        <Eye className="flex-shrink-0" style={{ color: '#0698b2' }} size={20} />
                        <span>All actions logged</span>
                      </div>
                    </div>
                    <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle className="text-red-700 flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-sm font-semibold text-red-900">Multiple violations will result in automatic test termination.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-slate-900 mb-5 text-center">
                Ready to Begin?
              </h3>
              
              {/* Timer */}
              <div className="mb-6 p-6 rounded-2xl text-white text-center shadow-md" style={{ backgroundColor: '#0698b2' }}>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide opacity-90">Time Allowed</p>
                <div className="flex items-center justify-center gap-3">
                  <Clock size={32} />
                  <span className="text-5xl font-bold">{test?.time_limit || 30}</span>
                  <span className="text-xl">min</span>
                </div>
              </div>

              {/* Checklist */}
              <div className="mb-6 bg-slate-50 rounded-xl p-5 border border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-4">Pre-Test Checklist</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0698b2' }}></div>
                    <span>Quiet environment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0698b2' }}></div>
                    <span>Stable internet</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0698b2' }}></div>
                    <span>Close other apps</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#0698b2' }}></div>
                    <span>Materials ready</span>
                  </div>
                </div>
              </div>

              {/* Agreement */}
              <div className="mb-5 p-5 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-2 border-slate-300 focus:ring-2 cursor-pointer"
                    style={{ 
                      accentColor: '#0698b2'
                    }}
                  />
                  <span className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900">
                    I agree to comply with all test policies and proctoring requirements.
                  </span>
                </label>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartTest}
                disabled={!agreed}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all duration-300 ${
                  agreed
                    ? "text-white shadow-md hover:shadow-lg"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
                style={agreed ? { backgroundColor: '#0698b2' } : {}}
              >
                {agreed ? "🚀 Start Test" : "⚠️ Accept Terms"}
              </button>

              {!agreed && (
                <p className="text-xs text-center text-slate-500 mt-3">Check the box to continue</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
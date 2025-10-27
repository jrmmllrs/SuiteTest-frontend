import React, { useState, useEffect } from "react";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Clock, 
  ArrowLeft,
  RefreshCw,
  Zap,
  TrendingUp,
  Sparkles,
  Monitor,
  MousePointer,
  Copy,
  Maximize,
  Minimize
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function ProctoringEvents({
  testId,
  candidateId,
  token,
  onBack,
}) {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const url = candidateId
        ? `${API_BASE_URL}/proctoring/test/${testId}/candidate/${candidateId}`
        : `${API_BASE_URL}/proctoring/test/${testId}/events`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
        if (data.summary) {
          setSummary(data.summary);
        }
      }
    } catch (error) {
      console.error("Failed to fetch proctoring events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "tab_switch":
        return <RefreshCw size={20} className="text-red-500" />;
      case "copy_attempt":
        return <Copy size={20} className="text-orange-500" />;
      case "paste_attempt":
        return <MousePointer size={20} className="text-orange-500" />;
      case "fullscreen_exit":
        return <Minimize size={20} className="text-red-500" />;
      case "right_click":
        return <MousePointer size={20} className="text-amber-500" />;
      case "window_blur":
        return <Eye size={20} className="text-amber-500" />;
      default:
        return <AlertTriangle size={20} className="text-gray-500" />;
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case "tab_switch":
      case "fullscreen_exit":
        return "bg-gradient-to-r from-red-500/10 to-rose-500/10 border-l-4 border-red-500";
      case "copy_attempt":
      case "paste_attempt":
        return "bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-l-4 border-orange-500";
      case "window_blur":
      case "right_click":
        return "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-l-4 border-amber-500";
      default:
        return "bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-l-4 border-gray-500";
    }
  };

  const getEventSeverity = (eventType) => {
    switch (eventType) {
      case "tab_switch":
      case "fullscreen_exit":
        return { label: "High Risk", color: "bg-red-500 text-white" };
      case "copy_attempt":
      case "paste_attempt":
        return { label: "Medium Risk", color: "bg-orange-500 text-white" };
      case "window_blur":
      case "right_click":
        return { label: "Low Risk", color: "bg-amber-500 text-white" };
      default:
        return { label: "Info", color: "bg-gray-500 text-white" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
        <div className="inline-block w-16 h-16 border-4 border-[#0495b5]/20 border-t-[#0495b5] rounded-full animate-spin mb-5" />
        <p className="text-gray-600 font-medium text-lg">Loading proctoring data...</p>
        <p className="text-gray-400 text-sm mt-2">Securely fetching monitoring events</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 border border-gray-300 hover:border-gray-400 hover:shadow-sm"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0495b5] to-[#027a96] flex items-center justify-center shadow-lg shadow-[#0495b5]/30">
                    <Shield size={24} className="text-white" />
                  </div>
                  {/* <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles size={10} className="text-white" />
                  </div> */}
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0495b5] to-[#027a96] bg-clip-text text-transparent">
                    Proctoring Events
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Real-time monitoring and security alerts
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={fetchEvents}
              className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-110 hover:text-[#0495b5]"
              title="Refresh events"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <StatCard
              label="Tab Switches"
              value={summary.tab_switches || 0}
              icon={<RefreshCw size={24} className="text-red-500" />}
              gradient="from-red-500 to-rose-500"
              trend="high"
            />
            <StatCard
              label="Copy Attempts"
              value={summary.copy_attempts || 0}
              icon={<Copy size={24} className="text-orange-500" />}
              gradient="from-orange-500 to-amber-500"
              trend="medium"
            />
            <StatCard
              label="Paste Attempts"
              value={summary.paste_attempts || 0}
              icon={<MousePointer size={24} className="text-orange-500" />}
              gradient="from-amber-500 to-yellow-500"
              trend="medium"
            />
            <StatCard
              label="Fullscreen Exits"
              value={summary.fullscreen_exits || 0}
              icon={<Minimize size={24} className="text-red-500" />}
              gradient="from-red-600 to-pink-600"
              trend="high"
            />
            <StatCard
              label="Total Events"
              value={summary.total_events || 0}
              icon={<TrendingUp size={24} className="text-[#0495b5]" />}
              gradient="from-[#0495b5] to-[#027a96]"
              trend="total"
            />
          </div>
        )}

        {/* Events Timeline */}
        {events.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center shadow-inner border border-teal-100">
              <Shield size={48} className="text-[#0495b5]" />
            </div>
            <p className="text-gray-900 font-semibold text-xl mb-3">
              No Proctoring Events Recorded
            </p>
            <p className="text-gray-600 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              This candidate maintained a clean test session with no suspicious activity detected
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Zap size={16} className="text-emerald-500" />
              <span>Excellent test integrity maintained</span>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Event Timeline
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {events.length} event{events.length !== 1 ? 's' : ''} recorded during test session
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Monitor size={16} />
                  <span>Real-time Monitoring</span>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  getEventIcon={getEventIcon}
                  getEventColor={getEventColor}
                  getEventSeverity={getEventSeverity}
                  isHovered={hoveredEvent === event.id}
                  onHover={setHoveredEvent}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, gradient, trend }) {
  const getTrendColor = () => {
    switch (trend) {
      case "high": return "text-red-600";
      case "medium": return "text-orange-600";
      case "low": return "text-amber-600";
      default: return "text-[#0495b5]";
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#0495b5]/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className={`text-4xl font-bold ${getTrendColor()} group-hover:scale-105 transition-transform`}>
            {value}
          </p>
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function EventRow({ event, getEventIcon, getEventColor, getEventSeverity, isHovered, onHover }) {
  const formatEventType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const severity = getEventSeverity(event.event_type);

  return (
    <div 
      className={`p-6 transition-all duration-200 ${getEventColor(event.event_type)} ${
        isHovered ? 'transform scale-[1.01] shadow-sm' : ''
      }`}
      onMouseEnter={() => onHover(event.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
          {getEventIcon(event.event_type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {formatEventType(event.event_type)}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${severity.color}`}>
                {severity.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
              <Clock size={14} className="text-[#0495b5]" />
              <span className="font-medium">{formatDate(event.created_at)}</span>
            </div>
          </div>
          
          {event.candidate_name && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="font-medium">Candidate:</span>
                <span>{event.candidate_name}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <span className="font-medium">Email:</span>
                <span>{event.candidate_email}</span>
              </div>
            </div>
          )}

          {event.event_data && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                {event.event_data.count && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Occurrence:</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded font-bold">
                      #{event.event_data.count}
                    </span>
                  </div>
                )}
                {event.event_data.timestamp && (
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Timestamp:</span>
                    <span>{new Date(event.event_data.timestamp).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, Eye, Clock } from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

export default function ProctoringEvents({
  testId,
  candidateId,
  token,
  onBack,
}) {
  const [events, setEvents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

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
        return "🔄";
      case "copy_attempt":
        return "📋";
      case "paste_attempt":
        return "📌";
      case "fullscreen_exit":
        return "⛔";
      case "right_click":
        return "🖱️";
      case "window_blur":
        return "👁️";
      default:
        return "⚠️";
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case "tab_switch":
      case "fullscreen_exit":
        return "text-red-600 bg-red-50";
      case "copy_attempt":
      case "paste_attempt":
        return "text-orange-600 bg-orange-50";
      case "window_blur":
      case "right_click":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading proctoring data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <Shield className="text-indigo-600" size={24} />
            <h1 className="text-xl font-bold text-gray-900">
              Proctoring Events
            </h1>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <StatCard
              label="Tab Switches"
              value={summary.tab_switches || 0}
              icon="🔄"
              color="red"
            />
            <StatCard
              label="Copy Attempts"
              value={summary.copy_attempts || 0}
              icon="📋"
              color="orange"
            />
            <StatCard
              label="Paste Attempts"
              value={summary.paste_attempts || 0}
              icon="📌"
              color="orange"
            />
            <StatCard
              label="Fullscreen Exits"
              value={summary.fullscreen_exits || 0}
              icon="⛔"
              color="red"
            />
            <StatCard
              label="Total Events"
              value={summary.total_events || 0}
              icon="⚠️"
              color="gray"
            />
          </div>
        )}

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Shield className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No proctoring events recorded</p>
            <p className="text-sm text-gray-500 mt-2">
              This candidate had a clean test session
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Event Timeline
              </h2>
            </div>
            <div className="divide-y">
              {events.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  getEventIcon={getEventIcon}
                  getEventColor={getEventColor}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colorClasses = {
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    yellow: "bg-yellow-50 text-yellow-700",
    gray: "bg-gray-50 text-gray-700",
  };

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

function EventRow({ event }) {
  const getEventIcon = (eventType) => {
    switch (eventType) {
      case "tab_switch":
        return "🔄";
      case "copy_attempt":
        return "📋";
      case "paste_attempt":
        return "📌";
      case "fullscreen_exit":
        return "⛔";
      case "right_click":
        return "🖱️";
      case "window_blur":
        return "👁️";
      default:
        return "⚠️";
    }
  };

  const getEventColor = (eventType) => {
    switch (eventType) {
      case "tab_switch":
      case "fullscreen_exit":
        return "bg-red-50";
      case "copy_attempt":
      case "paste_attempt":
        return "bg-orange-50";
      default:
        return "bg-gray-50";
    }
  };

  const formatEventType = (type) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className={`p-4 hover:bg-gray-50 ${getEventColor(event.event_type)}`}>
      <div className="flex items-start gap-4">
        <span className="text-2xl">{getEventIcon(event.event_type)}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900">
              {formatEventType(event.event_type)}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock size={14} />
              <span>{formatDate(event.created_at)}</span>
            </div>
          </div>
          {event.candidate_name && (
            <p className="text-sm text-gray-600 mb-1">
              Candidate: {event.candidate_name} ({event.candidate_email})
            </p>
          )}
          {event.event_data && (
            <div className="text-xs text-gray-500 mt-2 bg-white p-2 rounded border">
              {event.event_data.count && (
                <span>Occurrence #{event.event_data.count}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";

export default function DashboardStatsCard({ title, value, subtitle, bgColor, textColor, icon: Icon }) {
  return (
    <div className={`${bgColor} rounded-lg p-6`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-medium ${textColor}`}>
          {title}
        </h3>
        {Icon && <Icon size={20} className={textColor} />}
      </div>
      <p className={`text-2xl font-bold ${textColor}`}>
        {value}
      </p>
      <p className={`text-sm ${textColor} mt-1`}>
        {subtitle}
      </p>
    </div>
  );
}


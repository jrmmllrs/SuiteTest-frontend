import React from "react";

export const StatCard = ({ title, value, subtitle, bgColor = "bg-blue-50", textColor = "text-blue-900" }) => (
  <div className={`${bgColor} p-6 rounded-lg`}>
    <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
    <p className={`${textColor.replace('900', '700')} mt-2 text-3xl font-bold`}>{value}</p>
    {subtitle && <p className={`${textColor.replace('900', '600')} text-sm`}>{subtitle}</p>}
  </div>
);
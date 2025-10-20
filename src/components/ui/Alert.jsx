import React, { useEffect } from "react";

export const Alert = ({ type, message, onClose }) => {
  const bgColor = type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  
  useEffect(() => {
    if (onClose && message) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose, message]);

  return message ? (
    <div className={`mb-4 p-4 rounded-lg ${bgColor}`}>{message}</div>
  ) : null;
};
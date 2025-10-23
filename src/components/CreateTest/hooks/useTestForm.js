import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../constants";

export function useTestForm(token) {
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    time_limit: 30,
    pdf_url: "",
    google_drive_id: "",
    thumbnail_url: "",
    test_type: "standard",
    target_role: "candidate",
    department_id: "",
  });

  const [questionTypes, setQuestionTypes] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Fetch question types
      const qTypesResponse = await fetch(`${API_BASE_URL}/question-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const qTypesData = await qTypesResponse.json();
      if (qTypesData.success) {
        setQuestionTypes(qTypesData.questionTypes);
      }

      // Fetch departments
      const deptResponse = await fetch(`${API_BASE_URL}/users/departments`);
      const deptData = await deptResponse.json();
      if (deptData.success) {
        setDepartments(deptData.departments);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleTestDataChange = (e) => {
    setTestData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const extractDriveId = (url) => {
    if (!url) return "";
    const patterns = [
      /\/d\/([a-zA-Z0-9_-]+)/,
      /id=([a-zA-Z0-9_-]+)/,
      /^([a-zA-Z0-9_-]{25,})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return url;
  };

  const handlePdfUrlChange = (e) => {
    const url = e.target.value;
    const driveId = extractDriveId(url);

    setTestData((prev) => ({
      ...prev,
      pdf_url: url,
      google_drive_id: driveId,
      thumbnail_url: driveId
        ? `https://drive.google.com/thumbnail?id=${driveId}`
        : "",
    }));
  };

  const clearPdfAttachment = () => {
    setTestData((prev) => ({
      ...prev,
      pdf_url: "",
      google_drive_id: "",
      thumbnail_url: "",
    }));
  };

  return {
    testData,
    questionTypes,
    departments,
    handleTestDataChange,
    handlePdfUrlChange,
    clearPdfAttachment,
  };
}
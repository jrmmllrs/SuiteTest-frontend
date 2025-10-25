import { useState } from "react";

export function useQuestions(questionTypes, setMessage) {
  const [questions, setQuestions] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState({
    question_text: "",
    question_type: "multiple_choice",
    options: ["", "", "", ""],
    correct_answer: "",
    explanation: "",
  });

  const getDefaultQuestion = () => {
    const defaultType = questionTypes[0];
    return {
      question_text: "",
      question_type: defaultType?.type_key || "multiple_choice",
      options: defaultType?.requires_options
        ? defaultType.type_key === "true_false"
          ? ["True", "False"]
          : ["", "", "", ""]
        : [],
      correct_answer: "",
      explanation: "",
    };
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleQuestionTypeChange = (e) => {
    const type = e.target.value;
    const selectedType = questionTypes.find((t) => t.type_key === type);
    let newQuestion = { ...currentQuestion, question_type: type };

    if (selectedType?.requires_options) {
      if (type === "true_false") {
        newQuestion.options = ["True", "False"];
      } else if (currentQuestion.options.length < 2) {
        newQuestion.options = ["", "", "", ""];
      }
    } else {
      newQuestion.options = [];
    }

    if (!selectedType?.requires_correct_answer) {
      newQuestion.correct_answer = "";
    }

    setCurrentQuestion(newQuestion);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    setCurrentQuestion((prev) => ({
      ...prev,
      options: [...prev.options, ""],
    }));
  };

  const removeOption = (index) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const saveQuestion = () => {
    if (!currentQuestion.question_text.trim()) {
      setMessage({ type: "error", text: "Question text is required" });
      return;
    }

    const selectedType = questionTypes.find(
      (t) => t.type_key === currentQuestion.question_type
    );

    if (selectedType?.requires_options) {
      const filledOptions = currentQuestion.options.filter(
        (opt) => opt.trim() !== ""
      );
      if (filledOptions.length < 2) {
        setMessage({ type: "error", text: "At least 2 options are required" });
        return;
      }
    }

    if (
      selectedType?.requires_correct_answer &&
      !currentQuestion.correct_answer
    ) {
      setMessage({ type: "error", text: "Please select the correct answer" });
      return;
    }

    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = currentQuestion;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, currentQuestion]);
    }

    setCurrentQuestion(getDefaultQuestion());
    setShowQuestionForm(false);
    setMessage({ type: "success", text: "Question saved!" });
  };

  const editQuestion = (index) => {
    setCurrentQuestion(questions[index]);
    setEditingIndex(index);
    setShowQuestionForm(true);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setMessage({ type: "success", text: "Question deleted!" });
  };

  const cancelQuestionForm = () => {
    setCurrentQuestion(getDefaultQuestion());
    setEditingIndex(null);
    setShowQuestionForm(false);
  };

  const addQuestionsToList = (newQuestions) => {
    setQuestions([...questions, ...newQuestions]);
  };

  return {
    questions,
    setQuestions, // Added this export
    currentQuestion,
    editingIndex,
    showQuestionForm,
    setShowQuestionForm,
    handleQuestionChange,
    handleQuestionTypeChange,
    handleOptionChange,
    addOption,
    removeOption,
    saveQuestion,
    editQuestion,
    deleteQuestion,
    cancelQuestionForm,
    addQuestionsToList,
  };
}
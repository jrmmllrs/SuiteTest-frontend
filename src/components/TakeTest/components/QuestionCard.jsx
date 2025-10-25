import React from "react";

export function QuestionCard({
  question,
  index,
  answer,
  onAnswerChange,
  questionTypes = [],
}) {
  const questionType = questionTypes.find(
    (qt) => qt.type_key === question.question_type
  );
  const requiresOptions = questionType?.requires_options || false;

  // Determine styling based on question type
  const getQuestionTypeStyle = () => {
    switch (question.question_type) {
      case "coding":
        return {
          badge: "bg-purple-100 text-purple-800 border-purple-300",
          icon: "💻",
          text: "font-mono",
        };
      case "essay":
        return {
          badge: "bg-orange-100 text-orange-800 border-orange-300",
          icon: "📝",
          text: "",
        };
      case "multiple_choice":
        return {
          badge: "bg-blue-100 text-blue-800 border-blue-300",
          icon: "🔘",
          text: "",
        };
      default:
        return {
          badge: "bg-gray-100 text-gray-800 border-gray-300",
          icon: "❓",
          text: "",
        };
    }
  };

  const typeStyle = getQuestionTypeStyle();

  return (
    <div className="quiz-card quiz-question-card overflow-hidden transition-all duration-300 hover:shadow-lg bg-white">
      {/* Question Header - Fixed for better visibility */}
      <div className="bg-gradient-to-r from-quiz-primary to-quiz-accent p-6 text-white">
        {/* Header Section */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Question Number + Type + Points */}
          <div className="flex items-center gap-3">
            {/* Number inside circle */}
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0697b2] text-quiz-primary font-bold text-lg backdrop-blur-md shadow-md border border-white/30">
              {index + 1}
            </span>

            {/* Question text beside the number */}
            <h3 className="text-lg sm:text-xl font-bold leading-relaxed text-gray-800">
              {question.question_text}
            </h3>

            {/* Points badge (if any) */}
            {question.points && (
              <span className="flex items-center gap-1 bg-yellow-500/90 text-white px-3 py-1 rounded-full text-sm font-semibold border border-yellow-300">
                <span>⭐</span>
                {question.points} {question.points === 1 ? "point" : "points"}
              </span>
            )}
          </div>

          {/* Question type badge (right side) */}
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full border ${typeStyle.badge} backdrop-blur-sm`}
            >
              <span className="mr-2">{typeStyle.icon}</span>
              {questionType?.type_name || question.question_type}
            </span>
          </div>
        </div>

        {/* Description (if any) */}
        {question.description && (
          <p className="text-white/90 text-sm leading-relaxed bg-white/10 p-3 rounded-lg border border-white/20">
            {question.description}
          </p>
        )}
      </div>

      {/* Question Body */}
      <div className="p-6 quiz-question-body bg-white">
        {/* Multiple Choice Options - Fixed visibility */}
        {requiresOptions &&
          Array.isArray(question.options) &&
          question.options.length > 0 && (
            <div className="space-y-3">
              {question.options.map((option, i) => {
                const isSelected = answer === option;
                const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];

                return (
                  <label
                    key={i}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 border-[#0697b2] transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? "border-quiz-primary bg-blue-50 shadow-lg scale-[1.02] ring-2 ring-blue-200"
                        : "border-gray-300 hover:border-quiz-primary/70 hover:bg-blue-25 hover:shadow-md"
                    }`}
                  >
                    {/* Option Letter - Much more visible */}
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-5 mt-0.5 transition-all font-bold text-sm ${
                        isSelected
                          ? "bg-quiz-primary border-quiz-primary text-[#0697b2] shadow-lg"
                          : "border-gray-400 bg-white text-gray-700 group-hover:border-quiz-primary group-hover:text-quiz-primary"
                      }`}
                    >
                      {letters[i]}
                    </div>

                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={(e) =>
                        onAnswerChange(question.id, e.target.value)
                      }
                      className="hidden"
                    />

                    <div className="flex-1">
                      <span
                        className={`text-base leading-relaxed font-medium ${
                          isSelected
                            ? "text-quiz-dark font-semibold"
                            : "text-gray-800"
                        }`}
                      >
                        {option}
                      </span>
                    </div>

                    {/* Selection Indicator - More visible */}
                    {isSelected && (
                      <div className="flex items-center justify-center w-6 h-6 bg-quiz-primary rounded-full text-white animate-bounce">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                );
              })}
            </div>
          )}

        {/* Text Input Area */}
        {!requiresOptions && (
          <div className="relative">
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <span>
                {question.question_type === "coding"
                  ? "Write your code below"
                  : question.question_type === "essay"
                  ? "Write your essay below"
                  : "Type your answer below"}
              </span>
            </div>

            <textarea
              value={answer || ""}
              onChange={(e) => onAnswerChange(question.id, e.target.value)}
              className={`w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-quiz-primary focus:border-quiz-primary transition-all duration-200 resize-none placeholder-gray-400 bg-white shadow-sm ${
                question.question_type === "coding"
                  ? "font-mono text-sm bg-gray-50"
                  : question.question_type === "essay"
                  ? "leading-relaxed min-h-[200px]"
                  : "min-h-[120px]"
              } ${typeStyle.text}`}
              rows={
                question.question_type === "coding"
                  ? 12
                  : question.question_type === "essay"
                  ? 8
                  : 4
              }
              placeholder={
                question.question_type === "coding"
                  ? "// Write your code here...\n// You can use any programming language\n// Make sure your code is well-structured and commented"
                  : question.question_type === "essay"
                  ? "Write your essay here...\n\nStart with a clear introduction, develop your main points in the body, and conclude effectively."
                  : "Type your answer here...\n\nBe specific and concise in your response."
              }
            />

            {/* Character count for text areas */}
            {(question.question_type === "text" ||
              question.question_type === "essay") && (
              <div className="absolute bottom-3 right-3 text-xs text-gray-500 bg-white/90 px-2 py-1 rounded border">
                {answer?.length || 0} characters
              </div>
            )}

            {/* Coding helper text */}
            {question.question_type === "coding" && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border">
                <svg
                  className="w-4 h-4 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Supports all programming languages. Format your code properly
                  for better readability.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Required Question Indicator */}
        {question.is_required && !answer && (
          <div className="mt-4 flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 p-3 rounded-lg border border-red-200 animate-pulse">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              This is a required question - You must provide an answer
            </span>
          </div>
        )}

        {/* Answer Status */}
        {answer && (
          <div className="mt-4 flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 p-3 rounded-lg border border-green-200">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Answer provided {question.is_required && "✓ Ready to proceed"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

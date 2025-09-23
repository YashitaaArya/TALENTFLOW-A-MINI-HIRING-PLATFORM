import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssessmentById, saveAssessmentResponse } from "../utils/storage";

export default function TakeAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const a = getAssessmentById(Number(id));
    if (!a) {
      alert("Assessment not found");
      navigate("/assessments");
      return;
    }
    setAssessment(a);
    console.debug("[TakeAssessment] loaded", a.id, a.title);
  }, [id, navigate]);

  const onChangeAnswer = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!assessment) return;

    for (const q of assessment.questions || []) {
      if (q.conditional) {
        const sourceVal = answers[q.conditional.questionId];
        if (sourceVal !== q.conditional.equals) continue;
      }

      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          alert(`Question required: "${q.question}"`);
          return;
        }
      }

      if ((q.type === "short-text" || q.type === "long-text") && q.maxLength) {
        const val = answers[q.id] || "";
        if (val.length > q.maxLength) {
          alert(`Answer too long for "${q.question}" (max ${q.maxLength} chars)`);
          return;
        }
      }

      if (q.type === "number" && q.min !== undefined && q.max !== undefined) {
        const val = Number(answers[q.id]);
        if (isNaN(val) || val < q.min || val > q.max) {
          alert(`Number for "${q.question}" must be between ${q.min} and ${q.max}`);
          return;
        }
      }
    }

    saveAssessmentResponse(assessment.id, answers);
    console.debug("[TakeAssessment] submission saved", answers);
    alert("Assessment submitted successfully!");
    navigate("/assessments");
  };

  if (!assessment) return <div>Loading assessment...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{assessment.title || "(Untitled)"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(assessment.questions || []).map((q) => {
          if (q.conditional) {
            const sourceVal = answers[q.conditional.questionId];
            if (sourceVal !== q.conditional.equals) return null;
          }

          return (
            <div key={q.id} className="p-3 border rounded-md bg-white">
              <div className="font-semibold mb-1">
                {q.question} {q.required && <span className="text-red-500">*</span>}
              </div>

              {q.type === "multiple-choice" &&
                (q.options || []).map((opt) => (
                  <label key={opt.id} className="block">
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt.text}
                      checked={answers[q.id] === opt.text}
                      onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                    />{" "}
                    {opt.text}
                  </label>
                ))}

              {q.type === "checkboxes" &&
                (q.options || []).map((opt) => (
                  <label key={opt.id} className="block">
                    <input
                      type="checkbox"
                      value={opt.text}
                      checked={(answers[q.id] || []).includes(opt.text)}
                      onChange={(e) => {
                        const prev = answers[q.id] || [];
                        if (e.target.checked) onChangeAnswer(q.id, [...prev, opt.text]);
                        else onChangeAnswer(q.id, prev.filter((v) => v !== opt.text));
                      }}
                    />{" "}
                    {opt.text}
                  </label>
                ))}

              {q.type === "short-text" && (
                <input
                  type="text"
                  maxLength={q.maxLength}
                  value={answers[q.id] || ""}
                  onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                  className="w-full p-2 border rounded"
                />
              )}

              {q.type === "long-text" && (
                <textarea
                  maxLength={q.maxLength}
                  value={answers[q.id] || ""}
                  onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                  className="w-full p-2 border rounded"
                />
              )}

              {q.type === "number" && (
                <input
                  type="number"
                  min={q.min}
                  max={q.max}
                  value={answers[q.id] || ""}
                  onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                  className="w-32 p-2 border rounded"
                />
              )}

              {q.type === "file" && (
                <input
                  type="file"
                  onChange={(e) => onChangeAnswer(q.id, e.target.files?.[0]?.name || "")}
                  className="p-1"
                />
              )}
            </div>
          );
        })}

        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Submit Assessment
        </button>
      </form>
    </div>
  );
}

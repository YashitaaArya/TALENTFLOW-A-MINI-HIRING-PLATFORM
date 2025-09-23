import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssessmentById, submitAssessmentResponse } from "../utils/storage";

export default function AssessmentTakePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [candidate, setCandidate] = useState({ name: "", email: "" });

  useEffect(() => {
    const a = getAssessmentById(id);
    if (!a) {
      console.warn("[Take] assessment not found:", id);
      setAssessment(null);
      return;
    }
    setAssessment(a);
  }, [id]);

  if (!assessment) return <div className="p-4">Assessment not found.</div>;

  const onChange = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
    console.debug("[Take] answer change", qid, value);
  };

  const validate = () => {
    for (const q of assessment.questions || []) {
      if (q.conditional) {
        const sourceVal = answers[q.conditional.questionId];
        if (sourceVal !== q.conditional.equals) {
          continue;
        }
      }
      if (q.required) {
        const val = answers[q.id];
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          alert(`Please answer required question: "${q.question}"`);
          return false;
        }
      }
      if ((q.type === "short-text" || q.type === "long-text") && q.maxLength) {
        const val = answers[q.id] || "";
        if (val.length > q.maxLength) {
          alert(`Answer too long for "${q.question}" (max ${q.maxLength})`);
          return false;
        }
      }
      if (q.type === "number" && (q.min !== undefined && q.max !== undefined)) {
        const val = Number(answers[q.id]);
        if (isNaN(val) || val < q.min || val > q.max) {
          alert(`Number for "${q.question}" must be between ${q.min} and ${q.max}`);
          return false;
        }
      }
    }
    if (!candidate.name || candidate.name.trim() === "") {
      alert("Please enter your name.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.debug("[Take] submitting answers", answers, "candidate", candidate);
    if (!validate()) return;
    const answersArray = (assessment.questions || []).map((q) => {
      return { questionId: q.id, value: answers[q.id] ?? null };
    });
    try {
      const resp = submitAssessmentResponse(assessment.id, candidate, answersArray);
      alert("Response submitted! Your reference id: " + resp.id + (resp.score ? ` (score: ${resp.score.percentage}%)` : ""));
      console.debug("[Take] submission saved", resp);
      navigate("/assessments");
    } catch (err) {
      console.error("[Take] submit error", err);
      alert("Failed to submit — check console.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{assessment.title || "(Untitled Assessment)"}</h1>
        <div className="text-sm text-gray-500">Please answer the questions below.</div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-white rounded shadow-sm">
          <label className="block text-sm font-medium mb-1">Your name</label>
          <input
            type="text"
            value={candidate.name}
            onChange={(e) => setCandidate({ ...candidate, name: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <label className="block text-sm font-medium mt-2 mb-1">Email (optional)</label>
          <input
            type="email"
            value={candidate.email}
            onChange={(e) => setCandidate({ ...candidate, email: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        {(assessment.questions || []).map((q) => {
          if (q.conditional) {
            const sourceVal = answers[q.conditional.questionId];
            if (sourceVal !== q.conditional.equals) {
              return null;
            }
          }

          return (
            <div key={q.id} className="p-4 bg-white rounded shadow-sm">
              <div className="font-semibold mb-2">
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
                      onChange={(e) => onChange(q.id, e.target.value)}
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
                        if (e.target.checked) onChange(q.id, [...prev, opt.text]);
                        else onChange(q.id, prev.filter((v) => v !== opt.text));
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
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-full p-2 border rounded"
                />
              )}

              {q.type === "long-text" && (
                <textarea
                  maxLength={q.maxLength}
                  value={answers[q.id] || ""}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-full p-2 border rounded"
                />
              )}

              {q.type === "number" && (
                <input
                  type="number"
                  min={q.min}
                  max={q.max}
                  value={answers[q.id] || ""}
                  onChange={(e) => onChange(q.id, e.target.value)}
                  className="w-32 p-2 border rounded"
                />
              )}

              {q.type === "file" && (
                <input
                  type="file"
                  onChange={(e) => onChange(q.id, e.target.files?.[0]?.name || "")}
                  className="p-1"
                />
              )}
            </div>
          );
        })}

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
            Submit
          </button>
          <button type="button" onClick={() => navigate("/assessments")} className="px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

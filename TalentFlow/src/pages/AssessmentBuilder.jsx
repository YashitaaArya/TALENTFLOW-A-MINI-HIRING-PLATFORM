import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAssessmentById,
  getAssessments,
  upsertAssessment,
} from "../utils/storage";

const QUESTION_TYPES = [
  { label: "Multiple Choice (single answer)", value: "multiple-choice" },
  { label: "Checkboxes (multiple answers)", value: "checkboxes" },
  { label: "Short Text", value: "short-text" },
  { label: "Long Text", value: "long-text" },
  { label: "Number", value: "number" },
  { label: "File Upload", value: "file" },
];

function newOption(text = "") {
  return { id: Date.now() + Math.floor(Math.random() * 999), text, isCorrect: false };
}

function makeNewQuestion(type) {
  return {
    id: Date.now() + Math.floor(Math.random() * 999),
    type,
    question: "",
    required: false,
    points: 1,
    options: type === "multiple-choice" || type === "checkboxes" ? [newOption("Option 1"), newOption("Option 2")] : [],
    min: type === "number" ? 0 : undefined,
    max: type === "number" ? 100 : undefined,
    maxLength: type === "short-text" || type === "long-text" ? 200 : undefined,
    conditional: null
  };
}

function deepCopy(x) {
  return JSON.parse(JSON.stringify(x));
}

export default function AssessmentBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [allQuestionsForConditional, setAllQuestionsForConditional] = useState([]);
  const autosaveTimer = useRef(null);

  useEffect(() => {
    if (id === "new") {
      const a = { id: Date.now(), title: "", questions: [] };
      setAssessment(a);
      setQuestions([]);
      return;
    }
    const found = getAssessmentById(id);
    if (found) {
      setAssessment(found);
      setQuestions(found.questions || []);
      return;
    }
    const all = getAssessments();
    const numeric = Number(id);
    const f2 = all.find((x) => x.id === numeric);
    if (f2) {
      setAssessment(f2);
      setQuestions(f2.questions || []);
    } else {
      const a = { id: numeric || Date.now(), title: "", questions: [] };
      setAssessment(a);
      setQuestions([]);
    }
  }, [id]);

  useEffect(() => {
    setAllQuestionsForConditional(questions.map((q) => ({ id: q.id, text: q.question || `[Question ${q.id}]` })));
  }, [questions]);

  useEffect(() => {
    if (!assessment) return;
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      const draft = { ...assessment, questions };
      try {
        localStorage.setItem(`assessment-draft-${draft.id}`, JSON.stringify(draft));
      } catch (err) {}
    }, 800);
    return () => clearTimeout(autosaveTimer.current);
  }, [assessment, questions]);

  const addQuestion = (type) => {
    const nq = makeNewQuestion(type);
    setQuestions((prev) => [...prev, nq]);
  };

  const updateQuestion = (qid, patch) => {
    setQuestions((prev) => prev.map((q) => (q.id === qid ? { ...q, ...patch } : q)));
  };

  const removeQuestion = (qid) => {
    if (!confirm("Remove question?")) return;
    setQuestions((prev) => prev.filter((q) => q.id !== qid));
  };

  const addOption = (qid) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qid ? { ...q, options: [...(q.options || []), newOption(`Option ${((q.options||[]).length||0)+1}`)] } : q))
    );
  };

  const removeOption = (qid, optId) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid ? { ...q, options: (q.options || []).filter((o) => o.id !== optId) } : q
      )
    );
  };

  const updateOptionText = (qid, optId, text) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qid
          ? { ...q, options: (q.options || []).map((o) => (o.id === optId ? { ...o, text } : o)) }
          : q
      )
    );
  };

  const markOptionCorrect = (qid, optId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qid) return q;
        if (q.type === "multiple-choice") {
          return {
            ...q,
            options: q.options.map((o) => ({ ...o, isCorrect: o.id === optId })),
          };
        } else {
          return {
            ...q,
            options: q.options.map((o) => (o.id === optId ? { ...o, isCorrect: !o.isCorrect } : o)),
          };
        }
      })
    );
  };

  const validateBeforeSave = () => {
    if (!assessment.title || assessment.title.trim() === "") {
      alert("Assessment title is required.");
      return false;
    }
    for (const q of questions) {
      if (!q.question || q.question.trim() === "") {
        alert("All questions must have text.");
        return false;
      }
      if ((q.type === "multiple-choice" || q.type === "checkboxes") && (!q.options || q.options.length < 2)) {
        alert("Choice questions must have at least 2 options.");
        return false;
      }
      if ((q.type === "multiple-choice" || q.type === "checkboxes")) {
        const anyCorrect = (q.options || []).some((o) => o.isCorrect);
        if (!anyCorrect) {
          alert("Please mark at least one correct option for: " + (q.question || "[untitled question]"));
          return false;
        }
      }
      if (q.type === "number" && (q.min === undefined || q.max === undefined || q.min >= q.max)) {
        alert("Number questions must have a valid min < max.");
        return false;
      }
    }
    return true;
  };

  const saveAssessment = () => {
    if (!validateBeforeSave()) return;
    const toSave = deepCopy({ ...assessment, questions });
    upsertAssessment(toSave);
    try {
      localStorage.removeItem(`assessment-draft-${toSave.id}`);
    } catch (err) {}
    navigate("/assessments");
  };

  function LivePreview({ questions }) {
    const [answers, setAnswers] = useState({});
    const [previewScore, setPreviewScore] = useState(null);

    const onChangeAnswer = (qid, value) => {
      setAnswers((prev) => ({ ...prev, [qid]: value }));
    };

    const computePreviewScore = () => {
      let totalPoints = 0;
      let obtained = 0;
      const gradableTypes = new Set(["multiple-choice", "checkboxes"]);
      questions.forEach((q) => {
        const points = Number(q.points || 1);
        if (!gradableTypes.has(q.type)) return;
        totalPoints += points;
        const ans = answers[q.id];
        if (ans === undefined || ans === null) return;
        if (q.type === "multiple-choice") {
          const correct = (q.options || []).find((o) => o.isCorrect);
          if (correct && ans === correct.text) {
            obtained += points;
          }
        } else if (q.type === "checkboxes") {
          const correctSet = new Set((q.options || []).filter((o) => o.isCorrect).map((o) => o.text));
          const selected = Array.isArray(ans) ? ans : [];
          if (correctSet.size === 0) return;
          const correctSelected = selected.filter((s) => correctSet.has(s)).length;
          const incorrectSelected = selected.length - correctSelected;
          const rawScore = (correctSelected - incorrectSelected) / Math.max(1, correctSet.size);
          const clamped = Math.max(0, rawScore);
          obtained += clamped * points;
        }
      });
      if (totalPoints <= 0) return null;
      const percentage = Math.round((obtained / totalPoints) * 100);
      return { totalPoints, obtained, percentage };
    };

    const submitPreview = (e) => {
      e.preventDefault();
      for (const q of questions) {
        if (q.conditional && answers[q.conditional.questionId] !== q.conditional.equals) {
          continue;
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
      const score = computePreviewScore();
      setPreviewScore(score);
      alert("Preview submit OK. Score: " + (score ? `${score.percentage}%` : "N/A"));
    };

    return (
      <div>
        <form onSubmit={submitPreview} className="space-y-4">
          {questions.map((q) => {
            if (q.conditional) {
              const sourceVal = answers[q.conditional.questionId];
              if (sourceVal !== q.conditional.equals) {
                return null;
              }
            }
            return (
              <div key={q.id} className="p-3 border rounded-md bg-white">
                <div className="font-semibold mb-1">{q.question} {q.required && <span className="text-red-500">*</span>}</div>
                {q.type === "multiple-choice" &&
                  (q.options || []).map((opt) => (
                    <label key={opt.id} className="block">
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt.text}
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
                        onChange={(e) => {
                          const prev = answers[q.id] || [];
                          if (e.target.checked) {
                            onChangeAnswer(q.id, [...prev, opt.text]);
                          } else {
                            onChangeAnswer(q.id, prev.filter((v) => v !== opt.text));
                          }
                        }}
                      />{" "}
                      {opt.text}
                    </label>
                  ))}
                {q.type === "short-text" && (
                  <input
                    type="text"
                    maxLength={q.maxLength}
                    onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                )}
                {q.type === "long-text" && (
                  <textarea
                    maxLength={q.maxLength}
                    onChange={(e) => onChangeAnswer(q.id, e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                )}
                {q.type === "number" && (
                  <input
                    type="number"
                    min={q.min}
                    max={q.max}
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
          <div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Submit Preview</button>
          </div>
        </form>
        {previewScore && (
          <div className="mt-3 p-3 border rounded bg-gray-50">
            <div className="font-semibold">Preview Score</div>
            <div>Total points: {previewScore.totalPoints}</div>
            <div>Obtained: {Math.round(previewScore.obtained * 100) / 100}</div>
            <div>Percentage: {previewScore.percentage}%</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Assessment Title"
          value={assessment?.title || ""}
          onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
          className="p-2 border rounded w-1/2"
        />
        <div className="flex gap-2">
          <button
            onClick={() => saveAssessment()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Assessment
          </button>
          <button
            onClick={() => navigate("/assessments")}
            className="px-3 py-2 bg-gray-200 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {QUESTION_TYPES.map((qt) => (
          <button
            key={qt.value}
            onClick={() => addQuestion(qt.value)}
            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add {qt.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {questions.map((q) => (
          <div key={q.id} className="p-3 border rounded-md bg-gray-50">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Question text"
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                  className="w-full p-2 border rounded mb-2"
                />

                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={!!q.required}
                      onChange={(e) => updateQuestion(q.id, { required: !!e.target.checked })}
                    />
                    Required
                  </label>

                  <label className="text-sm flex items-center gap-1">
                    Points:
                    <input
                      type="number"
                      value={q.points ?? 1}
                      onChange={(e) => updateQuestion(q.id, { points: Number(e.target.value) || 1 })}
                      className="w-20 p-1 border rounded ml-1"
                    />
                  </label>

                  {(q.type === "short-text" || q.type === "long-text") && (
                    <label className="text-sm flex items-center gap-1">
                      Max length:
                      <input
                        type="number"
                        value={q.maxLength || ""}
                        onChange={(e) => updateQuestion(q.id, { maxLength: Number(e.target.value) || undefined })}
                        className="w-20 p-1 border rounded ml-1"
                      />
                    </label>
                  )}

                  {q.type === "number" && (
                    <>
                      <label className="text-sm flex items-center gap-1">
                        Min:
                        <input
                          type="number"
                          value={q.min ?? ""}
                          onChange={(e) => updateQuestion(q.id, { min: Number(e.target.value) })}
                          className="w-20 p-1 border rounded ml-1"
                        />
                      </label>
                      <label className="text-sm flex items-center gap-1">
                        Max:
                        <input
                          type="number"
                          value={q.max ?? ""}
                          onChange={(e) => updateQuestion(q.id, { max: Number(e.target.value) })}
                          className="w-20 p-1 border rounded ml-1"
                        />
                      </label>
                    </>
                  )}
                </div>

                {(q.type === "multiple-choice" || q.type === "checkboxes") && (
                  <div className="space-y-2 mb-2">
                    <div className="text-sm text-gray-600 mb-1">Options</div>
                    {(q.options || []).map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <div>
                          {q.type === "multiple-choice" ? (
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={!!opt.isCorrect}
                              onChange={() => markOptionCorrect(q.id, opt.id)}
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={!!opt.isCorrect}
                              onChange={() => markOptionCorrect(q.id, opt.id)}
                            />
                          )}
                        </div>

                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => updateOptionText(q.id, opt.id, e.target.value)}
                          className="flex-1 p-2 border rounded"
                        />

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => markOptionCorrect(q.id, opt.id)}
                            className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                            aria-label="Mark as correct"
                          >
                            Mark correct
                          </button>

                          <div className="text-sm text-green-700 w-20">
                            {opt.isCorrect ? "✔ Correct" : ""}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeOption(q.id, opt.id)}
                            className="px-2 py-1 bg-red-600 text-white rounded-md"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div>
                      <button
                        type="button"
                        onClick={() => addOption(q.id)}
                        className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                      >
                        + Add option
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-2">
                  <div className="text-sm text-gray-600">Conditional display</div>
                  <div className="flex gap-2 items-center mt-1">
                    <select
                      value={q.conditional?.questionId ?? ""}
                      onChange={(e) =>
                        updateQuestion(q.id, {
                          conditional:
                            e.target.value === ""
                              ? null
                              : { questionId: Number(e.target.value), equals: "" },
                        })
                      }
                      className="p-1 border rounded"
                    >
                      <option value="">— show always —</option>
                      {allQuestionsForConditional.map((qq) => (
                        <option key={qq.id} value={qq.id}>
                          {qq.text || `[Question ${qq.id}]`}
                        </option>
                      ))}
                    </select>

                    {q.conditional && (
                      <input
                        placeholder="equals value"
                        value={q.conditional.equals ?? ""}
                        onChange={(e) =>
                          updateQuestion(q.id, {
                            conditional: { ...q.conditional, equals: e.target.value },
                          })
                        }
                        className="p-1 border rounded"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-3">
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">Live Preview (Candidate view)</h3>
        <LivePreview questions={questions} />
      </div>
    </div>
  );
}

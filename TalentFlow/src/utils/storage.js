export function getAssessments() {
  try {
    const raw = localStorage.getItem("assessments");
    const parsed = raw ? JSON.parse(raw) : [];
    console.debug("[storage] getAssessments ->", parsed.length, "items");
    return parsed;
  } catch (err) {
    console.error("[storage] getAssessments error", err);
    return [];
  }
}

export function saveAssessments(list) {
  try {
    localStorage.setItem("assessments", JSON.stringify(list));
    console.debug("[storage] saveAssessments ->", list.length, "items saved");
  } catch (err) {
    console.error("[storage] saveAssessments error", err);
  }
}

export function getAssessmentById(id) {
  const all = getAssessments();
  const found = all.find((a) => a.id === Number(id));
  console.debug("[storage] getAssessmentById ->", id, !!found);
  return found || null;
}

export function upsertAssessment(assessment) {
  const all = getAssessments();
  const idx = all.findIndex((a) => a.id === assessment.id);
  if (idx === -1) {
    all.push(assessment);
    console.debug("[storage] upsertAssessment -> created", assessment.id);
  } else {
    all[idx] = assessment;
    console.debug("[storage] upsertAssessment -> updated", assessment.id);
  }
  saveAssessments(all);
}

export function deleteAssessment(id) {
  const all = getAssessments();
  const filtered = all.filter((a) => a.id !== Number(id));
  saveAssessments(filtered);
  console.debug("[storage] deleteAssessment ->", id);
}

export function getAssessmentResponses() {
  try {
    const raw = localStorage.getItem("assessment-responses");
    const parsed = raw ? JSON.parse(raw) : [];
    console.debug("[storage] getAssessmentResponses ->", parsed.length, "items");
    return parsed;
  } catch (err) {
    console.error("[storage] getAssessmentResponses error", err);
    return [];
  }
}

export function saveAssessmentResponses(list) {
  try {
    localStorage.setItem("assessment-responses", JSON.stringify(list));
    console.debug("[storage] saveAssessmentResponses ->", list.length, "items saved");
  } catch (err) {
    console.error("[storage] saveAssessmentResponses error", err);
  }
}

export function getResponsesForAssessment(assessmentId) {
  const all = getAssessmentResponses();
  return all.filter((r) => Number(r.assessmentId) === Number(assessmentId));
}

function scoreAnswers(assessment, answers) {
  if (!assessment || !assessment.questions) return null;
  let totalPoints = 0;
  let obtained = 0;
  const gradableTypes = new Set(["multiple-choice", "checkboxes"]);
  assessment.questions.forEach((q) => {
    const points = Number(q.points || 1);
    if (!gradableTypes.has(q.type)) return;
    totalPoints += points;
    const ans = answers.find((a) => Number(a.questionId) === Number(q.id));
    if (!ans) return;
    if (q.type === "multiple-choice") {
      const correct = (q.options || []).find((o) => o.isCorrect);
      if (correct && ans.value === correct.text) {
        obtained += points;
      }
    } else if (q.type === "checkboxes") {
      const correctSet = new Set((q.options || []).filter((o) => o.isCorrect).map((o) => o.text));
      const selected = Array.isArray(ans.value) ? ans.value : [];
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
}

export function submitAssessmentResponse(assessmentId, candidate, answers) {
  try {
    const assessments = getAssessments();
    const assessment = assessments.find((a) => Number(a.id) === Number(assessmentId));
    const score = scoreAnswers(assessment, answers);
    const resp = {
      id: Date.now() + Math.floor(Math.random() * 999),
      assessmentId: Number(assessmentId),
      candidateName: candidate?.name || "Anonymous",
      candidateEmail: candidate?.email || "",
      createdAt: new Date().toISOString(),
      answers,
      score,
    };
    const all = getAssessmentResponses();
    all.push(resp);
    saveAssessmentResponses(all);
    console.info("[storage] submitAssessmentResponse -> saved", resp.id, "score:", score);
    return resp;
  } catch (err) {
    console.error("[storage] submitAssessmentResponse error", err);
    throw err;
  }
}

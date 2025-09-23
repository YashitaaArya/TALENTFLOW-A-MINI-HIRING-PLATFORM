import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAssessmentById, getResponsesForAssessment } from "../utils/storage";

export default function AssessmentSubmissionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const a = getAssessmentById(id);
    setAssessment(a);
    setResponses(getResponsesForAssessment(id));
    console.debug("[Submissions] loaded", id);
  }, [id]);

  if (!assessment) return <div className="p-4">Assessment not found.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{assessment.title} — Submissions</h1>
        <button onClick={() => navigate("/assessments")} className="px-3 py-2 bg-gray-200 rounded-md">Back</button>
      </div>

      {responses.length === 0 ? (
        <div className="p-4 bg-white rounded shadow-sm">No submissions yet.</div>
      ) : (
        <div className="space-y-3">
          {responses.map((r) => (
            <div key={r.id} className="p-3 border rounded bg-white flex justify-between items-center">
              <div>
                <div className="font-semibold">{r.candidateName} {r.candidateEmail ? `— ${r.candidateEmail}` : ""}</div>
                <div className="text-sm text-gray-500">Submitted: {new Date(r.createdAt).toLocaleString()}</div>
                {r.score && <div className="text-sm text-green-600">Score: {r.score.percentage}%</div>}
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 bg-gray-200 rounded" onClick={() => {
                  alert(JSON.stringify(r, null, 2));
                }}>View</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

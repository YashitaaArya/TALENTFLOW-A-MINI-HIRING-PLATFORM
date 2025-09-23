import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssessments, deleteAssessment, getResponsesForAssessment } from "../utils/storage";

export default function AssessmentsPage() {
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  const load = () => {
    const all = getAssessments();
    setList(all);
    console.debug("[AssessmentsPage] loaded", all.length);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id) => {
    if (!confirm("Delete this assessment? This cannot be undone.")) return;
    deleteAssessment(id);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/assessments/new")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            + New Assessment
          </button>
          <button onClick={load} className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Refresh</button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="p-4 bg-white rounded shadow-sm">No assessments yet.</div>
      ) : (
        <div className="grid gap-4">
          {list.map((a) => {
            const submissions = getResponsesForAssessment(a.id);
            return (
              <div
                key={a.id}
                className="p-4 border rounded-md shadow-sm bg-white flex justify-between items-center"
              >
                <div>
                  <div className="text-lg font-semibold">{a.title || "(Untitled)"}</div>
                  <div className="text-sm text-gray-500">
                    {a.questions?.length || 0} question{a.questions?.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <div className="text-sm text-gray-600 mr-2">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</div>
                  <button
                    onClick={() => navigate(`/assessments/${a.id}`)}
                    className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/assessments/${a.id}/take`)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Take
                  </button>
                  <button
                    onClick={() => navigate(`/assessments/${a.id}/submissions`)}
                    className="px-3 py-1 bg-gray-300 rounded-md hover:bg-gray-400"
                  >
                    Submissions
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

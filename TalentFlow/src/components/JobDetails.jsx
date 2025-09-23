import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import db from "../db";

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);

  useEffect(() => {
    async function loadJob() {
      const localJob = await db.jobs.get(parseInt(jobId));
      if (localJob) setJob(localJob);
      else {
        const res = await fetch(`/api/jobs/${jobId}`);
        const data = await res.json();
        setJob(data);
      }
    }
    loadJob();
  }, [jobId]);

  if (!job) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <button
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>

      <div className="flex gap-2 mb-2">
        {job.tags.map((tag) => (
          <span key={tag} className="bg-gray-200 px-2 py-1 rounded text-sm">
            {tag}
          </span>
        ))}
      </div>

      <div className="mb-2">
        <strong>Status:</strong> {job.status}
      </div>

      <div className="mb-2">
        <strong>Slug:</strong> {job.slug}
      </div>

      <div className="mb-2">
        <strong>Order:</strong> {job.order}
      </div>

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => navigate(`/jobs`)}
          >
            Edit Job
          </button>
          <button
            className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={() => alert("Archive/Unarchive action")}
          >
            {job.status === "active" ? "Archive" : "Unarchive"}
          </button>
        </div>
      </div>
    </div>
  );
}

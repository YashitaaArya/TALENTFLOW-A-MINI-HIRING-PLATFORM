export default function JobCard({ job, onEdit, onToggleStatus }) {
  return (
    <div className="border p-4 rounded-md flex justify-between items-center">
      <div>
        <h3 className="font-bold">{job.title}</h3>
        <p className="text-sm text-gray-600">{job.tags.join(", ")}</p>
        <span className={`px-2 py-1 text-xs rounded ${job.status === "active" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-700"}`}>{job.status}</span>
      </div>
      <div className="flex gap-2">
        <button className="px-2 py-1 bg-blue-600 text-white rounded-md text-sm" onClick={onEdit}>Edit</button>
        <button className="px-2 py-1 bg-gray-400 text-white rounded-md text-sm" onClick={onToggleStatus}>{job.status === "active" ? "Archive" : "Unarchive"}</button>
      </div>
    </div>
  );
}

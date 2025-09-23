import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableJobCard({ job, onEdit, onToggleStatus, onView }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="border p-4 rounded-md flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold cursor-pointer" onClick={onView}>{job.title}</h3>
        <div className="flex gap-2 text-sm mt-1">{job.tags.map(tag=><span key={tag} className="bg-gray-200 px-2 py-0.5 rounded">{tag}</span>)}</div>
        <div className="text-sm mt-1">{job.status}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="px-2 py-1 bg-blue-600 text-white rounded text-sm">Edit</button>
        <button onClick={onToggleStatus} className="px-2 py-1 bg-gray-600 text-white rounded text-sm">{job.status==="active"?"Archive":"Unarchive"}</button>
      </div>
    </div>
  );
}

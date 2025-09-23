import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableJobCard from "../components/SortableJobCard";
import db from "../db";

const PAGE_SIZE = 10;

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState({ title: "", tags: "", status: "active" });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    async function fetchJobs() {
      const res = await fetch("/api/jobs");
      const data = await res.json();
      data.sort((a,b)=>a.order-b.order);
      setJobs(data);
      db.jobs.bulkPut(data);
    }

    async function loadFromDB() {
      const localJobs = await db.jobs.toArray();
      if (localJobs.length > 0) setJobs(localJobs.sort((a,b)=>a.order-b.order));
      else fetchJobs();
    }

    loadFromDB();
  }, []);

  useEffect(() => {
    let result = jobs;
    const s = search.toLowerCase();
    if (search) result = result.filter(job => job.title.toLowerCase().includes(s) || job.tags.some(tag => tag.toLowerCase().includes(s)));
    if (statusFilter) result = result.filter(job => job.status === statusFilter);
    if (tagFilter) result = result.filter(job => job.tags.some(tag => tag.toLowerCase() === tagFilter.toLowerCase()));
    setFilteredJobs(result);
    setCurrentPage(1);
  }, [jobs, search, statusFilter, tagFilter]);

  const openModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setForm({ title: job.title, tags: job.tags.join(", "), status: job.status });
    } else {
      setEditingJob(null);
      setForm({ title: "", tags: "", status: "active" });
    }
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const saveJob = async () => {
    if (!form.title.trim()) return;
    const slug = form.title.toLowerCase().replace(/\s+/g,"-");
    if (jobs.some(j => j.slug === slug && (!editingJob || j.id !== editingJob.id))) return alert("Slug must be unique");

    if (editingJob) {
      const updated = { ...editingJob, title: form.title, tags: form.tags.split(",").map(t=>t.trim()), status: form.status, slug };
      const res = await fetch(`/api/jobs/${editingJob.id}`, { method: "PATCH", headers: { "Content-Type":"application/json" }, body: JSON.stringify(updated) });
      const data = await res.json();
      setJobs(jobs.map(j => j.id===data.id?data:j));
      db.jobs.put(data);
    } else {
      const maxOrder = jobs.length ? Math.max(...jobs.map(j=>j.order || 0)) : 0;
      const newJob = { title: form.title, tags: form.tags.split(",").map(t=>t.trim()), status: form.status, slug, order: maxOrder+1 };
      const res = await fetch("/api/jobs", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(newJob) });
      const data = await res.json();
      setJobs([...jobs, data]);
      db.jobs.put(data);
    }

    closeModal();
  };

  const toggleStatus = async (job) => {
    const updated = { ...job, status: job.status==="active"?"archived":"active" };
    const res = await fetch(`/api/jobs/${job.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify(updated) });
    const data = await res.json();
    setJobs(jobs.map(j => j.id===data.id?data:j));
    db.jobs.put(data);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = jobs.findIndex(j => j.id === active.id);
    const newIndex = jobs.findIndex(j => j.id === over.id);
    const newJobs = arrayMove(jobs, oldIndex, newIndex);
    newJobs.forEach((j,i)=>j.order=i);

    setJobs(newJobs);

    const res = await fetch(`/api/jobs/${active.id}/reorder`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ fromOrder: oldIndex, toOrder: newIndex }) });
    if (!res.ok) setJobs(jobs);
    else db.jobs.bulkPut(newJobs);
  };

  const uniqueTags = Array.from(new Set(jobs.flatMap(job => job.tags)));
  const pageCount = Math.ceil(filteredJobs.length / PAGE_SIZE);
  const paginatedJobs = filteredJobs.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" onClick={()=>openModal()}>+ Add Job</button>
      </div>

      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Search by title or tags..." value={search} onChange={e=>setSearch(e.target.value)} className="border px-3 py-2 rounded-md flex-1" />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border px-3 py-2 rounded-md">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="closed">Closed</option>
          <option value="archived">Archived</option>
        </select>
        <select value={tagFilter} onChange={e=>setTagFilter(e.target.value)} className="border px-3 py-2 rounded-md">
          <option value="">All Tags</option>
          {uniqueTags.map(tag=><option key={tag} value={tag}>{tag}</option>)}
        </select>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={paginatedJobs.map(j=>j.id)} strategy={verticalListSortingStrategy}>
          {paginatedJobs.map(job=>(
            <SortableJobCard key={job.id} job={job} onEdit={()=>openModal(job)} onToggleStatus={()=>toggleStatus(job)} onView={()=>navigate(`/jobs/${job.id}`)} />
          ))}
        </SortableContext>
      </DndContext>

      {pageCount>1 && <div className="flex gap-2 mt-4">
        <button onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded">Prev</button>
        {Array.from({length:pageCount},(_,i)=><button key={i} onClick={()=>setCurrentPage(i+1)} className={`px-3 py-1 border rounded ${currentPage===i+1?'bg-gray-300':''}`}>{i+1}</button>)}
        <button onClick={()=>setCurrentPage(p=>Math.min(pageCount,p+1))} className="px-3 py-1 border rounded">Next</button>
      </div>}

      {showModal && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md w-96">
          <h2 className="text-xl font-bold mb-4">{editingJob?"Edit Job":"Add Job"}</h2>
          <div className="mb-3"><label className="block text-sm font-medium">Title</label><input type="text" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="w-full border px-3 py-2 rounded-md"/></div>
          <div className="mb-3"><label className="block text-sm font-medium">Tags (comma separated)</label><input type="text" value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} className="w-full border px-3 py-2 rounded-md"/></div>
          <div className="mb-3"><label className="block text-sm font-medium">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full border px-3 py-2 rounded-md"><option value="active">Active</option><option value="draft">Draft</option><option value="closed">Closed</option></select></div>
          <div className="flex justify-end gap-3"><button className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400" onClick={closeModal}>Cancel</button><button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" onClick={saveJob}>{editingJob?"Save Changes":"Create Job"}</button></div>
        </div>
      </div>}
    </div>
  );
}

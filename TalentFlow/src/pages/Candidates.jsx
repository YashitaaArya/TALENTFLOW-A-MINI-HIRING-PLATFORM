import { useState } from "react";
import { candidates as mockCandidates } from "../mock/candidates";
import CandidateCard from "../components/CandidateCard";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";

export default function Candidates() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 2;

  const filtered = mockCandidates.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Candidates</h2>
      <SearchBar value={search} onChange={setSearch} placeholder="Search candidates..." />
      <div className="space-y-4 mt-4">
        {paginated.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

import StatusBadge from "./StatusBadge";

export default function CandidateCard({ candidate }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
      <div>
        <h3 className="font-semibold">{candidate.name}</h3>
        <p className="text-sm text-gray-500">{candidate.email}</p>
      </div>
      <StatusBadge status={candidate.stage} />
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/jobs", label: "Jobs" },
    { to: "/candidates", label: "Candidates" },
    { to: "/assessments", label: "Assessments" },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6 hidden md:block">
      <h2 className="text-xl font-bold mb-6">TalentFlow</h2>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`block px-3 py-2 rounded-md ${
                pathname === link.to
                  ? "bg-indigo-600 font-semibold"
                  : "hover:bg-gray-700"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

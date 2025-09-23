import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/jobs", label: "Jobs" },
    { to: "/candidates", label: "Candidates" },
    { to: "/assessments", label: "Assessments" },
  ];

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">TalentFlow</h1>
      <ul className="flex gap-6">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className={`${
                pathname === link.to
                  ? "text-indigo-600 font-semibold"
                  : "text-gray-600 hover:text-indigo-500"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

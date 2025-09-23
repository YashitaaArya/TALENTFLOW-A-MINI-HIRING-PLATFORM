import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import AssessmentsPage from "./pages/Assessments";
import AssessmentBuilder from "./pages/AssessmentBuilder";
import AssessmentTakePage from "./pages/AssessmentTake";
import AssessmentSubmissionsPage from "./pages/AssessmentSubmissions";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/candidates" element={<Candidates />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/assessments/new" element={<AssessmentBuilder />} />
        <Route path="/assessments/:id" element={<AssessmentBuilder />} />
        <Route path="/assessments/:id/take" element={<AssessmentTakePage />} />
        <Route path="/assessments/:id/submissions" element={<AssessmentSubmissionsPage />} />


      </Route>
    </Routes>
  );
}

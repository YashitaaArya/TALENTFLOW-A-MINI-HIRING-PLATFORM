import { jobs } from "../mock/jobs";
import { candidates } from "../mock/candidates";
import { assessments } from "../mock/assessments";
import StatusBadge from "../components/StatusBadge";
import { Briefcase, Users, FileCheck, TrendingUp, Clock, Award } from "lucide-react";

export default function Dashboard() {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const archivedJobs = jobs.filter((j) => j.status === "archived").length;

  const totalCandidates = candidates.length;
  const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];
  const candidatesByStage = stages.map(
    (stage) => candidates.filter((c) => c.stage === stage).length
  );

  const totalAssessments = assessments.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 text-lg">Your recruitment analytics at a glance</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Jobs Card */}
          <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-indigo-100 rounded-2xl group-hover:bg-indigo-200 transition-colors">
                    <Briefcase className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Jobs</h3>
                </div>
                <TrendingUp className="w-5 h-5 text-indigo-500 opacity-60" />
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-gray-900">{totalJobs}</p>
                  <p className="text-sm font-medium text-gray-500">Total Positions</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-lg font-bold text-green-700">{activeJobs}</p>
                    <p className="text-xs font-medium text-green-600">Active</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-lg font-bold text-gray-700">{archivedJobs}</p>
                    <p className="text-xs font-medium text-gray-600">Archived</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Candidates Card */}
          <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-emerald-100 rounded-2xl group-hover:bg-emerald-200 transition-colors">
                    <Users className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Candidates</h3>
                </div>
                <Users className="w-5 h-5 text-emerald-500 opacity-60" />
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-gray-900">{totalCandidates}</p>
                  <p className="text-sm font-medium text-gray-500">Total Applicants</p>
                </div>
                
                <div className="space-y-2">
                  {stages.map((stage, i) => (
                    <div
                      key={stage}
                      className="flex justify-between items-center p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="text-xs font-medium text-gray-700 capitalize">{stage}</span>
                      <span className="text-sm font-bold text-gray-900 bg-white px-2 py-1 rounded-full">
                        {candidatesByStage[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Assessments Card */}
          <div className="group relative overflow-hidden bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors">
                    <FileCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Assessments</h3>
                </div>
                <Award className="w-5 h-5 text-purple-500 opacity-60" />
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-black text-gray-900">{totalAssessments}</p>
                  <p className="text-sm font-medium text-gray-500">Total Evaluations</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Ready for Review</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Candidates Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Recent Candidates</h3>
            </div>
            <p className="text-gray-600 mt-1">Latest applications and updates</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-1">
              {candidates.slice(0, 5).map((c, index) => (
                <div
                  key={c.id}
                  className="group flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition-all duration-200 border border-transparent hover:border-gray-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {c.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-sm text-gray-500">{c.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <StatusBadge status={c.stage} />
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
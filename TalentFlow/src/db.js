import Dexie from "dexie";

const db = new Dexie("TalentFlowDB");
db.version(1).stores({
  jobs: "id,title,slug,status,tags,order",
  candidates: "id,name,email,stage,jobId",
  assessments: "jobId,questions",
  submissions: "jobId,responses",
});

export default db;

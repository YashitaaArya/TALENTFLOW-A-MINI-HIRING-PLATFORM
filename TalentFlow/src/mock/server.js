import { createServer, Model, Factory, Response } from "miragejs";

export function makeServer({ environment = "development" } = {}) {
  return createServer({
    environment,
    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
      submission: Model,
    },
    factories: {
      job: Factory.extend({
        title(i) {
          return `Job ${i + 1}`;
        },
        slug(i) {
          return `job-${i + 1}`;
        },
        status() {
          return Math.random() > 0.3 ? "active" : "archived";
        },
        tags() {
          const tags = ["frontend", "backend", "devops"];
          return tags.sort(() => 0.5 - Math.random()).slice(0, 2);
        },
        order(i) {
          return i + 1;
        },
      }),
      candidate: Factory.extend({
        name(i) {
          return `Candidate ${i + 1}`;
        },
        email(i) {
          return `candidate${i + 1}@example.com`;
        },
        stage() {
          const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];
          return stages[Math.floor(Math.random() * stages.length)];
        },
      }),
      assessment: Factory.extend({
        title(i) {
          return `Assessment ${i + 1}`;
        },
        questions() {
          return Array.from({ length: 10 }, (_, i) => ({
            id: `${i + 1}`,
            type: ["single", "multi", "short", "long", "numeric", "file"][Math.floor(Math.random() * 6)],
            question: `Question ${i + 1}`,
            required: Math.random() > 0.2,
          }));
        },
      }),
    },
    seeds(server) {
      server.createList("job", 25);
      const jobs = server.schema.jobs.all().models;
      server.createList("candidate", 1000).forEach((c) => {
        c.update({ jobId: jobs[Math.floor(Math.random() * jobs.length)].id });
      });
      jobs.slice(0, 3).forEach((job) => {
        server.create("assessment", { jobId: job.id });
      });
    },
    routes() {
      this.namespace = "api";
      this.get("/jobs", (schema, request) => {
        const search = request.queryParams.search || "";
        const filtered = schema.jobs.all().models.filter((job) =>
          job.title.toLowerCase().includes(search.toLowerCase())
        );
        return filtered;
      });
      this.post("/jobs", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.jobs.create(attrs);
      });
      this.patch("/jobs/:id", (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const job = schema.jobs.find(id);
        if (!job) return new Response(404);
        return job.update(attrs);
      });
      this.get("/candidates", (schema, request) => {
        const search = request.queryParams.search || "";
        const stage = request.queryParams.stage || "";
        let filtered = schema.candidates.all().models;
        if (search)
          filtered = filtered.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.email.toLowerCase().includes(search.toLowerCase())
          );
        if (stage) filtered = filtered.filter((c) => c.stage === stage);
        return filtered;
      });
      this.post("/candidates", (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        return schema.candidates.create(attrs);
      });
      this.patch("/candidates/:id", (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const candidate = schema.candidates.find(id);
        if (!candidate) return new Response(404);
        return candidate.update(attrs);
      });
      this.get("/candidates/:id/timeline", () => {
        return [
          { stage: "applied", date: "2025-01-01" },
          { stage: "screen", date: "2025-01-03" },
        ];
      });
      this.get("/assessments/:jobId", (schema, request) => {
        const jobId = request.params.jobId;
        const assessment = schema.assessments.findBy({ jobId });
        return assessment || { questions: [] };
      });
      this.put("/assessments/:jobId", (schema, request) => {
        const jobId = request.params.jobId;
        const attrs = JSON.parse(request.requestBody);
        let assessment = schema.assessments.findBy({ jobId });
        if (assessment) {
          return assessment.update(attrs);
        } else {
          return schema.assessments.create({ jobId, ...attrs });
        }
      });
      this.post("/assessments/:jobId/submit", (schema, request) => {
        const jobId = request.params.jobId;
        const attrs = JSON.parse(request.requestBody);
        return schema.submissions.create({ jobId, ...attrs });
      });
    },
  });
}

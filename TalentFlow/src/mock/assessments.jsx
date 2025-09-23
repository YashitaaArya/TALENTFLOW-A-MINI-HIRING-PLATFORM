export const assessments = [
  {
    id: 1,
    jobId: 1,
    title: "Frontend Developer Assessment",
    questions: [
      {
        id: 1,
        type: "single-choice",
        question: "What is React?",
        options: ["Library", "Framework", "Language", "Database"],
        required: true
      },
      {
        id: 2,
        type: "short-text",
        question: "Explain the useState hook.",
        required: true,
        maxLength: 200
      }
    ]
  },
  {
    id: 2,
    jobId: 2,
    title: "Backend Developer Assessment",
    questions: []
  }
];

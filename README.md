# TALENTFLOW – A Mini Hiring Platform  

A **front-end React application** simulating a hiring platform designed for HR teams to manage **Jobs, Candidates, and Assessments**.  

This project was built as part of the **ENTNT Software Engineer Intern technical assignment**.  

- [**Live Demo**](https://ymam-work-tktx.vercel.app/)  
- [**GitHub Repository**](https://github.com/YashitaaArya/TALENTFLOW-A-MINI-HIRING-PLATFORM)

---

## Live App Walkthrough  

When you open the deployed app:  
- The app loads with the **default Vite + React title** (branding can be improved).  
- A **navigation bar / entry point** is visible to access **Jobs, Candidates, and Assessments**.  
- Currently seeded data may not always appear instantly (due to mock API latency and errors).  
- The UI is responsive and works on desktop; mobile responsiveness is present but can be enhanced.  
- All persistence is handled in **IndexedDB** so refreshing retains state locally.  

---

## Features  

### Jobs Management  
- Create, edit, and archive jobs.  
- Pagination, filtering by **title, status, tags**.  
- Drag-and-drop reordering with **optimistic updates** and rollback on errors.  
- Deep linking to job details (`/jobs/:jobId`).  

### Candidates Management  
- Virtualized list for **1000+ seeded candidates**.  
- Search by name/email + filter by stage.  
- Candidate profile (`/candidates/:id`) showing **status timeline**.  
- Kanban board for moving candidates across stages (drag-and-drop).  
- Notes with simple `@mentions` (render-only).  

### Assessments  
- Job-specific assessment builder with:  
  - Single choice, multiple choice  
  - Short/long text  
  - Numeric with ranges  
  - File upload stub  
- Live preview panel for assessments.  
- Validation: required fields, numeric ranges, max length.  
- Conditional questions (e.g., show Q3 only if Q1 = "Yes").  
- Candidate responses stored locally.  

### Simulated API (No Backend)  
- **MSW / MirageJS** used to simulate REST APIs.  
- Endpoints supported:  
  - `/jobs`  
  - `/candidates`  
  - `/assessments`  
- **Latency (200–1200ms)** and **5–10% error injection** mimic real-world servers.  
- Persistence through **IndexedDB (Dexie.js/localForage)**.  

---

## Tech Stack  

- **React (Vite)** – Frontend framework  
- **TypeScript** – Type safety  
- **Redux Toolkit / Zustand** – State management  
- **React Query** – Data fetching & caching  
- **React Router** – Routing  
- **MSW / MirageJS** – Mock API simulation  
- **Dexie.js** – IndexedDB persistence  
- **TailwindCSS** – Styling  
- **React Beautiful DnD** – Drag-and-drop  

---

## 📂 Project Structure  

```
talentflow/
│── public/
│── src/
│ ├── api/ # Mock API setup
│ ├── components/ # Reusable UI
│ ├── features/ # Jobs, Candidates, Assessments
│ ├── hooks/ # Custom hooks
│ ├── pages/ # Route pages
│ ├── store/ # State management
│ └── utils/ # Helpers
│── package.json
│── README.md
```

---

## Setup & Installation  

### Prerequisites  
- Node.js >= 18  
- npm or yarn  

### Steps  

### Clone repository
```
git clone https://github.com/YashitaaArya/TALENTFLOW-A-MINI-HIRING-PLATFORM.git
```
### Navigate into folder
```
cd TALENTFLOW-A-MINI-HIRING-PLATFORM
```
### Install dependencies
```
npm install
```
### Run dev server
```
npm run dev
```

Now open:
(`http://localhost:5173`)

## Credentials

This app is front-end only. Authentication is mocked.
### Admin/HR Login
 - Email: admin@talentflow.com
 - Password: admin123

### Candidate Access
Direct via navigation (no signup required).

---

### Testing
- Jest + React Testing Library for unit/integration tests.
- MSW for API mocking in tests.

### Run
``` npm run test ```

---

## Technical Decisions

- Used MSW/MirageJS + IndexedDB to mimic real-world apps without backend.
- React Query improves caching & error handling.
- Optimistic UI for drag-and-drop smoothness.
- Dexie.js handles IndexedDB persistence better than raw API.

## Known Issues & Limitations
- File uploads are stubs, not stored.
- 5–10% simulated error rate may cause retries.
- IndexedDB clears if browser storage is reset.
- Default Vite title still shows (to be customized).

## Deployment

Deployed on Vercel: Live Demo

---

## Future Improvements
- Backend integration (Node.js/Express + MongoDB).
- Real authentication & role-based access.
- Email notifications for stage changes.
- Analytics dashboard for HR insights.

---

### Author

- Yashitaa Arya
- B.Tech CSE, NIT Hamirpur
- GitHub: @YashitaaArya
- Email:
    - 22bcs120@nith.ac.in
    - yashitaaarya23@gmail.com 
---

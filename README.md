# Innovation Lab ZA

<p align="center">
  <a href="https://github.com/Letsoperate/Innovation-Labs-ZA/actions/workflows/ci.yml"><img src="https://github.com/Letsoperate/Innovation-Labs-ZA/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://innovation-lab-za.vercel.app"><img src="https://img.shields.io/badge/deploy-live-000?logo=vercel&labelColor=000" alt="Vercel" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT" />
  <img src="https://img.shields.io/github/languages/top/Letsoperate/Innovation-Labs-ZA" alt="Top Language" />
  <img src="https://img.shields.io/github/last-commit/Letsoperate/Innovation-Labs-ZA" alt="Last Commit" />
  <img src="https://img.shields.io/github/repo-size/Letsoperate/Innovation-Labs-ZA" alt="Repo Size" />
</p>

A product discovery platform for South African indie makers. Submit your projects, get upvoted, rank on the leaderboard, and connect with the community.

**Live:** [innovation-lab-za.vercel.app](https://innovation-lab-za.vercel.app)

---

## Features

- **Leaderboard** — Weekly, monthly, and all-time rankings by community engagement score
- **Project submission** — 3-step form with name, description, website URL, screenshot upload, tags, and tech stack
- **Live preview** — Embedded iframe preview of submitted websites on project detail pages
- **Upvotes & comments** — Community voting and discussion
- **Categories** — AI/ML, Developer Tools, Design, Productivity, Fintech, SaaS, Mobile, and more
- **Maker profiles** — Customizable profiles with avatar, bio, social links, and project portfolios
- **Discovery** — Search by name, filter by category, sort by trending or recent

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS 3, shadcn/ui, Framer Motion, CRACO |
| Backend | FastAPI (Python), Motor (async MongoDB driver) |
| Database | MongoDB |
| Auth | JWT (HS256), bcrypt, httpOnly cookies |
| Deployment | Vercel (frontend + backend serverless) |

## Getting Started

**Prerequisites:** Node.js 18+, Python 3.10+, MongoDB, Yarn

### Backend

```bash
cd backend
pip install -r requirements.txt
export MONGO_URL="mongodb://localhost:27017"
export DB_NAME="innovation_lab_za"
export JWT_SECRET="dev-secret-key"
uvicorn server:app --reload --port 8000
```

### Frontend

```bash
cd frontend
yarn install
yarn start
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:8000`.

Demo seed data (projects and users) auto-populates on first backend startup.

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@innovationlabza.dev | admin123 |
| Demo User | demo@innovationlabza.dev | demo123 |

## Project Structure

```
├── backend/
│   ├── server.py          # FastAPI application
│   ├── requirements.txt   # Python dependencies
│   ├── uploads/           # Local file storage
│   └── tests/             # pytest test suite
├── frontend/
│   ├── public/            # Static assets, logo, HTML template
│   └── src/
│       ├── components/    # Reusable UI components (Header, Footer, ProjectCard, etc.)
│       ├── pages/         # Page components (Home, Discover, Leaderboard, etc.)
│       ├── context/       # Auth context
│       ├── hooks/         # Custom hooks
│       └── lib/           # API client, utilities
└── vercel.json            # Vercel deployment config
```

## License

MIT

# PipeForge

AI-powered CI/CD pipeline generator. Describe your stack and get a production-ready pipeline in seconds.

## Features

- **Generate** — Describe your stack in plain English, pick a platform, get complete YAML
- **Migrate** — Convert an existing pipeline between platforms
- **Debug** — Paste a broken pipeline and error message; get a diagnosis and fixed config
- **Explain** — Click any step to understand what it does in plain English
- **Save** — Store, star, and search your generated configs for later reuse

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + CodeMirror 6 |
| Backend | Fastify + TypeScript + Drizzle ORM + libSQL (SQLite) |
| AI | Anthropic Claude via streaming SSE |

## Supported platforms

| Platform | Config file |
|---|---|
| GitHub Actions | `.github/workflows/ci.yml` |
| GitLab CI | `.gitlab-ci.yml` |
| CircleCI | `.circleci/config.yml` |
| Bitbucket Pipelines | `bitbucket-pipelines.yml` |
| Jenkins | `Jenkinsfile` |

## Getting started

```bash
# 1. Install
pnpm install

# 2. Configure
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env

# 3. Run
pnpm dev
```

Client: http://localhost:5173
API: http://localhost:3001

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start client and server in watch mode |
| `pnpm build` | Build both packages |
| `pnpm start` | Start the production server |
| `pnpm db:migrate` | Run database migrations |
| `pnpm typecheck` | TypeScript check across all packages |

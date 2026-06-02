# Deployment

This guide deploys the API as a Docker-backed service and the Vite web app on Vercel.

## Preflight

Run these locally before promoting a commit:

```bash
npm install
npm run typecheck
npm run test:safety
npm run build
```

The API health endpoint is `GET /health`. The generated route docs are available at `GET /docs` and `GET /docs.json`.

## Environment

Start from `.env.production.example` and configure platform secrets instead of committing real values.

Required API values:

```bash
NODE_ENV=production
HOST=0.0.0.0
REENTRY_DB_PATH=/data/reentry.sqlite
REENTRY_SEED_DEMO=false
```

Optional AI adapter values:

```bash
AI_API_KEY=
OPENAI_API_KEY=
AI_BASE_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-4o-mini
```

Optional Google Health OAuth values:

```bash
GOOGLE_HEALTH_CLIENT_ID=
GOOGLE_HEALTH_CLIENT_SECRET=
GOOGLE_HEALTH_REDIRECT_URI=https://your-api-host.example.com/google-health/callback
```

Leave these blank to keep the mock wearable import fallback. Production token storage must be encrypted; the prototype keeps tokens in memory only.

Required web value:

```bash
VITE_API_BASE_URL=https://your-api-host.example.com
```

Vite only exposes client-side environment variables that use the `VITE_` prefix.

## API On Render

Use Render when you want the API in a Docker web service with an attached persistent disk.

1. Create a new Render Web Service from the repository.
2. Choose Docker deployment and keep the Dockerfile path as `Dockerfile` at the repo root.
3. Set environment variables from `.env.production.example`.
4. Do not hardcode `PORT`. Render web services provide a port value; the API reads `process.env.PORT` and binds to `0.0.0.0`.
5. Add a persistent disk mounted at `/data` so `REENTRY_DB_PATH=/data/reentry.sqlite` survives restarts and deploys.
6. Set the HTTP health check path to `/health`.
7. Deploy, then verify `/health`, `/docs`, and `/docs.json`.

Notes:

- Render's default filesystem is ephemeral; only files under the disk mount persist.
- A Render service with a persistent disk is single-instance and may have a short redeploy interruption because the disk cannot be mounted by two running instances at once.
- If ReEntry needs horizontal scaling later, move from SQLite on disk to a managed database before scaling past one API instance.

Official references:

- [Render Docker docs](https://render.com/docs/docker)
- [Render web services](https://render.com/docs/web-services)
- [Render health checks](https://render.com/docs/health-checks)
- [Render persistent disks](https://render.com/docs/disks)

## API On Railway

Use Railway as the alternate Docker backend host.

1. Create a Railway service from the repository.
2. Let Railway build from the root `Dockerfile`.
3. Add a public domain under Networking.
4. Keep `HOST=0.0.0.0`; Railway injects `PORT`, and the API listens on that value.
5. Add a volume mounted at `/data` and set `REENTRY_DB_PATH=/data/reentry.sqlite`.
6. Configure the healthcheck path as `/health`.
7. Deploy, then verify `/health`, `/docs`, and `/docs.json`.

Official references:

- [Railway public networking](https://docs.railway.com/networking/public-networking)
- [Railway healthchecks](https://docs.railway.com/deployments/healthchecks)

## Web On Vercel

Deploy the React/Vite app as a Vercel project connected to the same repository.

Recommended monorepo settings:

```text
Install Command: npm install
Build Command: npm run build --workspace @reentry/web
Output Directory: apps/web/dist
```

Set this Vercel environment variable for Production and Preview:

```bash
VITE_API_BASE_URL=https://your-api-host.example.com
```

Official references:

- [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [Vercel monorepos](https://vercel.com/docs/monorepos)

## Production Checklist

- `npm run test:safety` passes before deployment.
- `REENTRY_SEED_DEMO=false` is set for real environments.
- API `/health` returns `ok: true`.
- Web `VITE_API_BASE_URL` points to the deployed API origin.
- Google Health callback URL in Google Cloud exactly matches `GOOGLE_HEALTH_REDIRECT_URI` if live OAuth is enabled.
- CORS is narrowed before a public launch. The current API uses permissive CORS for hackathon/demo development.
- SQLite disk/volume backups are configured if real user data is stored.

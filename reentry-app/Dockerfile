FROM node:24-slim

WORKDIR /app

COPY package.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN npm install

COPY . .

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787
ENV REENTRY_DB_PATH=/data/reentry.sqlite
ENV REENTRY_SEED_DEMO=false

RUN mkdir -p /data

EXPOSE 8787

CMD ["npm", "run", "serve", "--workspace", "@reentry/api"]

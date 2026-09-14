FROM node:22-alpine AS api

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci --workspace=@reellora/api --include-workspace-root

COPY apps/api ./apps/api

RUN npm run build:api

EXPOSE 3000

CMD ["npm", "run", "start:api"]

FROM node:22-alpine AS web

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci --workspace=@reellora/web --include-workspace-root

COPY apps/web ./apps/web

RUN npm run build:web

ENV HOST=0.0.0.0
ENV PORT=3500

EXPOSE 3500

CMD ["node", "apps/web/.output/server/index.mjs"]

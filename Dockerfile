FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN npm ci --workspace=@reellora/api --include-workspace-root

COPY apps/api ./apps/api

RUN npm run build:api

EXPOSE 3000

CMD ["npm", "run", "start:api"]

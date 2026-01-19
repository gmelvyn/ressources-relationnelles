FROM node:24-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

RUN --mount=type=cache,target=/root/.npm \
  npm install --workspace=apps/api

COPY apps/api ./apps/api
WORKDIR /app/apps/api
RUN npm run build

FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

RUN --mount=type=cache,target=/root/.npm \
  npm install --workspace=apps/api --only=production

COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
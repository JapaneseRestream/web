FROM docker.io/library/node:20-slim AS base

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app


FROM base AS build

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma prisma

CMD ["npx", "prisma", "migrate", "deploy"]

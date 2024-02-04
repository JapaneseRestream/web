FROM docker.io/library/node:20-slim AS base

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app


FROM base AS build

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma prisma
RUN npx prisma generate

COPY panda.config.ts postcss.config.cjs tsconfig.json vite.config.ts ./
COPY src src
COPY vendors vendors

RUN NODE_ENV=production npm run build


FROM base AS node_modules

COPY package.json package-lock.json ./

RUN npm ci --omit=dev


FROM base

COPY package.json ./

COPY --from=node_modules /app/node_modules node_modules
COPY --from=build /app/build build
COPY --from=build /app/out out
COPY --from=build /app/styled-system styled-system

COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client /app/node_modules/@prisma/client

ENV NODE_ENV=production

CMD [ "node", "--enable-source-maps", "out/main.js" ]

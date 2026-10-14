FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/desktop/package.json apps/desktop/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter desktop build

FROM base
ENV NODE_ENV=production
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/apps/desktop/build /app/apps/desktop/build
COPY --from=build /app/apps/desktop/package.json /app/apps/desktop/package.json
WORKDIR /app/apps/desktop
CMD ["pnpm", "start"]

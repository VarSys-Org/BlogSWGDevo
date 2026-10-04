FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
ARG SITE_URL=https://swagamerz.varsys.co.in
ENV SITE_URL=${SITE_URL}
ENV NODE_ENV=production
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
LABEL org.opencontainers.image.source="https://github.com/VarSys-Org/BlogSWGDevo"
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/content ./content
USER node
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# SITE_URL נדרש בזמן build בשביל sitemap ו-canonical
ARG SITE_URL=http://localhost:3000
ENV SITE_URL=$SITE_URL
ARG SITE_INDEXING=off
ENV SITE_INDEXING=$SITE_INDEXING
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATA_DIR=/data
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/data ./data
RUN mkdir -p /data
EXPOSE 3000
CMD ["node", "server.js"]

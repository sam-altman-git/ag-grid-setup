# -------- Stage 1: Build the app --------
#FROM node:18 AS builder
FROM public.ecr.aws/docker/library/node:18 AS builder
WORKDIR /app
COPY . .
COPY .env .env
ENV NODE_OPTIONS="--max-old-space-size=7168"
RUN corepack enable && yarn install && yarn build

# -------- Stage 2: Run the app --------
#FROM node:18-alpine AS runner
FROM public.ecr.aws/docker/library/node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Optional: expose only necessary files
# COPY --from=builder /app/public ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["yarn", "start"]

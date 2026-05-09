FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Usar corepack para pnpm (incluido en Node 18+)
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# Eliminar dependencias de desarrollo para dejar sólo producción
RUN pnpm prune --prod

# Garantizar que `typescript` esté presente en node_modules para evitar que
# Next intente instalarlo al arrancar si existe `next.config.ts`.
# Usamos `npm --no-save` para no modificar package.json/lockfile.
RUN npm install typescript --no-save || true

## Distroless Node 20 images are not always available on all registries.
## Use official slim image as a reliable runtime fallback.
FROM node:20-slim
WORKDIR /app
## Copy only build artifacts and production node_modules to avoid bringing
## TypeScript source files (like next.config.ts) into the runtime image.
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
ENV NODE_ENV=production
EXPOSE 3000

# Ejecutar Next.js en modo producción (usa el binario JS directo)
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3000"]

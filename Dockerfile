# ==========================================
# STAGE 1 : BUILDER (Compilation du projet)
# ==========================================
FROM node:20-alpine AS builder

# Requis pour certains packages C++ (ex: bcrypt, crypto natif si applicable)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# On copie uniquement les trackers de dépendances pour utiliser le cache Docker
COPY package.json package-lock.json ./
RUN npm ci

# Copie du reste du code source
COPY . .

# On n'applique pas la télémétrie Next.js pour accélérer le build
ENV NEXT_TELEMETRY_DISABLED 1

# Compilation Next.js (Cela générera le dossier /app/.next/standalone via next.config.ts)
RUN npm run build

# ==========================================
# STAGE 2 : RUNNER (Image Finale de Production)
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 8080

# Recommandation de sécurité : Créer un utilisateur non-root exclusif
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# On rapatrie juste les dossiers "public" pour le SSR
COPY --from=builder /app/public ./public

# On copie le bundle "Standalone" ultra-léger généré par Next.js
# Note: Ces dossiers ont été tracés et réduits drastiquement grâce à l'Output Standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch sur l'utilisateur restreint
USER nextjs

# Exposition du port GCP Cloud Run par défaut
EXPOSE 8080

# Health check et exécution du mini-serveur Node généré par le Standalone
CMD ["node", "server.js"]

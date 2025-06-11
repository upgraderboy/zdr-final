# Install dependencies only when needed
FROM node:23.7.0-alpine AS deps

WORKDIR /app

# Install dependencies with retry mechanism
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Build the app
FROM node:23.7.0-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM node:23.7.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder instead of reinstalling
COPY --from=builder /app/package.json ./
#COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./.next/standalone/public
COPY --from=builder /app/.next ./.next
COPY .env ./

# Clean up unnecessary files
RUN rm -rf ./.next/cache

# Move static files to standalone directory
RUN  mv ./.next/static ./.next/standalone/

# Set environment variable to ensure binding to 0.0.0.0
ENV HOSTNAME=0.0.0.0

EXPOSE 3000

CMD ["npm", "start"]
# ==============================================================================
# CMS Frontend Dockerfile
# ==============================================================================
# Multi-stage build for optimized production image
#
# Stage 1 (builder): Build the React application with Vite
# Stage 2 (runner): Serve static files with Nginx
#
# Build: docker build -t cms-frontend .
# Run: docker run -p 80:80 cms-frontend
# ==============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Stage
# Uses Node.js to compile TypeScript and build the React application
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
# This allows Docker to cache npm install if dependencies haven't changed
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
# Note: Use .dockerignore to exclude node_modules, dist, etc.
COPY . .

# Build argument for API URL (can be overridden during build)
# Example: docker build --build-arg VITE_API_BASE=https://api.yourdomain.com -t cms-frontend .
ARG VITE_API_BASE=http://localhost:4000
ENV VITE_API_BASE=${VITE_API_BASE}

# Build the application for production
# This creates optimized static files in the dist/ directory
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Production Stage
# Uses Nginx to serve static files efficiently
# -----------------------------------------------------------------------------
FROM nginx:alpine AS runner

# Copy custom Nginx configuration
# This handles SPA routing (all routes -> index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for HTTP traffic
EXPOSE 80

# Health check for container orchestration (Docker Compose, Kubernetes)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start Nginx in foreground mode (required for Docker)
CMD ["nginx", "-g", "daemon off;"]

# Multi-stage build for production-ready Ignition AI Project Dashboard
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user for security
RUN addgroup -g 1001 -S ignition && \
    adduser -S ignition -u 1001 -G ignition

# Set proper permissions
RUN chown -R ignition:ignition /usr/share/nginx/html && \
    chown -R ignition:ignition /var/cache/nginx && \
    chown -R ignition:ignition /var/log/nginx && \
    chown -R ignition:ignition /etc/nginx/conf.d

# Switch to non-root user
USER ignition

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Labels for metadata
LABEL maintainer="Ignition AI Team" \
      version="1.0.0" \
      description="Ignition AI Project Dashboard - Production Container" \
      org.opencontainers.image.source="https://github.com/your-org/ignition" \
      org.opencontainers.image.documentation="https://github.com/your-org/ignition/blob/main/README.md"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

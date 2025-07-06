# Use official Node.js base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install dependencies for Chromium
RUN apt-get update && apt-get install -y \
    wget gnupg ca-certificates curl \
    libxss1 libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2 \
    libatspi2.0-0 libgtk-3-0 libx11-xcb1 libxcb-dri3-0 libxcb1 \
    libpangocairo-1.0-0 libcairo2 libcups2 libdbus-1-3 libexpat1 \
    libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libnspr4 libpango-1.0-0 libstdc++6 libx11-6 \
    libxcursor1 libxext6 libxfixes3 libxi6 libxrender1 libxtst6 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Copy only package files first for better Docker caching
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Install Playwright browsers (this is crucial!)
RUN npx playwright install chromium

# Copy the rest of the application code
COPY . .

# Create non-root user for safer execution
RUN groupadd -r appuser && useradd -r -g appuser appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose app port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Start the app
CMD ["npm", "start"]

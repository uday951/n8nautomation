# Use official Playwright image with all dependencies and browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.53.2-jammy

# Set working directory inside the container
WORKDIR /app

# Copy only package.json files first to leverage Docker cache
COPY package.json package-lock.json* ./

# Install Node.js dependencies
RUN npm install

# Copy rest of the app files
COPY . .

# Expose the port (Render expects this)
EXPOSE 3000

# Start your application
CMD ["node", "index.js"]

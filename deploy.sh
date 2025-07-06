#!/bin/bash

# LinkedIn Automation Deployment Script
echo "🚀 Deploying LinkedIn Automation..."

# Check if we're in a supported platform
if [ -n "$PORT" ]; then
    echo "✅ Detected cloud platform (PORT: $PORT)"
else
    echo "⚠️  Running locally (PORT: 3000)"
    export PORT=3000
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Install Playwright browsers
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium --with-deps

# Start the application
echo "🚀 Starting LinkedIn automation server..."
npm start 
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

# Install Playwright browsers (crucial for automation)
echo "🌐 Installing Playwright browsers..."
npx playwright install chromium

# Verify browser installation
echo "🔍 Verifying browser installation..."
if [ -d "/home/appuser/.cache/ms-playwright" ] || [ -d "$HOME/.cache/ms-playwright" ]; then
    echo "✅ Playwright browsers installed successfully"
else
    echo "⚠️  Browser installation may have failed, but continuing..."
fi

# Start the application
echo "🚀 Starting LinkedIn automation server..."
npm start 
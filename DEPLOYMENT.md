# Deployment Guide

## Quick Deploy Options

### 1. Railway (Recommended)
1. Connect your GitHub repo to Railway
2. Railway will auto-detect and deploy
3. Set environment variables if needed
4. Your app will be live at `https://your-app.railway.app`

### 2. Render
1. Connect your GitHub repo to Render
2. Create a new Web Service
3. Build Command: `npm ci && npx playwright install chromium --with-deps`
4. Start Command: `npm start`
5. Your app will be live at `https://your-app.onrender.com`

### 3. Heroku
1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Run: `git push heroku main`
4. Your app will be live at `https://your-app-name.herokuapp.com`

### 4. Vercel
1. Connect your GitHub repo to Vercel
2. Vercel will auto-detect and deploy
3. Your app will be live at `https://your-app.vercel.app`

## Environment Variables

Set these in your cloud platform:
- `PORT` - Server port (auto-set by platform)
- `NODE_ENV` - Set to `production`

## Cookie Management

### Before Deployment
1. Run locally: `npm run save-cookies`
2. Login to LinkedIn in the browser
3. Cookies will be saved to `cookies.json`

### After Deployment
1. Download the `cookies.json` file from your local machine
2. Upload it to your cloud platform (if supported)
3. Or use the platform's file system to store cookies

## Testing Your Deployment

1. **Health Check:**
   ```
   GET https://your-app-url.com/
   ```

2. **Test Post:**
   ```bash
   curl -X POST https://your-app-url.com/post \
     -H "Content-Type: application/json" \
     -d '{"text": "Hello from deployed app!"}'
   ```

## Troubleshooting

### Build Failures
- Ensure platform supports Node.js 18+
- Check build logs for Playwright installation issues
- Some platforms may need additional build time

### Runtime Issues
- Check if cookies.json exists and is valid
- Verify LinkedIn session hasn't expired
- Monitor logs for automation errors

### Platform-Specific Issues

#### Railway
- Uses `Procfile` automatically
- Supports file uploads for cookies.json

#### Render
- Uses `render.yaml` configuration
- May need longer build time for Playwright

#### Heroku
- Uses `Procfile` automatically
- May need buildpack for Playwright

#### Vercel
- Serverless deployment
- May have limitations with Playwright 
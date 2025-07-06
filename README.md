# LinkedIn Post Creator

A Node.js application that automates posting to LinkedIn using Playwright with cookie-based authentication.

## Quick Start with Docker

### 1. Build and Run with Docker Compose (Recommended)
```bash
# Build and start the application
docker-compose up --build -d

# Check logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### 2. Manual Docker Commands
```bash
# Build the Docker image
docker build -t linkedin-automation .

# Run the container
docker run -p 3000:3000 -v $(pwd)/cookies.json:/app/cookies.json linkedin-automation
```

## Setup (Local Development)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Save LinkedIn cookies (one-time setup):**
   ```bash
   npm run save-cookies
   ```
   This will open a browser window where you can login to LinkedIn manually. The cookies will be saved for future use.

3. **Optional: Set Chrome path (if Chrome is not in standard location):**
   ```
   CHROME_PATH=C:\path\to\your\chrome.exe
   ```

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Health check:**
   ```
   GET http://localhost:3000/
   ```

3. **Create a LinkedIn post:**
   ```bash
   POST http://localhost:3000/post
   Content-Type: application/json
   
   {
     "text": "Your LinkedIn post content here"
   }
   ```

## API Endpoints

- `GET /` - Health check
- `POST /post` - Create a LinkedIn post
  - Body: `{ "text": "post content" }`

## Docker Deployment

### Production Deployment
```bash
# Build the image
docker build -t linkedin-automation .

# Run with persistent cookies
docker run -d \
  --name linkedin-automation \
  -p 3000:3000 \
  -v $(pwd)/cookies.json:/app/cookies.json \
  --restart unless-stopped \
  linkedin-automation
```

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (default: production)

### Volume Mounts
- `./cookies.json:/app/cookies.json` - Persist LinkedIn cookies

## Cookie Authentication

This app uses cookie-based authentication instead of username/password:

1. **First time setup:** Run `npm run save-cookies` and login manually
2. **Cookies are saved** to `cookies.json` for future use
3. **Session expires:** If you get "Session expired" errors, re-run the save-cookies script

## Browser Requirements

The app will try to use your system's Chrome browser first. If not found, it will attempt to use Playwright's Chromium.

## Troubleshooting

### Docker Issues
- **Build fails:** Ensure Docker has enough memory (4GB+ recommended)
- **Chrome not found:** The Docker image includes all necessary dependencies
- **Permission errors:** The container runs as non-root user

### LinkedIn Issues
- **Session expired:** Re-run `npm run save-cookies` to update cookies
- **Button not found:** Check `linkedin-debug.png` for current UI state
- **Rate limiting:** LinkedIn may block automated posting - use sparingly

## Security Notes

- Cookies are stored locally in `cookies.json`
- No password storage required
- Monitor for LinkedIn's anti-automation measures
- Consider using 2FA-compatible authentication 